import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Bookmark,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  Bot,
} from "lucide-react";
import { AIEvaluationResult, AIRecommendation, StudentProfile } from "../types";

interface QuestionBuilderAIProps {
  profile: StudentProfile;
  selectedLabName: string;
  rqState: {
    issue: string;
    concept: string;
    target: string;
    method: string;
    pattern: string;
    subPattern?: string;
    result: string;
    saved: string;
    subs: string;
    checks: Record<string, boolean>;
  };
  onUpdateRQState: (field: string, value: any) => void;
  onSaveFinalRQ: (finalQuestion: string) => void;
  onNotify: (msg: string) => void;
}

export const QuestionBuilderAI: React.FC<QuestionBuilderAIProps> = ({
  profile,
  selectedLabName,
  rqState,
  onUpdateRQState,
  onSaveFinalRQ,
  onNotify,
}) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<AIEvaluationResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  // Compute live research question from components
  const buildQuestionString = () => {
    const { issue, concept, target, method, pattern, subPattern } = rqState;
    const suffixMap: Record<string, string> = {
      difference: "어떻게 다르게 나타나는가?",
      impact: "어떤 영향을 미치는가?",
      change: "어떻게 변화했는가?",
      function: "실질적으로 기능하는가?",
      relation: "어떤 인과적 관계가 있는가?",
      gap: "어떤 격차와 불평등을 야기하는가?",
    };
    const suffix = suffixMap[pattern] || "어떻게 나타나는가?";

    const parts: string[] = [];
    if (issue) parts.push(issue);
    if (concept) parts.push(`환경에서 ${concept}의 관점으로 볼 때`);
    if (target) parts.push(`${target}을(를) 대상으로`);
    if (subPattern) parts.push(`${subPattern}에 따라`);
    if (method) parts.push(`${method}을(를) 통해 분석했을 때`);

    if (parts.length === 0) {
      return "아래의 사회변화, 전공 개념, 분석 대상, 연구 방법을 입력하면 학술적 탐구 질문이 실시간 생성됩니다.";
    }
    return `${parts.join(" ")}, ${suffix}`;
  };

  const currentGenerated = buildQuestionString();

  // Evaluate Question with Gemini AI
  const handleEvaluateQuestion = async () => {
    const questionToEval = rqState.saved || currentGenerated;
    if (!questionToEval || questionToEval.length < 8 || questionToEval.includes("입력하면 학술적")) {
      onNotify("먼저 탐구 질문을 구체적으로 완성해 주세요.");
      return;
    }

    setIsEvaluating(true);
    setEvalError(null);

    try {
      const res = await fetch("/api/gemini/evaluate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionToEval,
          subQuestions: rqState.subs,
          major: profile.major,
          issue: profile.issue || rqState.issue,
          lab: selectedLabName,
          method: rqState.method,
          checks: rqState.checks,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "평가 처리 중 오류가 발생했습니다.");
      }

      setEvaluationResult(data);
      onNotify("인공지능 학술 평가 및 맞춤 개선 피드백이 생성되었습니다.");
    } catch (err: any) {
      setEvalError(err.message || "평가 요청에 실패했습니다.");
      onNotify("평가 처리 중 문제가 발생했습니다.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Recommend Questions with Gemini AI
  const handleRecommendQuestions = async () => {
    setIsRecommending(true);
    try {
      const res = await fetch("/api/gemini/recommend-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          major: profile.major,
          issue: profile.issue || rqState.issue,
          lab: selectedLabName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "추천 처리 중 오류가 발생했습니다.");
      }

      setRecommendations(data.recommendations || []);
      onNotify("3가지 학술 탐구 질문 추천이 생성되었습니다.");
    } catch (err: any) {
      onNotify(err.message || "질문 추천에 실패했습니다.");
    } finally {
      setIsRecommending(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onNotify("클립보드에 복사되었습니다.");
    } catch {
      onNotify("복사하지 못했습니다. 직접 선택해 주세요.");
    }
  };

  const handleApplyRefinedQuestion = (refined: string) => {
    onUpdateRQState("saved", refined);
    onSaveFinalRQ(refined);
    onNotify("추천 정밀 질문을 최종 탐구 질문으로 반영했습니다.");
  };

  const handleApplyRecommendation = (rec: AIRecommendation) => {
    onUpdateRQState("issue", profile.issue || rec.title);
    onUpdateRQState("concept", rec.concept);
    onUpdateRQState("method", rec.method);
    onUpdateRQState("saved", rec.question);
    onSaveFinalRQ(rec.question);
    onNotify("추천된 질문과 개념·방법론을 빌더에 적용했습니다.");
  };

  return (
    <section id="question" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            04 · PRECISION RESEARCH QUESTION & AI EVALUATOR
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            정밀 탐구 질문 만들기 & 인공지능 학술 평가
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
            막연한 큰 주제를 10차시 안에 조사 가능한 '변수·대상·방법'의 정밀 질문으로 설계하고,
            Gemini AI의 학술 기준 평가와 개인화된 피드백을 받아 완성도를 극대화하세요.
          </p>
        </div>

        <button
          onClick={handleRecommendQuestions}
          disabled={isRecommending}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition self-start md:self-auto"
        >
          {isRecommending ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          )}
          <span>{profile.major || "전공"} 맞춤 질문 추천 받기</span>
        </button>
      </div>

      {/* AI Recommendations Drawer (when generated) */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg border border-indigo-700/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-base text-white">
                인공지능이 추천하는 {profile.major || "전공연계"} 탐구 질문 제안
              </h3>
            </div>
            <button
              onClick={() => setRecommendations([])}
              className="text-xs text-slate-300 hover:text-white"
            >
              닫기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between space-y-3 hover:bg-white/15 transition"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                    추천 {idx + 1} · {rec.title}
                  </span>
                  <p className="text-xs md:text-sm font-extrabold text-white leading-relaxed">
                    "{rec.question}"
                  </p>
                  <div className="text-[11px] text-slate-300 space-y-1 pt-1">
                    <div>
                      <strong className="text-cyan-200">핵심 개념:</strong> {rec.concept}
                    </div>
                    <div>
                      <strong className="text-cyan-200">연구 방법:</strong> {rec.method}
                    </div>
                    <div>
                      <strong className="text-cyan-200">원자료:</strong> {rec.dataSources}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleApplyRecommendation(rec)}
                  className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>이 추천 질문 빌더에 적용</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Precision Builder on Left, Generated Question & AI Evaluator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Precision Parameter Inputs */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              FORMULA BUILDER
            </span>
            <h3 className="text-base font-extrabold text-slate-900">질문 정밀화 6대 구성 요소</h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              요소들을 조합하여 단순한 '찬반'이 아닌 학술적 분석 질문을 만듭니다.
            </p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. 최근 사회변화 (현상)
              </label>
              <input
                type="text"
                value={rqState.issue}
                onChange={(e) => onUpdateRQState("issue", e.target.value)}
                placeholder="예: 생성형 AI 확산 및 포털 뉴스 검색 개편"
                className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. 희망 전공 핵심 개념/렌즈
              </label>
              <input
                type="text"
                value={rqState.concept}
                onChange={(e) => onUpdateRQState("concept", e.target.value)}
                placeholder="예: 뉴스 신뢰도, 필터버블, 프레이밍 효과"
                className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. 구체적 분석 대상 및 표본 범위
              </label>
              <input
                type="text"
                value={rqState.target}
                onChange={(e) => onUpdateRQState("target", e.target.value)}
                placeholder="예: 2026년 주요 포털 및 유튜브 시사 채널 상위 50건"
                className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                4. 연구 방법론
              </label>
              <select
                value={rqState.method}
                onChange={(e) => onUpdateRQState("method", e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              >
                <option value="">방법론 선택</option>
                <option value="빅데이터 뉴스 텍스트마이닝 및 키워드 네트워크 분석">
                  빅데이터 뉴스 텍스트마이닝 (빅카인즈)
                </option>
                <option value="국가통계포털(KOSIS) 시계열 데이터 통계 분석">
                  공식 통계 데이터 분석 (KOSIS)
                </option>
                <option value="포털 및 플랫폼 추천 알고리즘 비교 관찰 분석">
                  플랫폼 추천 알고리즘 비교 관찰
                </option>
                <option value="수용자 인식 설문조사 및 빈도 교차분석">
                  수용자 인식 설문조사 및 교차분석
                </option>
                <option value="전문가 및 현장 실무자 심층 인터뷰 질적 분석">
                  전문가·실무자 심층 인터뷰 (질적 분석)
                </option>
                <option value="국내외 법률안 조문 및 정책 사례 비교 분석">
                  국내외 법률안 및 정책 사례 비교 분석
                </option>
                <option value="과거와 현재 신문 기사 아카이브 역사적 담론 분석">
                  과거와 현재 신문 아카이브 역사적 담론 분석
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                5. 비교 기준 및 변수 (선택)
              </label>
              <input
                type="text"
                value={rqState.subPattern || ""}
                onChange={(e) => onUpdateRQState("subPattern", e.target.value)}
                placeholder="예: 플랫폼 유형별, 수용자 연령별, 시기별"
                className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                6. 질문 종결 표현
              </label>
              <select
                value={rqState.pattern}
                onChange={(e) => onUpdateRQState("pattern", e.target.value)}
                className="w-full px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              >
                <option value="difference">어떻게 다르게 나타나는가? (비교/차이)</option>
                <option value="impact">어떤 영향을 미치는가? (인과/영향)</option>
                <option value="change">어떻게 변화했는가? (시계열 추이)</option>
                <option value="function">실질적으로 기능하는가? (정책 실효성)</option>
                <option value="relation">어떤 인과적 관계가 있는가? (상관성)</option>
                <option value="gap">어떤 격차와 불평등을 야기하는가? (사회적 형평성)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Live Generated Question Box, Subquestions, and AI Evaluation Panel */}
        <div className="lg:col-span-7 space-y-5">
          {/* Result Card */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-blue-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-cyan-300 font-bold mb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  실시간 생성된 탐구 질문 (RQ)
                </span>
                {rqState.saved && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px]">
                    최종 질문 저장됨
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-h-[90px] flex items-center">
                <p className="text-sm md:text-base font-extrabold text-white leading-relaxed">
                  "{rqState.saved || currentGenerated}"
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(rqState.saved || currentGenerated)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  질문 복사
                </button>

                <button
                  onClick={() => {
                    const q = rqState.saved || currentGenerated;
                    onUpdateRQState("saved", q);
                    onSaveFinalRQ(q);
                    onNotify("최종 탐구 질문으로 저장되었습니다.");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  최종 질문으로 확정
                </button>
              </div>

              {/* AI Evaluation Trigger */}
              <button
                onClick={handleEvaluateQuestion}
                disabled={isEvaluating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md"
              >
                {isEvaluating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>인공지능 학술 평가 & 정밀 피드백</span>
              </button>
            </div>
          </div>

          {/* Sub-questions and 4-point Checklist */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                보조 질문 2~3개 (단계적 논증 질문)
              </label>
              <textarea
                value={rqState.subs}
                onChange={(e) => onUpdateRQState("subs", e.target.value)}
                placeholder="예:&#10;1) 플랫폼별 알고리즘 추천 결과에서 가장 공통적으로 나타나는 키워드는 무엇인가?&#10;2) 이용자의 시청 이력 유무에 따른 추천 프레이밍의 편차는 통계적으로 유의미한가?&#10;3) 이로 인해 발생하는 공론장 양극화를 완화하기 위한 법제도적 방안은 무엇인가?"
                className="w-full px-3.5 py-2.5 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition min-h-[90px] leading-relaxed"
              />
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-800 mb-2">
                10차시 탐구 실행 가능성 자체 점검 체크리스트
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    key: "scope",
                    title: "범위 적절성",
                    desc: "10차시(방과후/수업) 안에 완수 가능한 현실적 범위인가?",
                  },
                  {
                    key: "data",
                    title: "원자료 접근성",
                    desc: "KOSIS, 빅카인즈, 설문 등 실제 원자료를 손에 쥘 수 있는가?",
                  },
                  {
                    key: "concept",
                    title: "전공 개념 연계",
                    desc: "단순 찬반이 아닌 희망 전공의 학술적 개념이 적용되었는가?",
                  },
                  {
                    key: "method",
                    title: "방법론 일치도",
                    desc: "질문에 답하기 위해 선택한 연구 방법이 타당한가?",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      rqState.checks[item.key]
                        ? "bg-blue-50/70 border-blue-300"
                        : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(rqState.checks[item.key])}
                      onChange={(e) =>
                        onUpdateRQState("checks", {
                          ...rqState.checks,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <strong className="text-xs font-extrabold text-slate-900 block leading-tight">
                        {item.title}
                      </strong>
                      <span className="text-[11px] text-slate-600 font-medium">
                        {item.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* AI Evaluation Detailed Feedback Panel (renders when available) */}
          {evaluationResult && (
            <div className="bg-white rounded-3xl p-6 border-2 border-blue-400/80 shadow-lg space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">
                      인공지능 학술 평가 결과
                    </h4>
                    <span className="text-xs text-slate-600 font-medium">
                      대한민국 고교 사회문제탐구 보고서 평가 기준표 적용
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-blue-700">
                    {evaluationResult.overallScore}
                    <span className="text-sm font-normal text-slate-600">/100점</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold">
                    {evaluationResult.grade}
                  </span>
                </div>
              </div>

              {/* 5 Criteria Mini Bar Chart */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-extrabold text-slate-800 block mb-2">
                  5대 학술 역량 다차원 평가 점수
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
                  {[
                    { label: "질문 구체성", score: evaluationResult.criteriaScores.specificity },
                    { label: "10차시 실현성", score: evaluationResult.criteriaScores.feasibility },
                    { label: "전공이론 연계", score: evaluationResult.criteriaScores.theoreticalLinkage },
                    { label: "방법론 타당성", score: evaluationResult.criteriaScores.methodologicalRigor },
                    { label: "창의·독창성", score: evaluationResult.criteriaScores.originality },
                  ].map((crit, i) => (
                    <div key={i} className="p-2 rounded-xl bg-white border border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-600 block">{crit.label}</span>
                      <strong className="text-base font-black text-blue-700 block my-1">
                        {crit.score}점
                      </strong>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${crit.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    학술적 강점
                  </span>
                  <ul className="text-xs text-emerald-950 space-y-1.5 font-medium pl-1">
                    {evaluationResult.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    정밀화 제안 및 보완점
                  </span>
                  <ul className="text-xs text-amber-950 space-y-1.5 font-medium pl-1">
                    {evaluationResult.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Refined Question Alternatives */}
              {evaluationResult.refinedQuestions?.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-extrabold text-slate-900 block">
                    인공지능 추천 대체 질문 (클릭 시 1-클릭 적용)
                  </span>
                  {evaluationResult.refinedQuestions.map((rqAlt, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <p className="text-xs font-extrabold text-blue-950 leading-snug">
                        "{rqAlt}"
                      </p>
                      <button
                        onClick={() => handleApplyRefinedQuestion(rqAlt)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition"
                      >
                        이 질문으로 확정
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Sub-questions */}
              {evaluationResult.suggestedSubQuestions?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 block">
                      추천 보조 질문 3가지
                    </span>
                    <button
                      onClick={() => {
                        const merged = evaluationResult.suggestedSubQuestions
                          .map((q, idx) => `${idx + 1}) ${q}`)
                          .join("\n");
                        onUpdateRQState("subs", merged);
                        onNotify("보조 질문을 입력창에 자동으로 채웠습니다.");
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      보조 질문란에 모두 채우기 &gt;
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
                    {evaluationResult.suggestedSubQuestions.map((subQ, i) => (
                      <p key={i} className="font-medium">
                        <strong className="text-blue-600">Q{i + 1}.</strong> {subQ}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Personalized Guidance */}
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 text-xs">
                <span className="font-black text-indigo-900 block mb-1">
                  학술 멘토의 종합 조언:
                </span>
                <p className="text-indigo-950 font-medium leading-relaxed">
                  {evaluationResult.personalizedGuidance}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
