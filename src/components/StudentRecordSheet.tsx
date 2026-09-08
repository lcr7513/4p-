import React from "react";
import { GraduationCap, Copy, CheckCircle2 } from "lucide-react";
import { StudentRecordData } from "../types";

interface StudentRecordSheetProps {
  data: StudentRecordData;
  onUpdateField: (field: keyof StudentRecordData, value: string) => void;
  onNotify: (msg: string) => void;
}

export const StudentRecordSheet: React.FC<StudentRecordSheetProps> = ({
  data,
  onUpdateField,
  onNotify,
}) => {
  const RECORD_FIELDS: {
    key: keyof StudentRecordData;
    num: number;
    title: string;
    guide: string;
    recommendedLen: string;
    placeholder: string;
  }[] = [
    {
      num: 1,
      key: "item1_topic",
      title: "탐구 활동명 및 연구 주제",
      guide: "활동명과 함께 독립변수, 종속변수, 분석 방법이 명시된 학술 주제를 기술합니다.",
      recommendedLen: "100~150자",
      placeholder: "[4P 전공연계 사회문제탐구] 생성형 AI 환경에서 알고리즘 맞춤 뉴스가 수용자 여론 양극화에 미치는 영향 분석",
    },
    {
      num: 2,
      key: "item2_period",
      title: "활동 기간 및 총 이수 시간",
      guide: "10차시 진행 기간과 총 이수 시간(예: 20시간)을 명시합니다.",
      recommendedLen: "50자 내외",
      placeholder: "2026.03.10. ~ 2026.05.28. (총 10차시 20시간 이수)",
    },
    {
      num: 3,
      key: "item3_motivation",
      title: "탐구 동기 및 문제의식 (Why)",
      guide: "최신 사회변화와 희망 전공에 대한 관심이 결합되어 탐구를 시작하게 된 계기를 진솔하게 씁니다.",
      recommendedLen: "200~300자",
      placeholder: "생성형 AI가 뉴스를 요약·추천하는 서비스가 확산되면서 공론장의 왜곡 가능성에 문제의식을 가짐. 평소 미디어커뮤니케이션을 지망하며 알고리즘의 편향성이 시민의 합리적 의사결정에 미치는 위험성을 계량적으로 확인하고자 탐구를 시작함.",
    },
    {
      num: 4,
      key: "item4_concept",
      title: "적용한 전공 핵심 이론/개념 2~3가지",
      guide: "교과서 및 선행연구에서 다루는 전공 이론적 개념을 정확한 학술 용어로 기술합니다.",
      recommendedLen: "150~250자",
      placeholder: "의제설정 이론(Agenda-Setting), 확증편향(Confirmation Bias), 필터버블(Filter Bubble) 개념을 탐구의 이론적 렌즈로 설정함.",
    },
    {
      num: 5,
      key: "item5_rq",
      title: "최종 탐구 질문(RQ) 및 논증 구조",
      guide: "10차시에서 확정한 질문과 보조 질문의 위계적 구조를 기록합니다.",
      recommendedLen: "150~250자",
      placeholder: "포털의 AI 뉴스 추천 알고리즘은 언론사별 노출 빈도와 의제 다양성에 어떤 구조적 격차를 유발하는가?",
    },
    {
      num: 6,
      key: "item6_walking",
      title: "실행한 걷기 활동 및 원자료 수집 경로",
      guide: "KOSIS 데이터 걷기, 플랫폼 관찰 걷기 등 직접 수집한 실증 자료의 출처를 기술합니다.",
      recommendedLen: "200~300자",
      placeholder: "빅카인즈에서 최근 3개월간 관련 기사 500건의 메타데이터를 추출하고, KOSIS의 언론수용자 의식조사 5개년 마이크로데이터를 다운로드하여 엑셀로 가공·분석함.",
    },
    {
      num: 7,
      key: "item7_analysis",
      title: "데이터 분석 및 실증 해석 과정",
      guide: "자료를 처리하고 패턴, 차이, 상관성을 밝혀낸 분석 기법을 구체적으로 설명합니다.",
      recommendedLen: "250~350자",
      placeholder: "빅카인즈 관계망 분석으로 핵심 키워드 간의 중심성 지수를 산출하고, KOSIS 통계표를 바탕으로 연령대별 포털 뉴스 의존도와 확증편향 지표의 상관계수를 계산함.",
    },
    {
      num: 8,
      key: "item8_conclusion",
      title: "도출한 핵심 결론 및 사회적 실천 대안",
      guide: "분석을 통해 검증된 최종 주장과 사회에 기여할 수 있는 정책·시민적 대안을 기술합니다.",
      recommendedLen: "200~300자",
      placeholder: "알고리즘 추천이 대형 언론사 편중을 68% 이상 심화시킴을 입증함. 이에 대응하여 '알고리즘 투명성 평가 조례' 제정과 청소년 비판적 미디어 리터러시 프로그램 도입을 제안함.",
    },
    {
      num: 9,
      key: "item9_limitation",
      title: "논리적 반론 검토 및 연구 한계 극복",
      guide: "반대 의견을 어떻게 수용하고, 연구 표본이나 기간의 한계를 어떻게 솔직히 인정했는지 기록합니다.",
      recommendedLen: "150~250자",
      placeholder: "기업의 추천 알고리즘 내부 코드를 열람할 수 없다는 한계를 인정하고, 대신 수용자 관점의 노출 데이터를 역추적하여 실증적 타당성을 보완함.",
    },
    {
      num: 10,
      key: "item10_presentation",
      title: "학술 포스터 발표 및 질의응답 성과",
      guide: "10차시 미니 학술대회에서 발표한 내용과 동료·교사의 질문에 답변한 성찰을 기술합니다.",
      recommendedLen: "150~250자",
      placeholder: "미니 학술대회에서 핵심 그래프 중심의 학술 포스터를 게시하고, '알고리즘 규제가 혁신을 저해할 수 있다'는 동료 질문에 해외 비교 사례를 들어 논리적으로 답변함.",
    },
    {
      num: 11,
      key: "item11_growth",
      title: "배우고 느낀 점 및 지적 성장 (Growth)",
      guide: "단순한 감상이 아닌, 학술적 탐구 태도와 비판적 사고력이 어떻게 성장했는지 기록합니다.",
      recommendedLen: "200~300자",
      placeholder: "단순한 인터넷 정보 검색과 학술적 실증 분석의 본질적 차이를 체득함. 공식 통계 데이터를 스스로 교차 검증하는 과정에서 데이터 리터러시와 연구 윤리의 중요성을 깊이 인식함.",
    },
    {
      num: 12,
      key: "item12_future",
      title: "대학 전공 연계 후속 심화 과제",
      guide: "대학 학부 과정에서 더 깊게 연구해보고 싶은 전문 연구 주제를 제시합니다.",
      recommendedLen: "150~250자",
      placeholder: "대학 미디어학과에 진학하여 '생성형 AI 추천 시스템의 공정성 평가지수 모델링' 및 '계량 커뮤니케이션 연구'를 심화 연구하고자 함.",
    },
  ];

  const handleCopyAll = async () => {
    const fullText = RECORD_FIELDS.map(
      (f) => `[${f.num}. ${f.title}]\n${data[f.key] || "(미작성)"}\n`
    ).join("\n------------------------------------\n\n");

    try {
      await navigator.clipboard.writeText(fullText);
      onNotify("학생부 기초자료 12개 항목 전체가 복사되었습니다.");
    } catch {
      onNotify("복사에 실패했습니다.");
    }
  };

  return (
    <section id="studentRecord" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-purple-600 tracking-wider uppercase">
            10 · SCHOOL LIFE RECORD (NEIS) DATA SHEET
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            학교생활기록부 기재 참고용 기초자료 시트 (12문항)
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
            지도교사가 과목별 세부능력 및 특기사항(세특)이나 자율·진로활동 특기사항에 학생의 자기주도적
            학술 탐구 역량을 풍부하게 기록할 수 있도록 객관적 활동 근거 12개 문항을 작성하세요.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            12개 항목 일괄 복사 (선생님 제출용)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RECORD_FIELDS.map((field) => {
          const val = data[field.key] || "";
          return (
            <div
              key={field.key}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2.5 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition"
            >
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 font-black text-xs flex items-center justify-center shrink-0">
                    {field.num}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {field.title}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                  권장 {field.recommendedLen}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {field.guide}
              </p>

              <textarea
                value={val}
                onChange={(e) => onUpdateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3.5 py-2 text-xs md:text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-purple-500 outline-none transition min-h-[85px] leading-relaxed"
              />

              <div className="text-right text-[11px] text-slate-600 font-semibold">
                {val.length > 0 ? `${val.length}자 입력됨` : "미입력"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
