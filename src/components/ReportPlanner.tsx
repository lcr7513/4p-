import React from "react";
import { FileText, Copy, Sparkles, CheckCircle2, Bookmark } from "lucide-react";
import { ReportDraft } from "../types";

interface ReportPlannerProps {
  draft: ReportDraft;
  onUpdateField: (field: keyof ReportDraft, value: string) => void;
  onNotify: (msg: string) => void;
}

export const ReportPlanner: React.FC<ReportPlannerProps> = ({
  draft,
  onUpdateField,
  onNotify,
}) => {
  const CHAPTERS: {
    key: keyof ReportDraft;
    num: number;
    title: string;
    guide: string;
    placeholder: string;
  }[] = [
    {
      key: "ch1_title",
      num: 1,
      title: "연구 제목 (최근 사회변화+전공개념+분석대상+연구방법)",
      guide: "단순한 '인공지능의 영향'이 아닌, 변수와 분석 방법이 명시된 학술적 제목으로 작성합니다.",
      placeholder: "예: 생성형 AI 확산에 따른 포털 시사 뉴스 추천 알고리즘의 프레이밍 편향에 관한 텍스트마이닝 실증 연구",
    },
    {
      num: 2,
      key: "ch2_background",
      title: "연구의 필요성 및 탐구 동기 (사회적 배경과 문제의식)",
      guide: "이 사회문제가 왜 지금 시급히 다루어져야 하며, 내가 왜 이 문제에 관심을 가지게 되었는지 기술합니다.",
      placeholder: "예: 2026년 대규모 언어모델(LLM)이 대중화되면서 전통적 언론의 게이트키핑 기능이 약화되고 독자의 확증편향이 심화되는 문제가 대두됨. 평소 미디어커뮤니케이션 전공을 희망하며 포털의 뉴스 소비 방식 변화가 공론장의 숙의 민주주의에 미치는 파급효과를 탐구하고자 함.",
    },
    {
      num: 3,
      key: "ch3_theory",
      title: "희망 전공 이론적 배경 및 핵심 개념",
      guide: "희망 전공의 학술 논문과 교과서에서 다루는 2~3가지 핵심 개념과 선행연구 분석틀을 설명합니다.",
      placeholder: "예: 본 연구는 언론정보학의 '의제설정 이론(Agenda-Setting Theory)'과 '필터버블(Filter Bubble)' 가설을 핵심 이론적 렌즈로 차용함. 또한 알고리즘 추천이 수용자의 선택적 노출(Selective Exposure)을 강화한다는 선행연구(홍길동, 2024)의 분석틀을 바탕으로 변수를 도출함.",
    },
    {
      num: 4,
      key: "ch4_questions",
      title: "최종 탐구 질문(RQ) 및 보조 질문",
      guide: "탐구 질문 빌더에서 도출한 최종 RQ 1개와 하위 2~3개 보조 질문을 명시합니다.",
      placeholder: "예: [주요 탐구 질문] 포털의 AI 기반 맞춤형 뉴스 배열은 언론사별 기사 노출 빈도와 이슈 다양성에 어떤 구조적 격차를 유발하는가?&#10;[보조 질문 1] 이용자 특성(로그인 유무)에 따라 추천되는 헤드라인의 논조 편향은 통계적으로 유의미한가?&#10;[보조 질문 2] 이를 완화하기 위한 알고리즘 투명성 가이드라인의 한계는 무엇인가?",
    },
    {
      num: 5,
      key: "ch5_methods",
      title: "연구 대상 및 자료 수집 방법 (데이터 걷기 포함)",
      guide: "공식 통계, 텍스트 빅데이터, 심층 인터뷰 등 실제 수행한 걷기 활동과 원자료 수집 과정을 구체적으로 서술합니다.",
      placeholder: "예: 2026년 3월부터 5월까지 빅카인즈(BigKinds)를 활용하여 '생성형 AI' 키워드 관련 주요 일간지 기사 500건을 표본으로 추출하고 관계망 텍스트마이닝을 수행함. 또한 KOSIS의 '2025 언론수용자 조사' 원자료를 분석하여 연령대별 뉴스 신뢰도 교차분석을 병행함.",
    },
    {
      num: 6,
      key: "ch6_findings",
      title: "핵심 분석 결과 및 실증 해석 (발견된 패턴 3가지)",
      guide: "수치나 텍스트 분석 결과에서 발견된 규칙성, 차이, 충돌 지점을 객관적으로 서술합니다.",
      placeholder: "예: 첫째, 알고리즘 추천 상위 기사의 68%가 대형 언론사 3사에 집중되어 다양성 지수가 급감함. 둘째, 자극적 이슈일수록 댓글 반응량과 추천 알고리즘 가중치가 비례하여 상승함. 셋째, KOSIS 데이터 분석 결과 50대 이상의 포털 뉴스 의존도가 72%로 청년층보다 높아 정보 격차 문제가 두드러짐.",
    },
    {
      num: 7,
      key: "ch7_discussion",
      title: "논의 및 사회적·정책적 대안 제시",
      guide: "분석 결과를 바탕으로 사회적 차원, 법·제도적 차원, 시민 실천 차원의 입체적 해결책을 제안합니다.",
      placeholder: "예: 단순한 플랫폼 규제를 넘어 '공공 알고리즘 검증 위원회'의 상설화와 청소년 대상 AI 미디어 리터러시 교육의 교과과정 의무화를 제안함. 아울러 포털 사업자에게 추천 가중치 지표의 공시 의무를 부여하는 방송미디어통합법 개정안을 도출함.",
    },
    {
      num: 8,
      key: "ch8_limitations",
      title: "연구의 한계 및 예상되는 반론 재검토",
      guide: "본 연구의 표본 크기, 기간의 한계를 인정하고, 반대 견해에 대해 방어 논리를 전개합니다.",
      placeholder: "예: 본 연구는 3개월간의 표본만을 분석하여 장기적 시계열 효과를 일반화하기에는 한계가 있음. 또한 플랫폼의 비공개 알고리즘 코드를 직접 열람하지 못하고 출력 결과만을 역추적(Reverse-engineering)했다는 한계가 있으나, 수용자가 직접 경험하는 노출 환경을 실증했다는 점에서 의의가 큼.",
    },
    {
      num: 9,
      key: "ch9_conclusion",
      title: "결론 및 대학 전공 후속 연구 과제",
      guide: "전체 연구를 1문단으로 요약하고, 대학 진학 후 심화 탐구하고 싶은 학술적 후속 질문을 도출합니다.",
      placeholder: "예: 본 탐구는 AI 미디어 환경에서 알고리즘이 여론 형성에 미치는 구조적 영향을 규명함. 향후 대학 미디어학과에 진학하여 '생성형 AI 추천 시스템의 공정성 평가지수(Fairness Metric) 개발'을 주제로 계량 커뮤니케이션 모델링 연구를 심화 확장하고자 함.",
    },
    {
      num: 10,
      key: "ch10_references",
      title: "학술 참고문헌 목록 (APA 표준 양식)",
      guide: "연구 꾸러미에서 수집한 학술 논문, KOSIS 통계표, 연구보고서를 정확한 서지 정보로 정리합니다.",
      placeholder: "예:&#10;1. 한국언론진흥재단 (2025). 2025 언론수용자 조사. 서울: 한국언론진흥재단.&#10;2. 정보통신정책연구원 (2024). 생성형 AI 시대 미디어 공론장 변화와 정책 과제. KISDI 정책연구, 24(8), 45-89.&#10;3. 통계청 (2025). 2024 인구총조사 가구부문 전수집계 결과. 국가통계포털(KOSIS).",
    },
  ];

  const handleCopyFullReport = async () => {
    const fullText = CHAPTERS.map(
      (c) => `[${c.num}. ${c.title}]\n${draft[c.key] || "(미작성)"}\n`
    ).join("\n------------------------------------\n\n");

    try {
      await navigator.clipboard.writeText(fullText);
      onNotify("10단계 보고서 전체 내용이 클립보드에 복사되었습니다.");
    } catch {
      onNotify("복사에 실패했습니다.");
    }
  };

  const totalChars = Object.values(draft).reduce(
    (acc: number, text) => acc + (typeof text === "string" ? text.length : 0),
    0
  );

  return (
    <section id="report" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
            07 · 10-CHAPTER ACADEMIC RESEARCH REPORT
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            보고서 10단계 초안 작성 & 실시간 자동저장
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
            연구 제목부터 결론 및 대학 후속 질문까지 10단계 학술 표준 체계로 작성하세요.
            모든 글자 수는 실시간 집계되며 브라우저와 서버에 안전하게 자동 저장됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            총 작성 분량: {totalChars.toLocaleString()}자 (공백 포함)
          </span>
          <button
            onClick={handleCopyFullReport}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            전체 초안 복사
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {CHAPTERS.map((ch) => {
          const val = draft[ch.key] || "";
          const charCount = val.length;

          return (
            <div
              key={ch.key}
              className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs space-y-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                    {ch.num}
                  </span>
                  <h3 className="font-extrabold text-sm md:text-base text-slate-900 leading-snug">
                    {ch.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600">
                    {charCount > 0 ? (
                      <span className="text-blue-700 font-bold">{charCount}자 작성됨</span>
                    ) : (
                      "미작성"
                    )}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {ch.guide}
              </p>

              <textarea
                value={val}
                onChange={(e) => onUpdateField(ch.key, e.target.value)}
                placeholder={ch.placeholder}
                className="w-full px-4 py-3 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-blue-500 outline-none transition min-h-[95px] leading-relaxed"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
