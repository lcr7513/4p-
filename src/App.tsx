import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  Home,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Header } from "./components/Header";
import { IntegratedDashboard } from "./components/IntegratedDashboard";
import { ResearchLabs } from "./components/ResearchLabs";
import { RoadmapSessions } from "./components/RoadmapSessions";
import { QuestionBuilderAI } from "./components/QuestionBuilderAI";
import { WalkingImmersionAnalytics } from "./components/WalkingImmersionAnalytics";
import { ResourcePackModal } from "./components/ResourcePackModal";
import { ReportPlanner } from "./components/ReportPlanner";
import { SelfEvaluation } from "./components/SelfEvaluation";
import { StudentRecordSheet } from "./components/StudentRecordSheet";
import { SheetSyncExport } from "./components/SheetSyncExport";
import { StudentProfile, SyncStatus, WalkingLog, ReportDraft, StudentRecordData, GoogleSheetSyncInfo } from "./types";
import { RESEARCH_LABS, INITIAL_WALKING_LOGS } from "./data/researchData";
import { submitToGoogleSpreadsheet } from "./services/googleSheets";

const STORAGE_KEY = "4p_reading_walking_writing_v2";

const SECTIONS_CONFIG = [
  { id: "dashboard", title: "통합 대시보드 홈", shortTitle: "홈" },
  { id: "labs", title: "02. 6대 전공연계연구실", shortTitle: "6대 연구실" },
  { id: "sessions", title: "03. 10차시 로드맵", shortTitle: "로드맵" },
  { id: "question", title: "04. AI 질문 빌더 & 평가", shortTitle: "질문 빌더" },
  { id: "walking", title: "05. 걷기 활동 & 몰입도 분석", shortTitle: "걷기 분석" },
  { id: "resources", title: "06. 연구 꾸러미 자료실", shortTitle: "연구 꾸러미" },
  { id: "report", title: "07. 10단계 학술 보고서", shortTitle: "학술 보고서" },
  { id: "evaluation", title: "08. 자기평가 루브릭", shortTitle: "자기평가" },
  { id: "studentRecord", title: "09. 학생부 기재 기초자료", shortTitle: "학생부" },
  { id: "sheetExport", title: "10. 교사용 동기화 & 내보내기", shortTitle: "시트 동기화" },
];

export default function App() {
  // Navigation active tab
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showNotification = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Student Profile
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      studentId: "30101",
      name: "김민재",
      grade: "3학년",
      major: "미디어커뮤니케이션학",
      issue: "생성형 AI와 뉴스 알고리즘의 공론장 양극화",
    };
  });

  // Selected Lab ID
  const [selectedLabId, setSelectedLabId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_labId`);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return 0; // Default to Lab 1 (AI·미디어·민주주의)
  });

  // Confirmed Research Question
  const [researchQuestion, setResearchQuestion] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_rq`);
      if (saved) return saved;
    } catch (e) {}
    return "생성형 AI 환경에서 뉴스 신뢰도의 관점으로 볼 때 포털 맞춤형 추천 알고리즘을 텍스트마이닝을 통해 분석했을 때, 언론사별 의제 다양성에 어떤 차이가 나타나는가?";
  });

  // Question formula builder state
  const [rqState, setRqState] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_rqState`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      issue: "생성형 AI 확산 및 포털 뉴스 검색 개편",
      concept: "뉴스 신뢰도 및 필터버블",
      target: "2026년 주요 포털 시사 뉴스 상위 100건",
      method: "빅데이터 뉴스 텍스트마이닝 및 키워드 네트워크 분석",
      pattern: "difference",
      subPattern: "언론사 규모 및 수용자 연령별",
      result: "",
      saved: "생성형 AI 환경에서 뉴스 신뢰도의 관점으로 볼 때 포털 맞춤형 추천 알고리즘을 텍스트마이닝을 통해 분석했을 때, 언론사별 의제 다양성에 어떤 차이가 나타나는가?",
      subs: "1) 포털 알고리즘이 우선 노출하는 상위 기사의 언론사 집중도는 어느 정도인가?\n2) 이용자의 과거 열람 이력에 따른 추천 헤드라인의 프레이밍 차이는 통계적으로 유의미한가?\n3) 공론장의 편향을 완화하기 위한 기술적·제도적 가이드라인은 무엇인가?",
      checks: {
        scope: true,
        data: true,
        concept: true,
        method: true,
      },
    };
  });

  // 10 Sessions Progress & Reflections
  const [sessions, setSessions] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true }; // First 6 completed
  });

  const [reflections, setReflections] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_reflections`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      0: "미디어커뮤니케이션 전공의 렌즈로 볼 때 AI가 단순한 기술 혁신이 아니라 여론 형성을 좌우하는 게이트키퍼임을 인식함.",
      1: "동일한 포털 뉴스를 경제학은 클릭당 수익과 플랫폼 독점으로, 미디어학은 의제설정과 신뢰도로 다르게 분석함을 확인.",
      2: "한국언론진흥재단 보고서와 KCI 학술 논문 초록을 발췌하여 선행연구의 변수 설정 방식을 벤치마킹함.",
      3: "질문 공식을 적용하여 'AI 뉴스'라는 막연한 주제를 '포털 알고리즘의 의제 다양성 격차'라는 측정 가능한 연구 질문으로 구체화함.",
    };
  });

  // Walking Logs and Plan
  const [walkingLogs, setWalkingLogs] = useState<WalkingLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_walkLogs`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_WALKING_LOGS;
  });

  const [walkPlan, setWalkPlan] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_walkPlan`);
      if (saved) return saved;
    } catch (e) {}
    return "빅카인즈에서 최근 3개월간 '생성형 AI' 키워드 뉴스 500건 메타데이터를 다운로드하고, KOSIS의 '언론수용자 조사' 원자료를 엑셀로 교차 분석할 계획임.";
  });

  const [walkEthics, setWalkEthics] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_walkEthics`);
      if (saved) return saved;
    } catch (e) {}
    return "개인식별정보를 일절 수집하지 않으며, 알고리즘 검색 시 쿠키를 제거한 시크릿 모드를 사용하여 검색어 이력 편향을 통제함. 인용한 통계는 국가통계포털 원문과 대조함.";
  });

  const [selectedWalks, setSelectedWalks] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_selectedWalks`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { 2: true, 3: true, 1: true }; // Data walking (mandatory) + Platform walking + People walking
  });

  // 10 Chapters Report Draft
  const [reportDraft, setReportDraft] = useState<ReportDraft>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_reportDraft`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      ch1_title: "생성형 AI 환경에서 포털 뉴스 추천 알고리즘의 의제 다양성에 관한 텍스트마이닝 실증 연구",
      ch2_background: "대규모 언어모델과 추천 알고리즘이 포털의 뉴스 유통을 지배하면서 시민들의 확증편향과 필터버블이 심화되는 문제를 진단하고자 함.",
      ch3_theory: "의제설정 이론(Agenda-Setting)과 프레이밍 효과(Framing Effects)를 이론적 틀로 적용하여 알고리즘 추천 상위 기사의 노출 편향을 계량화함.",
      ch4_questions: "[주요 RQ] 포털 맞춤형 추천 알고리즘은 언론사별 노출 빈도와 의제 다양성에 어떤 차이를 나타내는가?\n[보조 Q] 이용자 계정 상태별 추천 헤드라인의 논조 편차는 유의미한가?",
      ch5_methods: "빅카인즈(BigKinds) 기사 500건 텍스트마이닝 및 KOSIS '2025 언론수용자 조사' 마이크로데이터 교차 분석.",
      ch6_findings: "알고리즘 추천 상위 100건 중 대형사 기사가 68%를 차지하여 다양성이 낮아졌으며, 자극적 키워드일수록 추천 가중치가 높게 산출됨.",
      ch7_discussion: "단순 플랫폼 규제를 넘어 '공공 알고리즘 검증 위원회' 상설화 및 청소년 비판적 미디어 리터러시 교육의 필수화를 제안함.",
      ch8_limitations: "기업의 내부 알고리즘 코드를 직접 열람하지 못하고 출력 데이터를 역추적했다는 표본상의 한계가 있으나 수용자 경험을 실증했다는 점에서 의의가 있음.",
      ch9_conclusion: "대학 미디어커뮤니케이션학과에 진학하여 '생성형 AI 추천 시스템의 공정성 평가지수(Fairness Metric) 개발' 연구로 심화 발전시키고자 함.",
      ch10_references: "1. 한국언론진흥재단 (2025). 2025 언론수용자 조사. 서울: 한국언론진흥재단.\n2. 통계청 (2025). 인구총조사 가구부문 통계. 국가통계포털(KOSIS).",
    };
  });

  // 12 Items Student Record Foundation Data
  const [studentRecord, setStudentRecord] = useState<StudentRecordData>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_studentRecord`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      item1_topic: "[4P 전공연계 사회문제탐구] 생성형 AI 환경에서 알고리즘 맞춤 뉴스가 수용자 여론 다양성에 미치는 영향 분석",
      item2_period: "2026.03.10. ~ 2026.05.28. (총 10차시 20시간 이수)",
      item3_motivation: "생성형 AI 뉴스 추천의 확산으로 공론장 양극화에 문제의식을 느끼고, 미디어커뮤니케이션 지망생으로서 알고리즘의 실증적 편향성을 밝히고자 탐구를 기획함.",
      item4_concept: "의제설정 이론, 필터버블, 확증편향 이론을 핵심 학술 렌즈로 적용함.",
      item5_rq: "포털의 AI 뉴스 추천 알고리즘은 언론사별 노출 빈도와 의제 다양성에 어떤 구조적 격차를 유발하는가?",
      item6_walking: "빅카인즈에서 기사 500건 메타데이터를 추출하고, KOSIS 언론수용자 조사 원자료를 다운로드하여 직접 계량 분석함.",
      item7_analysis: "텍스트마이닝 관계망 분석으로 중심성 지수를 산출하고, KOSIS 통계표를 바탕으로 연령대별 확증편향 지표의 상관계수를 도출함.",
      item8_conclusion: "대형 언론사 편중(68%)을 실증하고, '알고리즘 투명성 평가 조례' 제정과 청소년 미디어 리터러시 강화를 사회적 대안으로 제안함.",
      item9_limitation: "비공개 알고리즘 코드 대신 출력 결과를 역추적했다는 한계를 솔직히 인정하고, 다각적 교차 분석으로 타당성을 보완함.",
      item10_presentation: "미니 학술대회에서 인포그래픽 포스터를 발표하고, '알고리즘 규제와 혁신의 충돌'에 대한 질문에 해외 사례를 들어 논리적으로 답변함.",
      item11_growth: "단순 인터넷 검색을 넘어 공공 원자료를 직접 다루는 연구의 객관성을 체득하고, 비판적 데이터 리터러시와 연구 윤리를 깊이 체화함.",
      item12_future: "대학 미디어학과에서 '생성형 AI 추천 시스템 공정성 평가지표 모델링'을 심화 연구하고자 함.",
    };
  });

  // Rubric Scores & Submission Checklist
  const [rubricScores, setRubricScores] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_rubric`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { 0: 4, 1: 4, 2: 4, 3: 3, 4: 4, 5: 3, 6: 4, 7: 4 };
  });

  const [submissionChecklist, setSubmissionChecklist] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_checklist`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true };
  });

  // Sync Status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_syncStatus`);
      const directTeacherUrl = localStorage.getItem("4p_teacher_webhook_url") || "";
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          teacherSheetWebhookUrl: parsed.teacherSheetWebhookUrl || directTeacherUrl,
        };
      }
      return {
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
        autoSyncEnabled: true,
        teacherSheetWebhookUrl: directTeacherUrl,
        serverRecordsCount: 1,
      };
    } catch (e) {}
    return {
      isSyncing: false,
      lastSyncedAt: new Date().toISOString(),
      autoSyncEnabled: true,
      teacherSheetWebhookUrl: localStorage.getItem("4p_teacher_webhook_url") || "",
      serverRecordsCount: 1,
    };
  });

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_labId`, JSON.stringify(selectedLabId));
  }, [selectedLabId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rq`, researchQuestion);
  }, [researchQuestion]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rqState`, JSON.stringify(rqState));
  }, [rqState]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_reflections`, JSON.stringify(reflections));
  }, [reflections]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_walkLogs`, JSON.stringify(walkingLogs));
  }, [walkingLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_walkPlan`, walkPlan);
  }, [walkPlan]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_walkEthics`, walkEthics);
  }, [walkEthics]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_selectedWalks`, JSON.stringify(selectedWalks));
  }, [selectedWalks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_reportDraft`, JSON.stringify(reportDraft));
  }, [reportDraft]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_studentRecord`, JSON.stringify(studentRecord));
  }, [studentRecord]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rubric`, JSON.stringify(rubricScores));
  }, [rubricScores]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_checklist`, JSON.stringify(submissionChecklist));
  }, [submissionChecklist]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_syncStatus`, JSON.stringify(syncStatus));
  }, [syncStatus]);

  // Load server teacher webhook and query param on mount so students automatically inherit teacher's webhook
  useEffect(() => {
    // 1. Check URL query param ?teacherWebhook=...
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramWebhook = urlParams.get("teacherWebhook");
      if (paramWebhook && /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/i.test(paramWebhook)) {
        setSyncStatus((prev) => ({ ...prev, teacherSheetWebhookUrl: paramWebhook }));
        // Register to server
        fetch("/api/sync/teacher-webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ webhookUrl: paramWebhook }),
        }).catch(() => {});
        return;
      }
    } catch (e) {}

    // 2. Fetch global teacher webhook from server
    fetch("/api/sync/teacher-webhook")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.webhookUrl) {
          setSyncStatus((prev) => ({
            ...prev,
            teacherSheetWebhookUrl: prev.teacherSheetWebhookUrl || data.webhookUrl,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateTeacherWebhook = async (url: string) => {
    const trimmed = url.trim();
    localStorage.setItem("4p_teacher_webhook_url", trimmed);
    setSyncStatus((prev) => ({ ...prev, teacherSheetWebhookUrl: trimmed }));
    try {
      const res = await fetch("/api/sync/teacher-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: trimmed }),
      });
      const data = await res.json();
      if (data.ok) {
        showNotification(
          trimmed
            ? "교사용 구글 시트 웹훅이 전역 서버에 등록되었습니다! 이제 학생들의 모든 제출물이 선생님 시트로 자동 전송됩니다."
            : "교사용 구글 시트 웹훅 연결이 해제되었습니다."
        );
      }
    } catch (err) {
      showNotification("웹훅 URL이 저장되었습니다.");
    }
  };

  // Real-time server sync function
  const triggerSync = useCallback(
    async (isManual = false) => {
      setSyncStatus((prev) => ({ ...prev, isSyncing: true }));

      const selectedLab = selectedLabId !== null ? RESEARCH_LABS[selectedLabId] : null;
      const completedCount = Object.values(sessions).filter(Boolean).length;
      const progressPercent = Math.round((completedCount / 10) * 100);

      const payload = {
        studentId: profile.studentId,
        name: profile.name,
        grade: profile.grade,
        major: profile.major,
        issue: profile.issue,
        selectedLabId,
        labName: selectedLab?.name || "미선택",
        researchQuestion,
        progressPercent,
        completedSessions: completedCount,
        reportDraft,
        studentRecord,
        walkingLogs,
        teacherSheetWebhookUrl: syncStatus.teacherSheetWebhookUrl,
      };

      try {
        const res = await fetch("/api/sync/student-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        const now = new Date().toISOString();

        if (res.ok && data.ok) {
          setSyncStatus((prev) => ({
            ...prev,
            isSyncing: false,
            lastSyncedAt: now,
            serverRecordsCount: data.totalStudents || prev.serverRecordsCount,
          }));
          if (isManual) {
            showNotification("실시간 클라우드 및 교사 시트 동기화가 완료되었습니다.");
          }
        } else {
          throw new Error(data.error || "동기화 실패");
        }
      } catch (err: any) {
        setSyncStatus((prev) => ({ ...prev, isSyncing: false }));
        if (isManual) {
          showNotification("동기화 연결을 확인해 주세요. 로컬에는 안전하게 보관 중입니다.");
        }
      }
    },
    [profile, selectedLabId, researchQuestion, sessions, reportDraft, studentRecord, walkingLogs, syncStatus.teacherSheetWebhookUrl]
  );

  // Debounced auto-sync (runs 5 seconds after modifications stop)
  useEffect(() => {
    if (!syncStatus.autoSyncEnabled) return;
    const timer = setTimeout(() => {
      triggerSync(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, [profile, selectedLabId, researchQuestion, reportDraft, studentRecord, sessions, walkingLogs]);

  // Handler helpers
  const handleSelectLab = (labId: number) => {
    setSelectedLabId(labId);
    const lab = RESEARCH_LABS[labId];
    if (lab) {
      setProfile((prev) => ({
        ...prev,
        issue: prev.issue || lab.socialChange,
      }));
      showNotification(`[${lab.name}] 연구실이 확정되었습니다.`);
    }
  };

  const handleApplyQuestionToBuilder = (question: string, majorBadge: string) => {
    setRqState((prev: any) => ({
      ...prev,
      saved: question,
    }));
    setResearchQuestion(question);
    setActiveSection("question");
    showNotification(`연구실 대표 질문이 질문 빌더에 적용되었습니다.`);
  };

  const handleAppendReferenceToReport = (citation: string) => {
    setReportDraft((prev) => {
      const existing = prev.ch10_references ? `${prev.ch10_references}\n` : "";
      return {
        ...prev,
        ch10_references: `${existing}• ${citation}`,
      };
    });
  };

  // Metric counts for dashboard
  const completedSessionsCount = Object.values(sessions).filter(Boolean).length;
  const reportCompletedCount = Object.values(reportDraft).filter(
    (v) => typeof v === "string" && v.trim().length > 0
  ).length;
  const studentRecordCount = Object.values(studentRecord).filter(
    (v) => typeof v === "string" && v.trim().length > 0
  ).length;
  const walkingImmersionScore =
    walkingLogs.length > 0
      ? Math.round(walkingLogs.reduce((acc, l) => acc + l.immersionLevel, 0) / walkingLogs.length)
      : 80;
  const rubricScoreTotal = Object.values(rubricScores).reduce(
    (acc: number, s: number) => acc + (Number(s) || 3),
    0
  );

  // Package of full data for export
  const fullAppData = {
    profile,
    selectedLabId,
    selectedLabName: selectedLabId !== null ? RESEARCH_LABS[selectedLabId]?.name : "미선택",
    researchQuestion,
    rqState,
    sessions,
    reflections,
    walkingLogs,
    walkPlan,
    walkEthics,
    reportDraft,
    studentRecord,
    rubricScores,
    submissionChecklist,
    exportedAt: new Date().toISOString(),
  };

  // Google Sheets Direct Submission Handler (Accumulates student data)
  const [isSubmittingGoogleSheet, setIsSubmittingGoogleSheet] = useState(false);

  const handleSubmitGoogleSheet = async () => {
    setIsSubmittingGoogleSheet(true);
    try {
      showNotification("구글 계정 인증 및 스프레드시트 누적 제출을 시작합니다...");
      const result = await submitToGoogleSpreadsheet(
        syncStatus.googleSheet?.spreadsheetId,
        profile,
        fullAppData
      );

      const newSheetInfo: GoogleSheetSyncInfo = {
        isConnected: true,
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
        spreadsheetTitle: result.title,
        lastSyncedAt: new Date().toISOString(),
      };

      setSyncStatus((prev) => ({
        ...prev,
        googleSheet: newSheetInfo,
        lastSyncedAt: new Date().toISOString(),
      }));

      localStorage.setItem("4p_google_sheet_info", JSON.stringify(newSheetInfo));

      // Trigger background sync to also keep classroom teacher server updated
      triggerSync(false);

      if (result.isAccumulated) {
        showNotification(
          `[${profile.name || "학생"}] 연구자료가 구글 시트에 새 행으로 성공적으로 누적 제출되었습니다!`
        );
      } else {
        showNotification(
          `[${result.title}] 맞춤형 구글 시트가 생성되고 첫 번째 학생 자료로 성공적으로 제출되었습니다!`
        );
      }
    } catch (err: any) {
      console.error("Google sheet submission error:", err);
      showNotification(`구글 시트 제출 오류: ${err?.message || "다시 시도해 주세요."}`);
    } finally {
      setIsSubmittingGoogleSheet(false);
    }
  };

  // Export JSON backup
  const handleExportJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullAppData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `4p_project_${profile.studentId || "student"}_${profile.name || "backup"}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showNotification("전체 프로젝트 데이터가 JSON 백업 파일로 저장되었습니다.");
    } catch (e) {
      showNotification("저장 중 오류가 발생했습니다.");
    }
  };

  // Import JSON backup
  const handleImportJson = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.profile) setProfile(json.profile);
        if (json.selectedLabId !== undefined) setSelectedLabId(json.selectedLabId);
        if (json.researchQuestion) setResearchQuestion(json.researchQuestion);
        if (json.rqState) setRqState(json.rqState);
        if (json.sessions) setSessions(json.sessions);
        if (json.reflections) setReflections(json.reflections);
        if (json.walkingLogs) setWalkingLogs(json.walkingLogs);
        if (json.walkPlan) setWalkPlan(json.walkPlan);
        if (json.walkEthics) setWalkEthics(json.walkEthics);
        if (json.reportDraft) setReportDraft(json.reportDraft);
        if (json.studentRecord) setStudentRecord(json.studentRecord);
        if (json.rubricScores) setRubricScores(json.rubricScores);
        if (json.submissionChecklist) setSubmissionChecklist(json.submissionChecklist);
        showNotification("성공적으로 프로젝트 백업 데이터를 불러왔습니다.");
      } catch (err) {
        showNotification("유효하지 않은 백업 JSON 파일입니다.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Navigation helpers for Prev / Current / Next
  const currentIndex = SECTIONS_CONFIG.findIndex((s) => s.id === activeSection);
  const currentSection = SECTIONS_CONFIG[currentIndex] || SECTIONS_CONFIG[0];
  const prevSection = currentIndex > 1 ? SECTIONS_CONFIG[currentIndex - 1] : null;
  const nextSection = currentIndex > 0 && currentIndex < SECTIONS_CONFIG.length - 1 ? SECTIONS_CONFIG[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Top Header Navigation */}
      <Header
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        syncStatus={syncStatus}
        onManualSync={() => triggerSync(true)}
        onSubmitGoogleSheet={handleSubmitGoogleSheet}
        isSubmittingSheet={isSubmittingGoogleSheet}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onJumpToDashboard={() => setActiveSection("dashboard")}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Breadcrumb & Quick Navigation Bar when inside any sub-tab */}
        {activeSection !== "dashboard" && (
          <div className="mb-6 p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setActiveSection("dashboard")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition hover:scale-102 active:scale-98 cursor-pointer"
                title="통합 대시보드 홈으로 나가기"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>대시보드로 나가기</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className="hover:text-blue-600 flex items-center gap-1 transition"
                >
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <span>홈</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  {currentSection.title}
                </span>
              </div>
            </div>

            {/* Prev / Next step buttons + Close button */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
              {prevSection && (
                <button
                  onClick={() => setActiveSection(prevSection.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 text-xs font-bold transition hover:shadow-2xs"
                  title={`이전: ${prevSection.title}`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{prevSection.shortTitle}</span>
                  <span className="md:hidden">이전</span>
                </button>
              )}

              {nextSection ? (
                <button
                  onClick={() => setActiveSection(nextSection.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition"
                  title={`다음 단계: ${nextSection.title}`}
                >
                  <span className="hidden md:inline">{nextSection.shortTitle}</span>
                  <span className="md:hidden">다음</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition"
                >
                  <span>대시보드로 완료</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              )}

              <button
                onClick={() => setActiveSection("dashboard")}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                title="닫기 (대시보드로 복귀)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        {/* Render View Based on Active Navigation Tab */}
        {activeSection === "dashboard" && (
          <IntegratedDashboard
            profile={profile}
            selectedLabId={selectedLabId}
            researchQuestion={researchQuestion}
            completedSessionsCount={completedSessionsCount}
            reportCompletedCount={reportCompletedCount}
            studentRecordCount={studentRecordCount}
            walkingImmersionScore={walkingImmersionScore}
            rubricScore={rubricScoreTotal}
            syncStatus={syncStatus}
            onUpdateProfile={(field, val) =>
              setProfile((prev) => ({ ...prev, [field]: val }))
            }
            onManualSync={() => triggerSync(true)}
            onSubmitGoogleSheet={handleSubmitGoogleSheet}
            isSubmittingGoogleSheet={isSubmittingGoogleSheet}
            onToggleAutoSync={() =>
              setSyncStatus((prev) => ({
                ...prev,
                autoSyncEnabled: !prev.autoSyncEnabled,
              }))
            }
            onNavigateSection={setActiveSection}
          />
        )}

        {activeSection === "labs" && (
          <ResearchLabs
            selectedLabId={selectedLabId}
            onSelectLab={handleSelectLab}
            onApplyQuestionToBuilder={handleApplyQuestionToBuilder}
          />
        )}

        {activeSection === "sessions" && (
          <RoadmapSessions
            sessions={sessions}
            reflections={reflections}
            onToggleSession={(idx) =>
              setSessions((prev) => ({ ...prev, [idx]: !prev[idx] }))
            }
            onUpdateReflection={(idx, val) =>
              setReflections((prev) => ({ ...prev, [idx]: val }))
            }
            onNotify={showNotification}
          />
        )}

        {activeSection === "question" && (
          <QuestionBuilderAI
            profile={profile}
            selectedLabName={
              selectedLabId !== null ? RESEARCH_LABS[selectedLabId]?.name : "미선택"
            }
            rqState={rqState}
            onUpdateRQState={(field, val) =>
              setRqState((prev: any) => ({ ...prev, [field]: val }))
            }
            onSaveFinalRQ={(finalQ) => {
              setResearchQuestion(finalQ);
              setReportDraft((prev) => ({ ...prev, ch4_questions: finalQ }));
              setStudentRecord((prev) => ({ ...prev, item5_rq: finalQ }));
            }}
            onNotify={showNotification}
          />
        )}

        {activeSection === "walking" && (
          <WalkingImmersionAnalytics
            logs={walkingLogs}
            walkPlan={walkPlan}
            walkEthics={walkEthics}
            selectedWalks={selectedWalks}
            onUpdateLogs={setWalkingLogs}
            onUpdatePlan={setWalkPlan}
            onUpdateEthics={setWalkEthics}
            onToggleWalk={(idx) =>
              setSelectedWalks((prev) => ({ ...prev, [idx]: !prev[idx] }))
            }
            onNotify={showNotification}
          />
        )}

        {activeSection === "resources" && (
          <ResourcePackModal
            onAppendReferenceToReport={handleAppendReferenceToReport}
            onNotify={showNotification}
          />
        )}

        {activeSection === "report" && (
          <ReportPlanner
            draft={reportDraft}
            onUpdateField={(field, val) =>
              setReportDraft((prev) => ({ ...prev, [field]: val }))
            }
            onNotify={showNotification}
          />
        )}

        {activeSection === "evaluation" && (
          <SelfEvaluation
            scores={rubricScores}
            checklists={submissionChecklist}
            onUpdateScore={(idx, s) =>
              setRubricScores((prev) => ({ ...prev, [idx]: s }))
            }
            onToggleChecklist={(idx) =>
              setSubmissionChecklist((prev) => ({ ...prev, [idx]: !prev[idx] }))
            }
            onSubmitGoogleSheet={handleSubmitGoogleSheet}
            isSubmittingGoogleSheet={isSubmittingGoogleSheet}
            onNotify={showNotification}
          />
        )}

        {activeSection === "studentRecord" && (
          <StudentRecordSheet
            data={studentRecord}
            onUpdateField={(field, val) =>
              setStudentRecord((prev) => ({ ...prev, [field]: val }))
            }
            onNotify={showNotification}
          />
        )}

        {activeSection === "sheetExport" && (
          <SheetSyncExport
            profile={profile}
            syncStatus={syncStatus}
            fullAppData={fullAppData}
            onManualSync={() => triggerSync(true)}
            onSubmitGoogleSheet={handleSubmitGoogleSheet}
            isSubmittingGoogleSheet={isSubmittingGoogleSheet}
            onUpdateTeacherWebhook={handleUpdateTeacherWebhook}
            onUpdateGoogleSheetInfo={(info) =>
              setSyncStatus((prev) => ({ ...prev, googleSheet: info }))
            }
            onNotify={showNotification}
          />
        )}

        {/* Bottom Navigation Bar when inside any sub-tab: Easy exit and next-step flow */}
        {activeSection !== "dashboard" && (
          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => setActiveSection("dashboard")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 hover:border-slate-400 transition shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>통합 대시보드로 나가기</span>
            </button>

            <div className="flex items-center gap-2">
              {prevSection && (
                <button
                  onClick={() => setActiveSection(prevSection.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>이전 단계: {prevSection.shortTitle}</span>
                </button>
              )}

              {nextSection ? (
                <button
                  onClick={() => setActiveSection(nextSection.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition hover:scale-102 cursor-pointer"
                >
                  <span>다음 단계: {nextSection.shortTitle}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setActiveSection("dashboard")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition hover:scale-102 cursor-pointer"
                >
                  <span>전체 탐구 완료 · 대시보드 복귀</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounceIn">
          <div className="px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-700 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* App Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900">4P 읽걷쓰</span>
            <span>· 전공연계 사회문제탐구 프로젝트 (Phenomenon · Problem · Project · Practice)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>실시간 클라우드 동기화 엔진 탑재</span>
            <span>•</span>
            <span>Gemini AI 학술 피드백 시스템</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

