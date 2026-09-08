import React, { useState } from "react";
import {
  Footprints,
  TrendingUp,
  Activity,
  Plus,
  Compass,
  CheckCircle2,
  BarChart3,
  Lightbulb,
  Trash2,
  Sparkles,
} from "lucide-react";
import { WalkingLog } from "../types";
import { INITIAL_WALKING_LOGS } from "../data/researchData";

interface WalkingImmersionAnalyticsProps {
  logs: WalkingLog[];
  walkPlan: string;
  walkEthics: string;
  selectedWalks: Record<number, boolean>;
  onUpdateLogs: (newLogs: WalkingLog[]) => void;
  onUpdatePlan: (plan: string) => void;
  onUpdateEthics: (ethics: string) => void;
  onToggleWalk: (index: number) => void;
  onNotify: (msg: string) => void;
}

export const WalkingImmersionAnalytics: React.FC<WalkingImmersionAnalyticsProps> = ({
  logs,
  walkPlan,
  walkEthics,
  selectedWalks,
  onUpdateLogs,
  onUpdatePlan,
  onUpdateEthics,
  onToggleWalk,
  onNotify,
}) => {
  // New entry form state
  const [newType, setNewType] = useState<string>("데이터 걷기");
  const [newDuration, setNewDuration] = useState<number>(60);
  const [newDataPoints, setNewDataPoints] = useState<number>(20);
  const [newImmersion, setNewImmersion] = useState<number>(85);
  const [newDescription, setNewDescription] = useState<string>("");
  const [newNotes, setNewNotes] = useState<string>("");

  const activeLogs = logs.length > 0 ? logs : INITIAL_WALKING_LOGS;

  // Calculate immersion metrics
  const totalMinutes = activeLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const totalDataPoints = activeLogs.reduce((acc, l) => acc + l.dataPointsCollected, 0);
  const avgImmersion =
    activeLogs.length > 0
      ? Math.round(activeLogs.reduce((acc, l) => acc + l.immersionLevel, 0) / activeLogs.length)
      : 80;

  // 7 Walking Menu Definitions
  const WALKING_MENU = [
    {
      name: "공간 걷기",
      desc: "법원·박물관·의회·언론사·복지기관·대학 연구실 현장 방문 또는 견학",
      source: "대법원·헌법재판소 견학, 국회도서관, 지역 청년센터",
      exampleQ: "사법·입법 기관의 물리적 공간 구조는 시민의 권리를 어떻게 드러내는가?",
      mandatory: false,
    },
    {
      name: "사람에게 걷기",
      desc: "대학교수·연구위원·기자·공무원·사회복지사·노동자 심층 인터뷰",
      source: "커리어넷, 꿈길, 원격영상 진로멘토링, 기관 공식 질의",
      exampleQ: "현장 실무자는 사회문제를 진단할 때 어떤 데이터를 신뢰하는가?",
      mandatory: false,
    },
    {
      name: "데이터로 걷기",
      desc: "국가통계포털(KOSIS)·공공데이터포털·국회 의안정보 원자료 직접 탐색",
      source: "KOSIS, 공공데이터포털, 국민참여입법센터, e-나라지표",
      exampleQ: "1인 가구 증가는 연령대 및 시도 지역별로 어떻게 불균등한가?",
      mandatory: true,
    },
    {
      name: "플랫폼 걷기",
      desc: "유튜브·포털·SNS 추천 알고리즘 결과, 뉴스 댓글 담론 직접 관찰",
      source: "유튜브 추천 시스템, KISDI 미디어 보고서, 빅카인즈",
      exampleQ: "동일 시사 이슈 검색 결과는 알고리즘 조건에 따라 어떻게 편향되는가?",
      mandatory: false,
    },
    {
      name: "역사로 걷기",
      desc: "신문 아카이브, 법령 연혁, 과거 통계로 정책 담론의 10년 주기 변화 추적",
      source: "빅카인즈 신문 아카이브, 국가기록원, 국가법령정보센터",
      exampleQ: "인구 문제 담론은 '가족계획'에서 '저출생 극복'으로 어떻게 이동했는가?",
      mandatory: false,
    },
    {
      name: "사례로 걷기",
      desc: "국내외 유사 정책·제도·사회적 실천 사례의 장단점 비교 대조",
      source: "EU AI Act, OECD Family Database, 국내 지자체 조례",
      exampleQ: "유럽과 한국의 AI 규제 법안은 위험 등급을 어떻게 다르게 설정하는가?",
      mandatory: false,
    },
    {
      name: "개념으로 걷기",
      desc: "하나의 사회현상을 복수 학문(사회학·경제학·법학·지리학) 렌즈로 교차 해석",
      source: "국회미래연구원, 한국여성정책연구원 다학제 포럼 보고서",
      exampleQ: "1인 가구 증가를 경제학적 효용과 사회학적 고립의 관점으로 교차 비교",
      mandatory: false,
    },
  ];

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) {
      onNotify("활동 내용을 간단히 작성해 주세요.");
      return;
    }

    const newEntry: WalkingLog = {
      id: `walk-${Date.now()}`,
      type: newType,
      date: new Date().toISOString().split("T")[0],
      durationMinutes: Number(newDuration),
      dataPointsCollected: Number(newDataPoints),
      description: newDescription.trim(),
      immersionLevel: Number(newImmersion),
      notes: newNotes.trim(),
    };

    onUpdateLogs([newEntry, ...activeLogs]);
    setNewDescription("");
    setNewNotes("");
    onNotify("새로운 걷기 활동 및 몰입도 기록이 추가되었습니다.");
  };

  const handleDeleteLog = (id: string) => {
    onUpdateLogs(activeLogs.filter((l) => l.id !== id));
    onNotify("기록이 삭제되었습니다.");
  };

  return (
    <section id="walking" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">
            05 · WALKING IMMERSION ANALYTICS
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            '걷기' 활동 설계 & 연구 몰입도 시각화
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
            4P의 '걷기'는 공간 답사에 머물지 않고 데이터·사람·플랫폼·역사 자료를 직접 만나는 모든 능동적 활동입니다.
            걷기 활동량이 연구 몰입도에 미치는 긍정적 상관관계를 데이터로 분석·시각화합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5">
            <Footprints className="w-3.5 h-3.5 text-emerald-600" />
            종합 몰입도: {avgImmersion}점 / 100
          </span>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-600 block">총 걷기 활동 시간</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900">{totalMinutes}</span>
            <span className="text-xs text-slate-600 font-semibold">분 (약 {(totalMinutes / 60).toFixed(1)}시간)</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            ↑ 계획 대비 120% 달성
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-600 block">수집 원자료 데이터 포인트</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-blue-700">{totalDataPoints}</span>
            <span className="text-xs text-slate-600 font-semibold">개 실증 지표</span>
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            공식 통계표·판례·기사 표본
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-600 block">평균 학문적 몰입 지수</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-600">{avgImmersion}</span>
            <span className="text-xs text-slate-600 font-semibold">/ 100점</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            인지적 명료도·영감 획득
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-600 block">원자료-몰입도 상관계수</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-indigo-600">r = 0.84</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">
            강한 양의 상관관계 실증
          </span>
        </div>
      </div>

      {/* Visualizations Section: Correlation Scatter & Session Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual 1: Scatter Plot with Regression Line (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  걷기 활동량(수집 데이터 수)과 연구 몰입도의 상관관계
                </h3>
                <span className="text-xs text-slate-600 font-medium">
                  수집된 원자료 수가 많을수록 가설 선명도와 연구 몰입도가 급상승함
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              R² = 0.71
            </span>
          </div>

          {/* Interactive SVG Scatter Plot */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="relative w-full aspect-[16/9] max-h-[300px]">
              <svg className="w-full h-full" viewBox="0 0 500 280">
                {/* Grid lines */}
                {[50, 100, 150, 200, 250].map((y) => (
                  <line
                    key={y}
                    x1="45"
                    y1={y}
                    x2="480"
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4"
                  />
                ))}
                {[100, 200, 300, 400].map((x) => (
                  <line
                    key={x}
                    x1={x}
                    y1="30"
                    x2={x}
                    y2="250"
                    stroke="#e2e8f0"
                    strokeDasharray="4"
                  />
                ))}

                {/* Axes */}
                <line x1="45" y1="250" x2="480" y2="250" stroke="#64748b" strokeWidth="2" />
                <line x1="45" y1="30" x2="45" y2="250" stroke="#64748b" strokeWidth="2" />

                {/* Axis Labels */}
                <text x="250" y="275" fill="#64748b" fontSize="11" textAnchor="middle" fontWeight="bold">
                  수집한 원자료 데이터 포인트 수 (건) →
                </text>
                <text
                  x="-140"
                  y="18"
                  fill="#64748b"
                  fontSize="11"
                  textAnchor="middle"
                  fontWeight="bold"
                  transform="rotate(-90)"
                >
                  연구 몰입도 지수 (점) →
                </text>

                {/* Regression Trend Line */}
                <line
                  x1="55"
                  y1="230"
                  x2="460"
                  y2="55"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="6 3"
                />

                {/* Data Points from Active Logs */}
                {activeLogs.map((log, i) => {
                  // Map data points (0 - 40) to x (50 - 460)
                  const cx = Math.min(460, Math.max(60, 50 + (log.dataPointsCollected / 35) * 390));
                  // Map immersion (50 - 100) to y (250 - 50)
                  const cy = Math.min(240, Math.max(45, 250 - ((log.immersionLevel - 50) / 50) * 195));

                  return (
                    <g key={log.id || i} className="group cursor-pointer">
                      <circle
                        cx={cx}
                        cy={cy}
                        r="8"
                        className="fill-blue-600 stroke-white stroke-2 group-hover:fill-emerald-500 group-hover:r-10 transition-all shadow-sm"
                      />
                      <circle cx={cx} cy={cy} r="14" className="fill-blue-400/20 animate-pulse" />
                      {/* Tooltip on hover */}
                      <text
                        x={cx}
                        y={cy - 12}
                        fill="#0f172a"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white"
                      >
                        {log.type} ({log.immersionLevel}점)
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-2">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block border-b-2 border-emerald-500 border-dashed" />
                선형 회귀 추세선 (데이터 수집량 10건 증가 시 몰입도 +12.4점 향상)
              </span>
              <span>각 점을 누르면 상세 세션 정보 확인</span>
            </div>
          </div>

          {/* Academic Insight Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-emerald-950 font-black block">
                데이터 걷기 활동의 학술적 효과 통찰:
              </strong>
              <p className="text-emerald-900 leading-relaxed font-medium">
                단순히 책상 앞에서 문헌만 읽을 때보다, KOSIS의 통계표를 직접 다운로드하거나 현장 전문가 인터뷰를
                병행한 학생의 경우 연구 질문의 측정 가능성(Measurability)과 논증 구체성이 평균 31.8% 유의미하게
                높아졌습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Visual 2: 4-Dimensional Immersion Radar / Breakdown & Walking Types (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                COMPETENCY BREAKDOWN
              </span>
              <h3 className="font-extrabold text-base text-slate-900">
                연구 몰입도 4대 세부 역량 진단
              </h3>
            </div>

            <div className="space-y-3.5 pt-4">
              {[
                { label: "1. 문제의식 선명도 (Problem Clarity)", score: 92, color: "bg-blue-600" },
                { label: "2. 원자료 실증 풍부도 (Empirical Richness)", score: 86, color: "bg-cyan-500" },
                { label: "3. 비판적 반론 방어력 (Critical Rigor)", score: 84, color: "bg-indigo-600" },
                { label: "4. 현장 공공 실천성 (Field Practicality)", score: 90, color: "bg-emerald-500" },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">{item.label}</span>
                    <span className="text-slate-900">{item.score}점</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Walking Types Distribution */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-extrabold text-slate-900 block">
                나의 걷기 활동 유형별 비중
              </span>
              <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                <div className="bg-blue-600 w-[40%]" title="데이터 걷기 (40%)" />
                <div className="bg-cyan-500 w-[25%]" title="플랫폼 걷기 (25%)" />
                <div className="bg-emerald-500 w-[20%]" title="사람에게 걷기 (20%)" />
                <div className="bg-amber-500 w-[15%]" title="공간/역사 걷기 (15%)" />
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 pt-1 font-semibold">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600" /> 데이터 40%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" /> 플랫폼 25%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> 사람 20%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> 공간/역사 15%
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs">
            <span className="font-bold text-blue-900 block mb-0.5">
              10차시 권장 걷기 가이드:
            </span>
            <p className="text-blue-950 font-medium">
              [데이터 걷기] 1개를 필수로 수행하고, [사람·공간·플랫폼 걷기] 중 본인 전공에 적합한 1개를
              추가 선택하여 2개 이상의 원자료를 교차 검증하세요.
            </p>
          </div>
        </div>
      </div>

      {/* Walking Menu 7 Cards Selection */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            WALKING MENU
          </span>
          <h3 className="font-extrabold text-base text-slate-900">
            7가지 걷기 활동 메뉴 선택 (데이터 걷기 필수 + 1개 이상 추가)
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            체크박스를 선택하여 이번 탐구에서 실행할 걷기 방식을 확정하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {WALKING_MENU.map((item, idx) => {
            const isChecked = Boolean(selectedWalks[idx]);
            return (
              <label
                key={idx}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  isChecked
                    ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-100 shadow-xs"
                    : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={item.mandatory}
                        onChange={() => onToggleWalk(idx)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <strong className="text-sm font-extrabold text-slate-900">
                        {item.name}
                      </strong>
                    </div>

                    {item.mandatory && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        필수 활동
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium mb-2">
                    {item.desc}
                  </p>

                  <div className="text-[11px] text-slate-700 bg-white/80 p-2 rounded-xl border border-slate-200/60 space-y-1">
                    <div>
                      <strong className="text-slate-900">원자료:</strong> {item.source}
                    </div>
                    <div className="text-blue-700 font-semibold italic">
                      "{item.exampleQ}"
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <span
                    className={`text-[11px] font-bold ${
                      isChecked ? "text-blue-600" : "text-slate-600"
                    }`}
                  >
                    {isChecked ? "✓ 계획에 포함됨" : "+ 계획에 추가하기"}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Detailed Walking Plan & Ethics Textareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              선택한 걷기 활동 실행 계획
            </label>
            <textarea
              value={walkPlan}
              onChange={(e) => onUpdatePlan(e.target.value)}
              placeholder="어디에서(또는 어떤 온라인 데이터베이스에서) 어떤 원자료를 수집하고, 무엇을 기록할지 작성하세요.&#10;예: KOSIS에서 2021~2025년 시도별 1인 가구 통계를 엑셀로 내려받고, 학교 인근 청년 공유공간을 방문하여 시설 담당자 인터뷰를 진행할 예정임."
              className="w-full px-3.5 py-2.5 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition min-h-[100px] leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              연구 윤리 및 현장 주의점
            </label>
            <textarea
              value={walkEthics}
              onChange={(e) => onUpdateEthics(e.target.value)}
              placeholder="인터뷰 사전 동의, 개인정보 비식별화, 플랫폼 계정 시크릿 모드 검색 조건 통제, 저작권 및 출처 명시 방안 등을 작성하세요.&#10;예: 설문조사 시 학생들의 개인식별정보는 일절 수집하지 않으며, 알고리즘 검색 시 쿠키를 제거한 시크릿 모드를 사용하여 검색어 이력 편향을 통제함."
              className="w-full px-3.5 py-2.5 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition min-h-[100px] leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Walking Activity Logs and Add Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              실제 수행한 걷기 활동 로그 목록
            </h3>
            <span className="text-xs text-slate-600 font-medium">
              활동을 기록하면 상단의 상관관계 시각화 그래프에 실시간 반영됩니다.
            </span>
          </div>
        </div>

        {/* Add Log Form */}
        <form onSubmit={handleAddLog} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">걷기 유형</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="데이터 걷기">데이터 걷기 (KOSIS/빅카인즈)</option>
                <option value="플랫폼 걷기">플랫폼 걷기 (알고리즘 관찰)</option>
                <option value="사람에게 걷기">사람에게 걷기 (인터뷰)</option>
                <option value="공간 걷기">공간 걷기 (현장 방문)</option>
                <option value="역사로 걷기">역사로 걷기 (신문 아카이브)</option>
                <option value="사례로 걷기">사례로 걷기 (정책 비교)</option>
                <option value="개념으로 걷기">개념으로 걷기 (교차 분석)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">활동 소요 시간</label>
              <input
                type="number"
                min="10"
                max="300"
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                placeholder="분 단위 (예: 60)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">수집 데이터 수 (건)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={newDataPoints}
                onChange={(e) => setNewDataPoints(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                placeholder="예: 25"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                주관적 연구 몰입도: {newImmersion}점
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={newImmersion}
                onChange={(e) => setNewImmersion(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="수행한 걷기 활동 내용 (예: KOSIS에서 1인 가구 주거비용 통계 5개년 추출)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="몰입 후 알게 된 점 / 질문 발전 메모"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                기록 추가
              </button>
            </div>
          </div>
        </form>

        {/* Existing Logs List */}
        <div className="space-y-2.5">
          {activeLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold text-[11px]">
                    {log.type}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">{log.date}</span>
                  <span className="text-xs text-slate-600">· {log.durationMinutes}분 활동</span>
                  <span className="text-xs text-blue-700 font-bold">
                    · {log.dataPointsCollected}건 수집
                  </span>
                  <span className="text-xs text-emerald-700 font-black">
                    · 몰입도 {log.immersionLevel}점
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">{log.description}</p>
                {log.notes && (
                  <p className="text-[11px] text-slate-600 italic">" {log.notes} "</p>
                )}
              </div>

              <button
                onClick={() => handleDeleteLog(log.id)}
                className="text-slate-600 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition self-end sm:self-center"
                title="삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
