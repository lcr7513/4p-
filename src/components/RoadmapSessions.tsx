import React, { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Bot, BookOpen, Footprints, PenTool } from "lucide-react";

interface RoadmapSessionsProps {
  sessions: Record<number, boolean>;
  reflections: Record<number, string>;
  onToggleSession: (index: number) => void;
  onUpdateReflection: (index: number, value: string) => void;
  onNotify: (msg: string) => void;
}

export const RoadmapSessions: React.FC<RoadmapSessionsProps> = ({
  sessions,
  reflections,
  onToggleSession,
  onUpdateReflection,
  onNotify,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [allExpanded, setAllExpanded] = useState<boolean>(false);

  const SESSIONS_DATA = [
    {
      num: 1,
      title: "최신 사회변화와 전공 탐색",
      objective: "최신 사회변화를 살펴보고 희망 전공과 연결할 탐구 주제군을 선택한다.",
      read: "AI·노동·인구·기후·민주주의·문화 등 6대 연구실 주제 카드와 최신 시사 브리프 읽기",
      walk: "자신의 관심 전공이 다루는 사회적 문제의 실태와 현장성 탐색",
      write: "관심 주제 3개와 희망 전공 연결 메모 작성 (전공-사회문제 연결 지도)",
      ai: "관심 키워드 기반 연구 주제 후보 생성 및 주제 범위 점검",
      tools: "Gemini, Google Docs",
      output: "관심 전공–사회문제 연결 지도",
      teacher: "최신 이슈를 나열하기보다 전공별로 질문의 렌즈가 다름을 지도한다.",
      check: "내가 고른 사회변화는 희망 전공에서 왜 중요하게 연구할까?",
    },
    {
      num: 2,
      title: "전공별 질문과 연구 방법 이해",
      objective: "같은 사회현상도 전공에 따라 연구 질문과 분석 방법이 달라짐을 이해한다.",
      read: "경제학, 사회학, 법학, 미디어학의 동일 현상에 대한 연구 논문 요약문 비교",
      walk: "하나의 현상을 복수 학문 관점으로 이동하며 해석하는 개념 걷기",
      write: "전공 렌즈 카드 (핵심 개념 3가지 및 주요 원자료 유형 명시)",
      ai: "전공별 핵심 이론 개념·자료 유형·연구 방법 비교 분석표 생성",
      tools: "Gemini, Google Docs",
      output: "전공 렌즈 카드",
      teacher: "경제학은 계량 수치, 사회학은 구조와 관계, 법학은 규범과 판례를 씀을 보여 준다.",
      check: "내 전공의 핵심 개념은 무엇이며 어떤 데이터를 주로 사용하는가?",
    },
    {
      num: 3,
      title: "연구 동향 자료 읽기",
      objective: "학술논문·정책보고서·통계의 구조를 이해하고 핵심 내용을 선별 발췌한다.",
      read: "제목·초록·연구 목적·방법·결과·한계 중심으로 학술 자료 발췌 읽기",
      walk: "Google Scholar, RISS, KOSIS, 빅카인즈 등 공공 학술 경로 탐색",
      write: "연구 동향 읽기 카드 (선행연구 핵심 결론 및 내 연구와의 차별점)",
      ai: "긴 학술 자료 핵심 요약, 개념 추출, 출처 신뢰도 점검 질문 생성",
      tools: "Google Scholar, KOSIS, 빅카인즈, Gemini",
      output: "연구 동향 읽기 카드",
      teacher: "논문 전체보다 초록·방법·결과·한계 중심의 발췌 독해를 지도한다.",
      check: "이 선행연구는 누가, 언제, 어떤 목적으로 어떤 원자료를 써서 작성했는가?",
    },
    {
      num: 4,
      title: "탐구 질문 구체화",
      objective: "전공 개념, 분석 대상, 연구 방법이 선명하게 드러나는 탐구 질문을 확정한다.",
      read: "좋은 연구 질문(측정 가능, 좁은 범위)과 나쁜 질문(막연한 장단점) 비교",
      walk: "실제 원자료의 접근 가능성과 10차시 내 조사 가능 범위 확인",
      write: "최근 사회변화+전공 개념+분석 대상+연구 방법 공식으로 최종 RQ 작성",
      ai: "탐구 질문의 명확성·측정 가능성·범위 검토 및 AI 정밀 평가",
      tools: "Gemini AI 질문 평가기, Google Docs",
      output: "최종 탐구 질문(RQ) 1개, 보조 질문 2~3개",
      teacher: "큰 주제를 대상과 자료로 좁히며 'AI의 장단점' 같은 단순 주제는 지양한다.",
      check: "10차시 안에 조사 가능한가? 실제 수치나 텍스트 원자료를 손에 쥘 수 있는가?",
    },
    {
      num: 5,
      title: "연구 방법 설계",
      objective: "탐구 질문에 최적화된 자료 수집 및 분석 방법론을 구체적으로 설계한다.",
      read: "설문·인터뷰·통계·콘텐츠 분석·정책 비교 연구방법론 안내서 독해",
      walk: "데이터·사람·플랫폼·제도 중 필요한 탐구 걷기 경로 선택",
      write: "조사 대상, 표본 수, 분석 기준, 연구 윤리 유의점 작성",
      ai: "연구 방법의 타당성 점검 및 설문/인터뷰 문항 초안 보조",
      tools: "Google Docs, Forms, Sheets, Gemini",
      output: "탐구 계획서 및 자료 수집 계획표",
      teacher: "설문조사를 강제하지 않고 주제에 맞는 공공 데이터 분석을 적극 권장한다.",
      check: "내 질문에 가장 적합한 연구 방법은 무엇이며, 윤리적 유의점은 무엇인가?",
    },
    {
      num: 6,
      title: "데이터·사람·제도로 걷기",
      objective: "교실 밖의 공공 원자료·현장 전문가·제도와 만나 실증 자료를 수집한다.",
      read: "KOSIS 공식 통계표, 국회 법안 조문, 뉴스 빅데이터 원문 정독",
      walk: "KOSIS 데이터 걷기(필수) + 플랫폼/사람/공간 걷기 현장 수행",
      write: "현장 및 데이터 탐구 기록지 작성 (수집 데이터 수 및 몰입도 기록)",
      ai: "원자료 텍스트 정리, 인터뷰 내용 범주화, 키워드 빈도 추출",
      tools: "KOSIS, 빅카인즈, 국회 의안정보, Gemini",
      output: "수집된 원자료 목록 및 걷기 활동 기록지",
      teacher: "걷기는 장소 방문뿐 아니라 원자료를 직접 다루는 모든 활동임을 강조한다.",
      check: "나는 어떤 원자료를 직접 확인하여 수치와 텍스트로 기록했는가?",
    },
    {
      num: 7,
      title: "자료 분석 및 실증 해석",
      objective: "수집 자료에서 반복되는 경향, 차이, 충돌을 찾아 근거 기반 결론을 도출한다.",
      read: "수집된 데이터의 연도별·집단별 패턴 및 예상과 다른 예외 지점 분석",
      walk: "자료 속의 구체적 사례와 수치 사이를 오가며 학술적 해석 심화",
      write: "핵심 결과 3개 정리, 결과별 증빙 자료, 예상과 달랐던 점 기록",
      ai: "표·그래프 데이터 요약 보조, 통계 지표 해석 피드백",
      tools: "Google Sheets, Excel, Gemini",
      output: "자료 분석표 및 핵심 실증 결과 3개",
      teacher: "자료를 단순 나열하지 않고 '반복, 차이, 충돌, 한계'의 언어로 정리하게 한다.",
      check: "자료가 일치하는 부분과 충돌하는 부분은 무엇이며 어떤 해석이 가능한가?",
    },
    {
      num: 8,
      title: "주장·반론·대안 논증 구성",
      objective: "분석 결과를 바탕으로 주장, 예상 반론, 이를 방어한 수정 결론을 구성한다.",
      read: "서로 다른 관점의 전문가 기사 및 정책 찬반 의견서 비교 검토",
      walk: "이해관계자 입장 차이와 정책 대안의 부작용 비교 검토",
      write: "주장 → 근거 → 예상 반론 → 재검토 → 수정 결론 구조표 작성",
      ai: "내 주장에 대한 가장 강력한 학술적 반론 생성 및 논리적 비약 점검",
      tools: "Gemini, Google Docs",
      output: "논증 구조표 및 사회적 대안 비교표",
      teacher: "주장만 강변하지 않고 반론을 열린 태도로 검토하는 학술성을 평가한다.",
      check: "내 결론에 대한 가장 날카로운 반론은 무엇이며, 어떻게 보완하였는가?",
    },
    {
      num: 9,
      title: "보고서와 학술 포스터 작성",
      objective: "10차시 탐구 전 과정을 학술 보고서와 학술 포스터 양식으로 집약한다.",
      read: "학술보고서 목차 구성 원칙 및 학술 포스터 우수 예시문 독해",
      walk: "동료 보고서 초안 상호 피드백 및 논리적 흐름 점검",
      write: "서론–이론–방법–결과–논의–한계–후속질문 10단계 보고서 작성",
      ai: "문장 윤문, 제목 개선, 표·그래프 설명 캡션 점검",
      tools: "Google Docs, Canva, Gemini",
      output: "최종 탐구보고서 (10개 항목) 및 학술 포스터",
      teacher: "고등학생 수준에 맞게 주장의 크기보다 근거와 해석의 일치도를 중시한다.",
      check: "내 주장과 실증 근거가 한눈에 명확하게 연결되는가?",
    },
    {
      num: 10,
      title: "미니 학술대회와 성찰",
      objective: "탐구 결과를 5분 발표하고, 질의응답을 통해 대학 전공 후속 질문을 도출한다.",
      read: "동료들의 학술 포스터 및 발표 자료 경청 및 질문 생성",
      walk: "미니 학술대회 발표장 순회, 질의응답 및 타 전공 관점과의 교류",
      write: "질의응답 기록, 최종 개인 성찰문, 학생부 기록 기초 시트 확정",
      ai: "발표 대본 다듬기, 예상 질문 및 답변 준비",
      tools: "Google Slides, Google Docs",
      output: "5분 발표, 질의응답 기록, 후속 탐구 계획, 학생부 기초자료",
      teacher: "발표 점수보다 질의응답을 통한 생각의 확장과 후속 질문 도출을 격려한다.",
      check: "질문을 받고 내 탐구를 어떻게 보완하거나 대학에서 확장할 수 있는가?",
    },
  ];

  const toggleAll = () => {
    setAllExpanded(!allExpanded);
    setOpenIndex(allExpanded ? null : -1);
  };

  return (
    <section id="sessions" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            03 · 10-SESSION ROADMAP
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            10차시 탐구 로드맵 & 차시별 성찰
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
            각 차시를 펼쳐 읽기·걷기·쓰기·AI 활용 세부 과업을 확인하고, 완료 후 성찰을 기록하세요.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAll}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
          >
            {allExpanded ? "모두 접기" : "모두 펼치기"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {SESSIONS_DATA.map((sess, idx) => {
          const isDone = Boolean(sessions[idx]);
          const isOpen = allExpanded || openIndex === idx;

          return (
            <div
              key={sess.num}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isDone
                  ? "bg-white border-emerald-200 shadow-2xs"
                  : "bg-white border-slate-200 shadow-2xs"
              }`}
            >
              {/* Header Strip */}
              <div
                onClick={() => setOpenIndex(isOpen && !allExpanded ? null : idx)}
                className={`p-4 md:p-5 flex items-center justify-between gap-3 cursor-pointer transition ${
                  isOpen ? "bg-slate-50/80 border-b border-slate-100" : "hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition ${
                      isDone
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {sess.num}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-tight truncate">
                        {sess.num}차시 · {sess.title}
                      </h3>
                      {isDone && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                          완료됨
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                      {sess.objective}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSession(idx);
                      onNotify(isDone ? "차시 완료를 해제했습니다." : `${sess.num}차시를 완료 처리했습니다.`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      isDone
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isDone ? "완료" : "완료 체크"}</span>
                  </button>

                  <div className="text-slate-600 p-1">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expandable Body */}
              {isOpen && (
                <div className="p-5 md:p-6 space-y-4 bg-white animate-fadeIn">
                  {/* 4 Activities Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-700">
                        <BookOpen className="w-3.5 h-3.5" />
                        읽기 (Reading)
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {sess.read}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                        <Footprints className="w-3.5 h-3.5" />
                        걷기 (Walking)
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {sess.walk}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-700">
                        <PenTool className="w-3.5 h-3.5" />
                        쓰기 (Writing)
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {sess.write}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-cyan-700">
                        <Bot className="w-3.5 h-3.5" />
                        AI 활용 (AI Tools)
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {sess.ai}
                      </p>
                    </div>
                  </div>

                  {/* Extra Meta Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <strong className="text-slate-900 block font-extrabold">도구 및 산출물</strong>
                      <p className="text-slate-600 font-medium">
                        {sess.tools} → <strong className="text-blue-700">{sess.output}</strong>
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <strong className="text-slate-900 block font-extrabold">교사 지도 포인트</strong>
                      <p className="text-slate-600 font-medium">{sess.teacher}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <strong className="text-slate-900 block font-extrabold">핵심 점검 질문</strong>
                      <p className="text-slate-600 font-medium italic">"{sess.check}"</p>
                    </div>
                  </div>

                  {/* Session Reflection Textarea */}
                  <div className="pt-2">
                    <label className="block text-xs font-extrabold text-slate-800 mb-1">
                      {sess.num}차시 성찰 일지 (새롭게 알게 된 점, 보완할 점, 다음 차시 행동 계획)
                    </label>
                    <textarea
                      value={reflections[idx] || ""}
                      onChange={(e) => onUpdateReflection(idx, e.target.value)}
                      placeholder="이 차시 활동을 통해 배운 학술적 개념, 원자료 분석 과정의 어려움과 해결 노력, 다음 차시에 이어갈 내용을 구체적으로 작성하세요."
                      className="w-full px-3.5 py-2.5 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition min-h-[75px] leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
