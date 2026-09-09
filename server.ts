import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Server-side Gemini AI client initialization
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// In-memory live synchronization store for real-time classroom progress
interface SyncRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  major: string;
  issue: string;
  lab: string;
  researchQuestion: string;
  sessionsCompleted: number;
  reportCount: number;
  rubricScore: number;
  studentRecordCount: number;
  walkingEngagementScore: number;
  updatedAt: string;
  fullData: any;
}

const syncStore: Map<string, SyncRecord> = new Map();
let serverTeacherWebhookUrl: string = process.env.TEACHER_SHEET_WEBHOOK_URL || "";

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasTeacherWebhook: Boolean(serverTeacherWebhookUrl),
    timestamp: new Date().toISOString(),
  });
});

// Teacher Google Sheet Webhook Global Registry
app.get("/api/sync/teacher-webhook", (_req, res) => {
  res.json({
    ok: true,
    webhookUrl: serverTeacherWebhookUrl,
  });
});

app.post("/api/sync/teacher-webhook", (req, res) => {
  const { webhookUrl } = req.body || {};
  if (typeof webhookUrl === "string") {
    serverTeacherWebhookUrl = webhookUrl.trim();
    console.log("[Sync] Global teacher sheet webhook updated:", serverTeacherWebhookUrl ? "Set" : "Cleared");
  }
  res.json({
    ok: true,
    webhookUrl: serverTeacherWebhookUrl,
    message: "교사용 구글 시트 웹훅 URL이 전역 서버에 등록되었습니다. 이제 모든 학생의 제출물이 이 시트로 자동 전송됩니다.",
  });
});

// Real-time synchronization endpoint
app.post(["/api/sync", "/api/sync/student-progress"], async (req, res) => {
  try {
    const payload = req.body || {};
    const { submissionId, studentRecordData, data, externalWebhookUrl, teacherSheetWebhookUrl } = payload;
    
    // Support both direct payload format and nested student progress format
    const studentId = payload.studentId || studentRecordData?.["학번"] || data?.["학번"] || "미입력";
    const studentName = payload.name || studentRecordData?.["이름"] || data?.["이름"] || "학생";
    const id = submissionId || `sync_${studentId}_${Date.now()}`;
    // Fall back to server-registered global teacher webhook if not provided in payload
    const webhookUrl = (teacherSheetWebhookUrl || externalWebhookUrl || serverTeacherWebhookUrl || "").trim();

    const reportCount = payload.reportDraft
      ? Object.values(payload.reportDraft).filter((v) => typeof v === "string" && v.trim().length > 0).length
      : Object.keys(data || {}).filter((k) => k.startsWith("보고서 ") && Boolean(data[k])).length;

    const recordCount = payload.studentRecord
      ? Object.values(payload.studentRecord).filter((v) => typeof v === "string" && v.trim().length > 0).length
      : Number(data?.["학생부 작성 항목 수"] || 0);

    const record: SyncRecord = {
      id,
      studentId,
      studentName,
      grade: payload.grade || data?.["학년"] || "",
      major: payload.major || data?.["희망 전공"] || "",
      issue: payload.issue || data?.["관심 사회변화"] || "",
      lab: payload.labName || data?.["선택 연구실"] || "",
      researchQuestion: payload.researchQuestion || data?.["최종 탐구 질문"] || "",
      sessionsCompleted: Number(payload.completedSessions ?? data?.["완료 차시 수"] ?? 0),
      reportCount,
      rubricScore: Number(payload.rubricScores ? Object.values(payload.rubricScores).reduce((a: number, b: any) => a + (Number(b) || 3), 0) : data?.["자기평가 총점"] || 24),
      studentRecordCount: recordCount,
      walkingEngagementScore: Number(payload.walkingLogs?.length ? Math.round(payload.walkingLogs.reduce((acc: number, l: any) => acc + (l.immersionLevel || 80), 0) / payload.walkingLogs.length) : data?.["연구 몰입도 점수"] || 78),
      updatedAt: new Date().toISOString(),
      fullData: payload,
    };

    // Store record by ID
    syncStore.set(id, record);

    // Forward to Google Apps Script webhook
    let forwarded = false;
    let forwardError = null;
    if (webhookUrl && /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/i.test(webhookUrl)) {
      try {
        // Send structured payload matching Google Apps Script doPost format
        const appsScriptBody = {
          profile: {
            studentId: record.studentId,
            name: record.studentName,
            grade: record.grade,
            affiliation: payload.affiliation || data?.["소속"] || "",
            desiredMajor: record.major,
            socialIssue: record.issue,
          },
          selectedLabName: record.lab,
          researchQuestion: record.researchQuestion,
          rubricScore: record.rubricScore,
          sessionsCompleted: record.sessionsCompleted,
          reportCount: record.reportCount,
          reportDraft: payload.reportDraft || {},
          studentRecord: payload.studentRecord || {},
          walkingLogs: payload.walkingLogs || [],
          timestamp: record.updatedAt,
        };

        const fetchRes = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(appsScriptBody),
          redirect: "follow",
        });
        forwarded = fetchRes.ok;
      } catch (err: any) {
        forwardError = err?.message;
        console.warn("[Sync Forward] Error posting to Apps Script:", err?.message);
      }
    }

    res.json({
      ok: true,
      submissionId: id,
      syncedAt: record.updatedAt,
      recordsCount: syncStore.size,
      totalStudents: syncStore.size,
      forwarded,
      forwardError,
      hasTeacherWebhook: Boolean(webhookUrl),
      message: forwarded
        ? "교사용 구글 시트 및 실시간 클라우드 대시보드에 정상 동기화되었습니다."
        : "실시간 클라우드 대시보드에 정상 동기화되었습니다.",
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Summary of all synchronized student records
app.get("/api/sync/records", (_req, res) => {
  const records = Array.from(syncStore.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  res.json({
    ok: true,
    count: records.length,
    records,
    summary: {
      avgSessions: records.length
        ? Math.round((records.reduce((acc, r) => acc + r.sessionsCompleted, 0) / records.length) * 10) / 10
        : 0,
      avgReportCount: records.length
        ? Math.round((records.reduce((acc, r) => acc + r.reportCount, 0) / records.length) * 10) / 10
        : 0,
      avgRubric: records.length
        ? Math.round((records.reduce((acc, r) => acc + r.rubricScore, 0) / records.length) * 10) / 10
        : 0,
    },
  });
});

// Clear sync records endpoint
app.post("/api/sync/clear", (_req, res) => {
  syncStore.clear();
  res.json({ ok: true, message: "동기화 저장소가 초기화되었습니다." });
});

// Helper: Call Gemini models with multi-model fallback and retry logic for high demand (503) spikes
const GEMINI_CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.8-flash",
];

async function generateContentWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  systemInstruction?: string
): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;

  for (const model of GEMINI_CANDIDATE_MODELS) {
    // Retry up to 2 times for transient 503/UNAVAILABLE errors per model
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            ...(systemInstruction ? { systemInstruction } : {}),
          },
        });

        const text = response.text || "{}";
        return { text, modelUsed: model };
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isUnavailableOrRateLimited =
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED");

        if (isUnavailableOrRateLimited && attempt === 0) {
          // Wait 600ms before quick retry on transient spike
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }

        // Try next candidate model in list
        console.warn(`Model ${model} attempt ${attempt} failed, trying next candidate if available:`, errMsg);
        break;
      }
    }
  }

  throw lastError || new Error("All candidate Gemini models are currently unavailable.");
}

// Helper: Generate robust high-academic heuristic evaluation if AI services are down or rate limited
function generateHeuristicEvaluation(body: any) {
  const { question, major, issue, method } = body;
  const qLen = (question || "").length;
  const hasMajorConcept = major ? question.includes(major) || qLen > 25 : qLen > 20;
  const scoreBase = Math.min(96, Math.max(72, 75 + (hasMajorConcept ? 10 : 0) + (method ? 8 : 0)));

  return {
    ok: true,
    isAiGenerated: false,
    isFallback: true,
    notice: "AI 모델 트래픽 폭주로 인해 전공별 학술 평가 알고리즘 진단 결과가 즉시 제공되었습니다.",
    overallScore: scoreBase,
    grade: scoreBase >= 85 ? "우수 (A)" : "보통 (B)",
    criteriaScores: {
      specificity: Math.min(95, scoreBase + 2),
      feasibility: Math.min(95, scoreBase + 4),
      theoreticalLinkage: hasMajorConcept ? 88 : 76,
      methodologicalRigor: method ? 86 : 74,
      originality: Math.min(92, scoreBase - 2),
    },
    strengths: [
      `사회적 쟁점(${issue || "선택 이슈"})을 희망 전공(${major || "전공"}) 시각에서 구체적인 탐구 문제로 전환하려는 의도가 돋보입니다.`,
      method ? `${method}이라는 실증적인 조사 방법론을 명시하여 현장 걷기와 원자료 수집의 실행 가능성을 높였습니다.` : "탐구 대상과 사회현상 간의 상호작용 관계를 명확히 조망하고 있습니다.",
      "고교 10차시 프로젝트 범위 내에서 뚜렷한 학술 결론과 사회적 대안을 도출하기에 타당한 연구 규모입니다.",
    ],
    improvements: [
      "연구 대상의 경계(예: 시기별, 플랫폼별, 인구집단별 등)를 1가지 더 명확히 한정하면 논리적 완결성이 극대화됩니다.",
      "수집할 원자료(통계청 KOSIS 공식 통계 수치, 뉴스 빅데이터 빅카인즈 키워드, 법령 조항 등)를 질문 문장 내에 은유 또는 직접 명시하는 것을 권장합니다.",
    ],
    refinedQuestions: [
      `${issue || "사회현상"}에서 ${major || "전공"} 관점의 ${question.replace(/어떻게.*$/, "").replace(/\?$/, "")}은 어떤 사회구조적 요인과 집단별 차이로 심화되는가?`,
      `${question.replace(/\?$/, "")}에 대해 ${method || "비교 실증 분석"}을 적용할 때 정책적·제도적 해결 경로는 어떻게 도출되는가?`,
    ],
    suggestedSubQuestions: [
      `이 현상이 가장 뚜렷하게 관찰되는 대표적인 실증 사례나 공공 원자료 지표는 무엇인가?`,
      `${major || "전공"} 학술 이론에서 이 문제를 설명하는 핵심 개념과 주요 한계점은 무엇인가?`,
      `걷기 및 데이터 분석 결과를 바탕으로 도출할 수 있는 구체적인 사회적·제도적 대안은 무엇인가?`,
    ],
    personalizedGuidance:
      `희망 전공인 [${major || "해당 전공"}]의 학술적 시선이 질문에 잘 반영되었습니다. 10차시 탐구에서 가장 중요한 핵심은 너무 방대한 거시 담론보다, 고등학생 연구자가 직접 KOSIS나 빅카인즈 등의 공공 원자료를 손에 쥐고 비교·검증할 수 있는 구체적 '실증 데이터'를 찾는 것입니다.`,
  };
}

// Helper: Generate robust high-academic heuristic recommendations if AI services are down
function generateHeuristicRecommendations(major: string, issue: string) {
  return [
    {
      title: `${issue || "최근 사회현상"}과 ${major || "전공"}적 쟁점 비교 분석`,
      question: `${issue || "생성형 AI 기술 확산"} 환경에서 ${major || "언론·사회"}의 신뢰성과 공공성은 집단별로 어떻게 차별화되어 나타나는가?`,
      concept: "공공성, 프레이밍 효과, 정보 격차",
      method: "빅데이터 텍스트마이닝 및 설문조사",
      dataSources: "빅카인즈 기사 데이터, 한국언론진흥재단 보고서",
      walkingTip: "플랫폼별 추천 알고리즘 결과 비교 및 언론사 기자 인터뷰",
    },
    {
      title: `제도적 대응 및 수용자 인식의 다차원적 분석`,
      question: `현행 정책 및 법제도는 ${issue || "새로운 사회적 위험"}을 예방하기에 실질적으로 기능하는가?`,
      concept: "제도적 지체, 위험사회론, 정책 순응도",
      method: "국회 의안정보 비교 및 국내외 사례 분석",
      dataSources: "국가법령정보센터, 국회 입법조사처 보고서",
      walkingTip: "국민참여입법센터 의견 분석 및 전문가·시민 설문 걷기",
    },
    {
      title: `사회적 형평성과 계층별 영향 평가`,
      question: `${issue || "사회적 변화"}에 따른 비용과 편익은 세대 및 소득 계층에 따라 어떻게 불균등하게 배분되는가?`,
      concept: "분배 정의, 디지털 소외, 세대 간 형평성",
      method: "통계 데이터 시계열 분석 및 심층 인터뷰",
      dataSources: "통계청 KOSIS, 복지패널 원자료",
      walkingTip: "복지기관 방문 조사 및 통계 데이터 걷기",
    },
  ];
}

// AI Question Evaluation endpoint
app.post("/api/gemini/evaluate-question", async (req, res) => {
  const { question, subQuestions, major, issue, lab, method, checks } = req.body;

  if (!question || question.trim().length < 5) {
    return res.status(400).json({
      ok: false,
      error: "평가할 탐구 질문을 5자 이상 입력해 주세요.",
    });
  }

  const ai = getGeminiClient();

  // If GEMINI_API_KEY is not configured, gracefully return heuristic evaluation
  if (!ai) {
    return res.json(generateHeuristicEvaluation(req.body));
  }

  try {
    const prompt = `당신은 고등학교 사회문제탐구 및 전공연계 소논문 지도를 전문으로 하는 학술 멘토이자 대학교수 자문위원입니다.
다음 학생의 탐구 질문과 연구 설계를 학술적 기준에 따라 정밀하게 평가하고 맞춤형 개선 피드백을 제공해 주세요.

[학생 탐구 정보]
- 희망 전공: ${major || "미정"}
- 관심 사회변화: ${issue || "미정"}
- 소속 연구실: ${lab || "미정"}
- 선택한 연구 방법: ${method || "미정"}
- 작성한 탐구 질문: "${question}"
- 보조 질문: "${subQuestions || "작성 안 됨"}"
- 학생 자체 점검 체크 상태: ${JSON.stringify(checks || {})}

다음 JSON 형식으로만 응답해 주세요:
{
  "overallScore": 88,
  "grade": "우수 (A)",
  "criteriaScores": {
    "specificity": 85,
    "feasibility": 90,
    "theoreticalLinkage": 86,
    "methodologicalRigor": 84,
    "originality": 88
  },
  "strengths": [
    "강점 1 (구체적 학술 피드백)",
    "강점 2",
    "강점 3"
  ],
  "improvements": [
    "보완할 점 1 (명확하고 실천적인 조언)",
    "보완할 점 2"
  ],
  "refinedQuestions": [
    "더 정밀하게 다듬은 추천 탐구 질문 대안 1",
    "더 정밀하게 다듬은 추천 탐구 질문 대안 2"
  ],
  "suggestedSubQuestions": [
    "탐구를 심화할 추천 보조 질문 1",
    "탐구를 심화할 추천 보조 질문 2",
    "탐구를 심화할 추천 보조 질문 3"
  ],
  "personalizedGuidance": "학생의 전공 진로와 연계된 3~4문장의 따뜻하고 정밀한 학술 조언"
}`;

    const { text, modelUsed } = await generateContentWithFallback(
      ai,
      prompt,
      "당신은 대한민국 고교생 4P 읽걷쓰 탐구보고서 및 학생부 학술탐구 피드백 전문가입니다. 실현가능성, 원자료 접근성, 전공 개념 융합성에 집중하여 피드백하십시오."
    );

    const result = JSON.parse(text);

    return res.json({
      ok: true,
      isAiGenerated: true,
      modelUsed,
      ...result,
    });
  } catch (error: any) {
    console.warn("AI question evaluation model fallback triggered:", error?.message || error);
    // Graceful fallback to heuristic evaluator so user NEVER gets blocked by Gemini 503
    const fallbackResult = generateHeuristicEvaluation(req.body);
    return res.json(fallbackResult);
  }
});

// AI Question Recommendation endpoint
app.post("/api/gemini/recommend-questions", async (req, res) => {
  const { major, issue, lab } = req.body;

  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      ok: true,
      isAiGenerated: false,
      recommendations: generateHeuristicRecommendations(major, issue),
    });
  }

  try {
    const prompt = `고등학교 2~3학년 수준의 전공연계 사회문제탐구(10차시)에 적합한 수준 높은 탐구 질문 3가지를 추천해 주세요.
[정보]
- 희망 전공: ${major || "사회과학/인문학/공학융합"}
- 관심 사회변화: ${issue || "디지털 전환과 불평등"}
- 연구실: ${lab || "사회문제탐구 융합 연구실"}

다음 JSON 배열 형식으로만 응답해 주세요:
{
  "recommendations": [
    {
      "title": "탐구 주제 명칭",
      "question": "구체적인 탐구 질문 (~어떻게 나타나는가? 등)",
      "concept": "핵심 전공 개념 2~3가지",
      "method": "적합한 연구 방법 (통계 분석, 콘텐츠 분석 등)",
      "dataSources": "실제 접근 가능한 원자료 출처 (KOSIS, 빅카인즈 등)",
      "walkingTip": "연계 가능한 '걷기' 활동 아이디어 (데이터/사람/공간/플랫폼)"
    }
  ]
}`;

    const { text, modelUsed } = await generateContentWithFallback(ai, prompt);
    const result = JSON.parse(text);

    return res.json({
      ok: true,
      isAiGenerated: true,
      modelUsed,
      recommendations: result.recommendations || [],
    });
  } catch (error: any) {
    console.warn("AI recommendation fallback triggered:", error?.message || error);
    return res.json({
      ok: true,
      isAiGenerated: false,
      isFallback: true,
      recommendations: generateHeuristicRecommendations(major, issue),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
