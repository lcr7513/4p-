import React from "react";
import {
  CheckCircle2,
  TrendingUp,
  FileText,
  Sparkles,
  Footprints,
  Award,
  Layers,
  CloudCheck,
  RefreshCw,
  ArrowUpRight,
  BookOpen,
  Send,
  FileSpreadsheet,
} from "lucide-react";
import { StudentProfile, SyncStatus } from "../types";
import { RESEARCH_LABS } from "../data/researchData";

interface IntegratedDashboardProps {
  profile: StudentProfile;
  selectedLabId: number | null;
  researchQuestion: string;
  completedSessionsCount: number;
  reportCompletedCount: number;
  studentRecordCount: number;
  walkingImmersionScore: number;
  rubricScore: number;
  syncStatus: SyncStatus;
  onUpdateProfile: (field: keyof StudentProfile, value: string) => void;
  onManualSync: () => void;
  onSubmitGoogleSheet?: () => void;
  isSubmittingGoogleSheet?: boolean;
  onToggleAutoSync: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const IntegratedDashboard: React.FC<IntegratedDashboardProps> = ({
  profile,
  selectedLabId,
  researchQuestion,
  completedSessionsCount,
  reportCompletedCount,
  studentRecordCount,
  walkingImmersionScore,
  rubricScore,
  syncStatus,
  onUpdateProfile,
  onManualSync,
  onSubmitGoogleSheet,
  isSubmittingGoogleSheet = false,
  onToggleAutoSync,
  onNavigateSection,
}) => {
  const selectedLab = selectedLabId !== null ? RESEARCH_LABS[selectedLabId] : null;

  // Calculate weighted total progress
  // 10 sessions = 30%, report 10 items = 30%, student record 12 items = 25%, rubric self-eval = 15%
  const sessionPct = (completedSessionsCount / 10) * 100;
  const reportPct = (reportCompletedCount / 10) * 100;
  const recordPct = (studentRecordCount / 12) * 100;
  const rubricPct = (rubricScore / 32) * 100;
  const overallProgress = Math.min(
    100,
    Math.round(sessionPct * 0.3 + reportPct * 0.3 + recordPct * 0.25 + rubricPct * 0.15)
  );

  return (
    <section id="dashboard" className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-900 text-white p-6 md:p-10 shadow-xl border border-blue-800/30">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold tracking-wider text-cyan-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            4P 읽걷쓰 통합 연구 진행 관리 대시보드
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            전공의 눈으로 읽는 최신 사회문제 탐구
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
            AI·노동·인구·기후·문화·교육의 복합 사회변화를 희망 전공의 학술적 질문으로 전환하고,
            데이터 걷기 분석과 정밀한 학술 보고서로 완성하는 10차시 프로젝트입니다.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/90">
              대상: 고교 2·3학년
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/90">
              구조: 4P 읽기·걷기·쓰기 10차시
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-xs font-semibold text-cyan-200 border border-cyan-400/30">
              실시간 클라우드 동기화 활성화
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-xs font-semibold text-blue-200 border border-blue-400/30">
              Gemini AI 질문 평가 통합
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Cloud Sync & Overall Progress Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Overall Progress Gauge Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
                RESEARCH PROGRESS
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">전체 연구 프로젝트 진행률</h2>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-blue-700">{overallProgress}%</span>
              <span className="text-xs text-slate-600 block font-medium">종합 달성률</span>
            </div>
          </div>

          <div className="py-4 space-y-3">
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150">
                <span className="text-[11px] font-semibold text-slate-600 block">10차시 로드맵</span>
                <span className="text-base font-extrabold text-slate-900">
                  {completedSessionsCount} <span className="text-xs font-medium text-slate-600">/ 10차시</span>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150">
                <span className="text-[11px] font-semibold text-slate-600 block">보고서 10단계</span>
                <span className="text-base font-extrabold text-slate-900">
                  {reportCompletedCount} <span className="text-xs font-medium text-slate-600">/ 10항목</span>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150">
                <span className="text-[11px] font-semibold text-slate-600 block">학생부 기초자료</span>
                <span className="text-base font-extrabold text-slate-900">
                  {studentRecordCount} <span className="text-xs font-medium text-slate-600">/ 12항목</span>
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150">
                <span className="text-[11px] font-semibold text-slate-600 block">걷기 몰입 지수</span>
                <span className="text-base font-extrabold text-emerald-600">
                  {walkingImmersionScore} <span className="text-xs font-medium text-slate-600">/ 100점</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <span>마지막 활동 업데이트: {new Date().toLocaleDateString("ko-KR")}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateSection("report")}
                className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                보고서 바로 작성 <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Cloud Sync Engine Card */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-blue-800">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-blue-800/80">
              <div className="flex items-center gap-2">
                <CloudCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-base text-white">실시간 클라우드 동기화</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE ON
              </span>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                복잡한 링크를 수동으로 넣을 필요 없이, 브라우저 로컬 저장과 동시에
                서버 및 교사 수합 시트로 실시간 자동 저장됩니다.
              </p>

              <div className="p-3 rounded-xl bg-blue-950/70 border border-blue-800/60 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">동기화 상태:</span>
                  <span className="font-bold text-cyan-300">
                    {syncStatus.isSyncing ? "전송 처리 중..." : "정상 연결됨"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">최근 동기화:</span>
                  <span className="font-bold text-white">
                    {syncStatus.lastSyncedAt
                      ? new Date(syncStatus.lastSyncedAt).toLocaleTimeString()
                      : "아직 없음"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">교사 시트 누적 수합:</span>
                  <span className="font-bold text-emerald-300">
                    {syncStatus.serverRecordsCount > 0
                      ? `${syncStatus.serverRecordsCount}개 데이터 기록`
                      : "준비 완료"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-blue-900/60">
                  <span className="text-slate-400 font-medium">내 구글 시트:</span>
                  {syncStatus.googleSheet?.spreadsheetUrl ? (
                    <a
                      href={syncStatus.googleSheet.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-300 hover:text-emerald-200 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>연동 완료 (열기)</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-amber-300 font-semibold text-[11px]">
                      미생성 (클릭하여 생성)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {/* Prominent Google Sheet Submit Button with Accumulation Mode */}
            {onSubmitGoogleSheet && (
              <button
                onClick={onSubmitGoogleSheet}
                disabled={isSubmittingGoogleSheet}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-98 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition hover:scale-101 cursor-pointer"
                title="4개 시트(01~04탭)에 학생 데이터를 새 행으로 영구 누적 저장합니다"
              >
                {isSubmittingGoogleSheet ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>구글 시트 누적 제출 처리 중...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                    <span>구글 시트 제출 (학생 데이터 누적 저장)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-700/80 font-bold ml-1">
                      누적 ON
                    </span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onManualSync}
              disabled={syncStatus.isSyncing}
              className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              {syncStatus.isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  실시간 서버 동기화 중...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  실시간 교사 웹서버 동기화 실행
                </>
              )}
            </button>
            <button
              onClick={() => onNavigateSection("sheetExport")}
              className="w-full text-center text-xs text-slate-300 hover:text-emerald-300 font-medium hover:underline py-1 cursor-pointer flex items-center justify-center gap-1"
            >
              <span>4대 가로 시트(마스터·보고서·학생부·걷기) 및 연동 설정 상세 &gt;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
              STUDENT PROFILE
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">나의 탐구 프로필</h2>
          </div>
          <span className="text-xs text-slate-600 font-medium">
            입력된 내용은 자동으로 저장 및 동기화됩니다
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">학번</label>
            <input
              type="text"
              value={profile.studentId}
              onChange={(e) => onUpdateProfile("studentId", e.target.value)}
              placeholder="예: 30101"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">이름</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onUpdateProfile("name", e.target.value)}
              placeholder="학생 성명"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">학년</label>
            <select
              value={profile.grade}
              onChange={(e) => onUpdateProfile("grade", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            >
              <option value="">선택</option>
              <option value="2학년">2학년</option>
              <option value="3학년">3학년</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">희망 전공</label>
            <input
              type="text"
              value={profile.major}
              onChange={(e) => onUpdateProfile("major", e.target.value)}
              placeholder="예: 미디어커뮤니케이션"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">관심 사회변화</label>
            <input
              type="text"
              value={profile.issue}
              onChange={(e) => onUpdateProfile("issue", e.target.value)}
              placeholder="예: 생성형 AI와 뉴스 신뢰"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>
        </div>

        {/* Selected Research Lab & Current RQ highlight */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">
                선택 연구실
              </span>
              <p className="font-extrabold text-slate-900 text-sm">
                {selectedLab ? selectedLab.name : "아직 연구실을 선택하지 않았습니다."}
              </p>
            </div>
            <button
              onClick={() => onNavigateSection("labs")}
              className="px-3 py-1.5 rounded-lg bg-white text-blue-700 text-xs font-bold border border-blue-200 hover:bg-blue-100 transition shadow-2xs"
            >
              연구실 탐색
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-100 flex items-center justify-between">
            <div className="space-y-0.5 min-w-0 pr-2">
              <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wide">
                확정 탐구 질문 (RQ)
              </span>
              <p className="font-extrabold text-slate-900 text-sm truncate">
                {researchQuestion || "탐구 질문 만들기 탭에서 작성해 주세요."}
              </p>
            </div>
            <button
              onClick={() => onNavigateSection("question")}
              className="px-3 py-1.5 rounded-lg bg-white text-cyan-700 text-xs font-bold border border-cyan-200 hover:bg-cyan-100 transition shadow-2xs whitespace-nowrap"
            >
              AI 질문 평가
            </button>
          </div>
        </div>
      </div>

      {/* Quick Jump Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => onNavigateSection("labs")}
          className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black mb-2 group-hover:bg-blue-600 group-hover:text-white transition">
            02
          </div>
          <span className="text-xs font-extrabold text-slate-900 block">6개 연구실 탭</span>
          <span className="text-[11px] text-slate-600">세부 분야·교수진</span>
        </button>

        <button
          onClick={() => onNavigateSection("question")}
          className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-md transition text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-black mb-2 group-hover:bg-cyan-600 group-hover:text-white transition">
            04
          </div>
          <span className="text-xs font-extrabold text-slate-900 block">AI 질문 평가</span>
          <span className="text-[11px] text-slate-600">정밀 피드백·추천</span>
        </button>

        <button
          onClick={() => onNavigateSection("walking")}
          className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black mb-2 group-hover:bg-emerald-600 group-hover:text-white transition">
            05
          </div>
          <span className="text-xs font-extrabold text-slate-900 block">걷기 몰입도 시각화</span>
          <span className="text-[11px] text-slate-600">데이터 상관분석</span>
        </button>

        <button
          onClick={() => onNavigateSection("resources")}
          className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black mb-2 group-hover:bg-amber-600 group-hover:text-white transition">
            06
          </div>
          <span className="text-xs font-extrabold text-slate-900 block">연구 꾸러미</span>
          <span className="text-[11px] text-slate-600">미리보기·다운로드</span>
        </button>

        <button
          onClick={() => onNavigateSection("report")}
          className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black mb-2 group-hover:bg-indigo-600 group-hover:text-white transition">
            07
          </div>
          <span className="text-xs font-extrabold text-slate-900 block">보고서 10단계</span>
          <span className="text-[11px] text-slate-600">초안 작성·자동저장</span>
        </button>

        <button
          onClick={() => onNavigateSection("studentRecord")}
          className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-black mb-2 group-hover:bg-purple-600 group-hover:text-white transition">
            10
          </div>
          <span className="text-xs font-extrabold text-slate-900 block">학생부 기초자료</span>
          <span className="text-[11px] text-slate-600">12문항 수합 시트</span>
        </button>
      </div>
    </section>
  );
};
