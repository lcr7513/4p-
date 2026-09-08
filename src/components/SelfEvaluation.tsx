import React from "react";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  FileSpreadsheet,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";

interface SelfEvaluationProps {
  scores: Record<number, number>;
  checklists: Record<number, boolean>;
  onUpdateScore: (index: number, score: number) => void;
  onToggleChecklist: (index: number) => void;
  onNotify: (msg: string) => void;
  onSubmitGoogleSheet?: () => void;
  isSubmittingGoogleSheet?: boolean;
}

export const SelfEvaluation: React.FC<SelfEvaluationProps> = ({
  scores,
  checklists,
  onUpdateScore,
  onToggleChecklist,
  onNotify,
  onSubmitGoogleSheet,
  isSubmittingGoogleSheet = false,
}) => {
  const RUBRIC_ITEMS = [
    {
      num: 1,
      title: "1. 탐구 질문의 정밀성 및 구체성",
      desc: "단순 찬반이나 막연한 장단점이 아닌, 변수와 분석 대상이 명확한 연구 질문을 수립했는가?",
    },
    {
      num: 2,
      title: "2. 전공 이론 및 학술 개념 연계성",
      desc: "희망 전공의 학술적 개념, 이론 틀, 선행연구를 문제 해석의 렌즈로 타당하게 차용했는가?",
    },
    {
      num: 3,
      title: "3. 걷기 활동 및 원자료 수집의 실증성",
      desc: "KOSIS 공식 통계, 빅카인즈, 현장 인터뷰 등 1차/2차 공공 원자료를 직접 수집하여 실증했는가?",
    },
    {
      num: 4,
      title: "4. 데이터 분석 및 해석의 타당성",
      desc: "수집한 데이터에서 반복, 차이, 충돌 지점을 객관적으로 해석하고 통계 지표를 정확히 활용했는가?",
    },
    {
      num: 5,
      title: "5. 논리적 반론 검토 및 방어력",
      desc: "내 주장에 대한 가장 날카로운 반대 의견을 열린 태도로 검토하고, 연구의 한계를 솔직하게 성찰했는가?",
    },
    {
      num: 6,
      title: "6. 사회적·정책적 대안의 실천성",
      desc: "연구 결과를 바탕으로 사회적, 제도적, 개인적 차원의 균형 잡힌 해결 방안을 제안했는가?",
    },
    {
      num: 7,
      title: "7. 연구 윤리 및 AI 활용 투명성",
      desc: "출처를 정확히 표기하고, 생성형 AI 도구의 결과물을 무비판적으로 복사하지 않고 원문 대조 검증했는가?",
    },
    {
      num: 8,
      title: "8. 학술 보고서 체계성 및 후속 질문",
      desc: "10단계 학술 형식을 갖추고, 대학 학부 진학 후 심화할 구체적인 후속 질문을 도출했는가?",
    },
  ];

  const SUBMISSION_CHECKLIST = [
    "최종 탐구 질문에 전공 개념, 분석 대상, 연구 방법이 모두 포함되어 있는가?",
    "KOSIS나 공공데이터 등 1개 이상의 공공 원자료를 직접 분석했는가?",
    "걷기 활동(데이터/사람/공간/플랫폼) 기록과 몰입도 데이터가 작성되었는가?",
    "보고서 10개 단계(제목~참고문헌)가 모두 완성되었는가?",
    "인용한 모든 논문, 통계표, 기사의 참고문헌(APA 양식)이 정확히 기재되었는가?",
    "생성형 AI가 생성한 문장을 그대로 복사하지 않고 직접 논증하였는가?",
    "학생부 기재 참고용 12문항 기초자료 작성이 완료되었는가?",
    "실시간 데이터 동기화 버튼을 눌러 교사용 수합 서버에 저장을 마쳤는가?",
  ];

  const totalScore = Object.values(scores).reduce(
    (acc: number, s: number) => acc + (Number(s) || 3),
    0
  );
  const checkedCount = Object.values(checklists).filter(Boolean).length;

  return (
    <section id="evaluation" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">
            08 & 09 · SELF-EVALUATION RUBRIC & SUBMISSION CHECKLIST
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            자기평가 루브릭 & 최종 제출 점검
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
            8대 학술 평가 기준에 따라 연구 완성도를 자가 진단하고, 최종 제출 전 필수 8개 체크리스트를 확인하세요.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            자가진단 점수: {totalScore}점 / 32점 만점
          </span>
        </div>
      </div>

      {/* 8 Rubric Items */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="pb-2 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-slate-900">
            8대 학술 연구역량 평가 루브릭
          </h3>
          <span className="text-xs text-slate-600 font-medium">
            각 항목별로 본인의 연구 수준(4: 매우 우수, 3: 우수, 2: 보통, 1: 노력요함)을 정직하게 평가하세요.
          </span>
        </div>

        <div className="space-y-3">
          {RUBRIC_ITEMS.map((item, idx) => {
            const currentScore = scores[idx] !== undefined ? scores[idx] : 3;

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <h4 className="text-xs md:text-sm font-extrabold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                  {[
                    { score: 4, label: "매우 우수 (4)" },
                    { score: 3, label: "우수 (3)" },
                    { score: 2, label: "보통 (2)" },
                    { score: 1, label: "노력 요함 (1)" },
                  ].map((level) => (
                    <button
                      key={level.score}
                      onClick={() => {
                        onUpdateScore(idx, level.score);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                        currentScore === level.score
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Submission Checklist */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              최종 제출 전 8대 필수 체크리스트
            </h3>
            <span className="text-xs text-slate-600 font-medium">
              모든 항목을 충족했는지 점검한 후 체크해 주세요.
            </span>
          </div>

          <span className="text-xs font-bold text-blue-700">
            {checkedCount} / {SUBMISSION_CHECKLIST.length} 완료
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SUBMISSION_CHECKLIST.map((text, idx) => {
            const isChecked = Boolean(checklists[idx]);

            return (
              <label
                key={idx}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                  isChecked
                    ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-100"
                    : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleChecklist(idx)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-800 leading-snug">
                  {text}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Official Google Sheet Direct Submission Card */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/60 text-white shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-800/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-300">
                  FINAL SUBMISSION · GOOGLE SHEETS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950">
                  누적 모드 활성화
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
                최종 연구자료 구글 시트 공식 제출
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              ✓ 전체 4개 탭(개요·보고서·학생부·걷기) 일괄 반영
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-normal">
            아래 <strong className="text-emerald-300">[구글 시트 제출]</strong> 버튼을 클릭하면 학생의 인적사항 8열(학번·성명·학년·소속·희망전공·관심문제·연구실·RQ)과
            10단계 학술 보고서, 대입 학생부 12문항, 걷기 원자료가 연동된 구글 시트에 <strong className="text-white font-bold">새로운 행으로 차곡차곡 누적 저장</strong>됩니다.
            <br />
            <span className="text-emerald-300 text-xs mt-1 block">
              ※ 누적 모드가 적용되어 있으므로, 여러 번 제출하거나 다른 학생의 데이터가 있어도 기존 기록을 덮어쓰지 않고 다음 행으로 안전하게 보존됩니다.
            </span>
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {onSubmitGoogleSheet ? (
              <button
                onClick={onSubmitGoogleSheet}
                disabled={isSubmittingGoogleSheet}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-98 text-slate-950 font-black text-sm flex items-center gap-2.5 shadow-lg shadow-emerald-500/30 transition hover:scale-102 cursor-pointer"
              >
                {isSubmittingGoogleSheet ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>구글 시트 누적 제출 처리 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 stroke-[2.5]" />
                    <span>구글 시트 최종 제출하기 (학생 데이터 누적 저장)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => onNotify("시트 동기화 탭에서 구글 시트 연동을 확인해 주세요.")}
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>구글 시트 제출하기</span>
              </button>
            )}

            <span className="text-xs text-slate-300 font-medium">
              8대 체크리스트: {checkedCount}/{SUBMISSION_CHECKLIST.length} 항목 점검 완료
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
