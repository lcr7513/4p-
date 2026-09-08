import React, { useState } from "react";
import {
  BookOpen,
  FileDown,
  Eye,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Bookmark,
  Sparkles,
} from "lucide-react";
import { RESOURCE_DOCUMENTS } from "../data/researchData";
import { ResourceDocument } from "../types";

interface ResourcePackModalProps {
  onAppendReferenceToReport: (citation: string) => void;
  onNotify: (msg: string) => void;
}

export const ResourcePackModal: React.FC<ResourcePackModalProps> = ({
  onAppendReferenceToReport,
  onNotify,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<ResourceDocument | null>(null);

  // Instant direct file downloader helper
  const handleDownloadFile = (doc: ResourceDocument) => {
    try {
      const mimeType = doc.downloadFileName.endsWith(".csv")
        ? "text/csv;charset=utf-8"
        : "text/plain;charset=utf-8";
      const blob = new Blob([doc.fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.downloadFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onNotify(`[${doc.downloadFileName}] 파일이 다운로드되었습니다.`);
    } catch (err) {
      onNotify("파일 다운로드 중 오류가 발생했습니다.");
    }
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onNotify(`${label} 복사되었습니다.`);
    } catch {
      onNotify("복사에 실패했습니다. 텍스트를 직접 선택해 주세요.");
    }
  };

  return (
    <section id="resources" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
            06 · RESEARCH RESOURCES PACK & AI ETHICS
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            연구 자료 꾸러미 & 원자료 미리보기·다운로드
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
            자료 예시를 클릭하면 상세 분석 정보가 미리보기 모달로 열리거나 실제 데이터 파일(.csv / .txt)이
            즉시 다운로드되어 10차시 탐구의 탄탄한 학술 근거로 활용할 수 있습니다.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
          총 {RESOURCE_DOCUMENTS.length}개 엄선 학술·원자료 세트 제공
        </div>
      </div>

      {/* 4-Tier Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            level: 1,
            title: "1단계 · 사회현상 입문",
            desc: "최신 기사·인포그래픽·트렌드 브리프에서 현상 발견",
            badge: "현상 발견",
            color: "border-blue-200 bg-blue-50/50",
          },
          {
            level: 2,
            title: "2단계 · 정책연구 보고서",
            desc: "국책연구기관(KISDI, KDI, 국회미래연구원) 보고서",
            badge: "문제 정의",
            color: "border-cyan-200 bg-cyan-50/50",
          },
          {
            level: 3,
            title: "3단계 · 학술연구 논문",
            desc: "RISS, DBpia 등 KCI 등재 학술 논문 초록과 분석틀",
            badge: "연구 동향",
            color: "border-indigo-200 bg-indigo-50/50",
          },
          {
            level: 4,
            title: "4단계 · 공공 원자료",
            desc: "KOSIS 통계표 CSV, 국회 의안 법안, 뉴스 빅데이터",
            badge: "실증 분석",
            color: "border-emerald-200 bg-emerald-50/50",
          },
        ].map((tier) => {
          const tierDocs = RESOURCE_DOCUMENTS.filter((d) => d.level === tier.level);
          return (
            <div
              key={tier.level}
              className={`p-5 rounded-2xl border ${tier.color} shadow-xs flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                    {tier.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {tierDocs.length}개 자료
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  {tier.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  {tier.desc}
                </p>

                <div className="mt-4 space-y-2.5">
                  {tierDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-blue-400 transition"
                    >
                      <span className="text-[10px] font-bold text-slate-600 block">
                        [{doc.publisher}] {doc.category}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2">
                        {doc.title}
                      </h4>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                        >
                          <Eye className="w-3 h-3" />
                          미리보기
                        </button>
                        <button
                          onClick={() => handleDownloadFile(doc)}
                          className="py-1.5 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1 transition border border-blue-200"
                          title="파일 직접 다운로드"
                        >
                          <FileDown className="w-3 h-3" />
                          다운로드
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Ethics 3-Tier Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            AI RESEARCH ETHICS GUIDELINES
          </span>
          <h3 className="font-extrabold text-base text-slate-900">
            인공지능 도구(Gemini 등) 활용 원칙 및 연구 윤리
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            AI 결과물은 반드시 원문과 대조 검증해야 하며, 문장을 그대로 복사하여 제출해서는 안 됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border-t-4 border-t-emerald-500 border-x border-b border-slate-200 space-y-2">
            <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              적극 활용 가능 (보조 도구)
            </span>
            <ul className="text-xs text-emerald-950 space-y-1.5 font-medium pl-1">
              <li>• 연구 주제 후보 브레인스토밍 및 범위 점검</li>
              <li>• 긴 학술 논문 및 정책보고서의 핵심 구조화 보조</li>
              <li>• 설문조사 및 심층 인터뷰 문항 초안 아이디어 도출</li>
              <li>• 내 주장에 대한 예상되는 강력한 학술적 반론 생성</li>
              <li>• 문장 윤문 및 학술적 표현 다듬기</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border-t-4 border-t-amber-500 border-x border-b border-slate-200 space-y-2">
            <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              주의 및 검증 필수
            </span>
            <ul className="text-xs text-amber-950 space-y-1.5 font-medium pl-1">
              <li>• AI가 제시한 통계 수치는 반드시 KOSIS 공식 통계표와 대조</li>
              <li>• 인용된 법령 및 판례 조항은 국가법령정보센터에서 재확인</li>
              <li>• 자료의 작성 시점, 작성자, 작성 목적 비판적 검토</li>
              <li>• 분석 기준과 결과 해석은 학생 본인이 직접 결정</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/70 border-t-4 border-t-red-500 border-x border-b border-slate-200 space-y-2">
            <span className="text-xs font-extrabold text-red-900 flex items-center gap-1.5">
              <X className="w-4 h-4 text-red-600" />
              엄격 금지 및 연구 부정
            </span>
            <ul className="text-xs text-red-950 space-y-1.5 font-medium pl-1">
              <li>• AI가 생성한 문장을 그대로 복사하여 보고서로 제출</li>
              <li>• 존재하지 않는 가짜 논문이나 왜곡된 통계 인용(환각 현상)</li>
              <li>• 출처 표기 없는 인용문 및 주장 도용</li>
              <li>• 인터뷰 참여자의 개인정보나 민감정보 AI에 입력</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Modal for Selected Resource Document */}
      {selectedDoc && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDoc(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  {selectedDoc.levelTitle}
                </span>
                <h3 className="text-base md:text-lg font-black text-white leading-tight">
                  {selectedDoc.title}
                </h3>
                <span className="text-xs text-slate-300 block font-medium">
                  발행기관: {selectedDoc.publisher} ({selectedDoc.year}년) · 분류: {selectedDoc.category}
                </span>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
              {/* Summary */}
              <div className="space-y-1">
                <strong className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  자료 개요 및 학술적 배경
                </strong>
                <p className="text-xs md:text-sm text-slate-800 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {selectedDoc.summary}
                </p>
              </div>

              {/* Sample Excerpt */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    원자료 발췌문 & 핵심 데이터 지표
                  </strong>
                  <button
                    onClick={() => handleCopyText(selectedDoc.sampleExcerpts, "발췌문이")}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> 발췌문 복사
                  </button>
                </div>
                <pre className="text-xs font-mono p-3.5 rounded-xl bg-slate-900 text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 border border-slate-800">
                  {selectedDoc.sampleExcerpts}
                </pre>
              </div>

              {/* Research Methodology Tips */}
              <div className="space-y-1">
                <strong className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  연구 방법론 적용 팁
                </strong>
                <p className="text-xs text-slate-700 leading-relaxed bg-blue-50/70 p-3 rounded-xl border border-blue-100 font-medium">
                  {selectedDoc.methodNotes}
                </p>
              </div>

              {/* Citation Format */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    학술 표준 참고문헌 표기 (KCI/APA 형식)
                  </strong>
                  <button
                    onClick={() => handleCopyText(selectedDoc.citationFormat, "참고문헌 표기가")}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> 인용 형식 복사
                  </button>
                </div>
                <div className="text-xs font-mono p-3 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                  {selectedDoc.citationFormat}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  onAppendReferenceToReport(selectedDoc.citationFormat);
                  onNotify("보고서의 참고문헌 목록에 자동 추가되었습니다.");
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Bookmark className="w-3.5 h-3.5" />
                내 보고서 참고문헌에 추가
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  닫기
                </button>
                <button
                  onClick={() => handleDownloadFile(selectedDoc)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <FileDown className="w-4 h-4" />
                  파일 다운로드 ({selectedDoc.downloadFileName})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
