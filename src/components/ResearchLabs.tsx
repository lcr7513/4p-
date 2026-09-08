import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  UserCheck,
  CheckCircle,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { RESEARCH_LABS } from "../data/researchData";
import { ResearchLab, SubDiscipline } from "../types";

interface ResearchLabsProps {
  selectedLabId: number | null;
  onSelectLab: (labId: number) => void;
  onApplyQuestionToBuilder: (question: string, major: string) => void;
}

export const ResearchLabs: React.FC<ResearchLabsProps> = ({
  selectedLabId,
  onSelectLab,
  onApplyQuestionToBuilder,
}) => {
  // State for which lab is being actively explored in detail (defaults to selectedLabId or 0)
  const [activeLabId, setActiveLabId] = useState<number>(selectedLabId ?? 0);
  // State for which subdiscipline tab is active in the currently explored lab
  const [activeSubId, setActiveSubId] = useState<string>("media");

  const activeLab = RESEARCH_LABS[activeLabId] || RESEARCH_LABS[0];
  const activeSub: SubDiscipline =
    activeLab.subDisciplines.find((s) => s.id === activeSubId) || activeLab.subDisciplines[0];

  const handleSelectLabCard = (id: number) => {
    setActiveLabId(id);
    const newLab = RESEARCH_LABS[id];
    if (newLab.subDisciplines.length > 0) {
      setActiveSubId(newLab.subDisciplines[0].id);
    }
  };

  return (
    <section id="labs" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            02 · 6 MAJOR-LINKED RESEARCH LABS
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            6개 전공 연계 연구실 & 상세 탭
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
            관심 연구실을 선택한 뒤, 하단의 작은 전공 탭(미디어, 정치외교, 경제, 사회학 등)을 클릭하여
            해당 분야의 상세 연구 주제와 교수진 지도 정보를 확인하세요.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start md:self-auto">
          현재 선택된 연구실:{" "}
          <strong className="text-blue-700">
            {selectedLabId !== null ? RESEARCH_LABS[selectedLabId].name : "미선택"}
          </strong>
        </div>
      </div>

      {/* 6 Lab Grid Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESEARCH_LABS.map((lab) => {
          const isSelected = selectedLabId === lab.id;
          const isBrowsing = activeLabId === lab.id;

          return (
            <div
              key={lab.id}
              onClick={() => handleSelectLabCard(lab.id)}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                isBrowsing
                  ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-100"
                  : "bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {lab.icon}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {lab.name}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-600">
                        세부 전공 탭 {lab.subDisciplines.length}개 제공
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      내 연구실
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {lab.socialChange}
                </p>

                {/* Subdiscipline mini tabs preview */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {lab.subDisciplines.map((sub) => (
                    <span
                      key={sub.id}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition ${
                        isBrowsing && activeSubId === sub.id
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {sub.badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLab(lab.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    isSelected
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {isSelected ? "선택 완료" : "이 연구실 확정"}
                </button>

                <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  상세 탭 펼치기 <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Sub-discipline Tabs and Faculty Explorer Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        {/* Lab Header banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" />
                선택 연구실 심층 전공 탐색 탭
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white">{activeLab.name}</h3>
              <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
                핵심 쟁점: {activeLab.socialChange}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectLab(activeLab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
                  selectedLabId === activeLab.id
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {selectedLabId === activeLab.id ? "현재 선택된 연구실" : "이 연구실로 최종 선택"}
              </button>
            </div>
          </div>

          {/* Subdiscipline clickable small tabs */}
          <div className="mt-6 pt-4 border-t border-slate-700/60">
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <span>세부 전공 탭을 눌러 상세 연구 분야와 교수진을 확인하세요:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeLab.subDisciplines.map((sub) => {
                const isActive = activeSubId === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubId(sub.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                      isActive
                        ? "bg-white text-blue-900 shadow-md scale-105"
                        : "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    {sub.name}
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-blue-100 text-blue-800" : "bg-white/15 text-slate-300"
                      }`}
                    >
                      {sub.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Detail Body */}
        <div className="p-6 md:p-8 space-y-8 bg-slate-50/50">
          {/* Section 1: Detailed Research Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h4 className="text-base font-extrabold text-slate-900">
                  {activeSub.name} ({activeSub.badge})의 상세 연구 분야
                </h4>
              </div>
              <span className="text-xs text-slate-600 font-medium">
                {activeSub.description}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeSub.detailedFields.map((field, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs md:text-sm font-bold text-slate-800 leading-snug">
                      {field}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Core Exemplary Questions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-600" />
              <h4 className="text-base font-extrabold text-slate-900">
                대표 탐구 질문 예시 (클릭하여 질문 빌더로 가져오기)
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {activeSub.coreQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 to-cyan-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-xs transition"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                      탐구 질문 예시 {idx + 1}
                    </span>
                    <p className="text-xs md:text-sm font-extrabold text-slate-900 leading-relaxed">
                      "{q}"
                    </p>
                  </div>

                  <button
                    onClick={() => onApplyQuestionToBuilder(q, activeSub.badge)}
                    className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition flex items-center gap-1 shadow-2xs"
                  >
                    <span>이 질문 가져오기</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <span>
                <strong className="text-slate-800">권장 연구 방법:</strong>{" "}
                {activeSub.recommendedMethod}
              </span>
              <span>
                <strong className="text-slate-800">추천 원자료:</strong>{" "}
                {activeSub.recommendedSources.join(", ")}
              </span>
            </div>
          </div>

          {/* Section 3: Faculty Profiles & Advisory Insights */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <h4 className="text-base font-extrabold text-slate-900">
                교수진 및 자문 연구위원 프로필 & 탐구 조언
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSub.faculty.map((prof, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
                          {prof.name.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-extrabold text-slate-900 text-sm md:text-base">
                              {prof.name}
                            </h5>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {activeSub.badge} 자문
                            </span>
                          </div>
                          <span className="text-xs text-slate-600 font-medium block">
                            {prof.title}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 text-xs">
                      <div>
                        <span className="text-slate-600 font-semibold block">소속 및 직책:</span>
                        <span className="font-bold text-slate-800">{prof.affiliation}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-semibold block">주요 연구 분야:</span>
                        <span className="text-slate-700 font-medium">{prof.researchInterest}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-semibold block">대표 연구 실적:</span>
                        <span className="text-slate-700 italic font-medium">{prof.recentWork}</span>
                      </div>
                    </div>
                  </div>

                  {/* Professor's advisory tip for high school students */}
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs">
                    <span className="font-black text-amber-900 flex items-center gap-1 mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                      교수진의 고교생 탐구 지도 조언:
                    </span>
                    <p className="text-amber-950 font-medium leading-relaxed">
                      "{prof.advisoryTip}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
