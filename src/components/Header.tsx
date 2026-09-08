import React from "react";
import {
  Cloud,
  CloudCheck,
  Download,
  Upload,
  Printer,
  Sparkles,
  RefreshCw,
  Home,
  GraduationCap,
  MapPin,
  Footprints,
  BookOpen,
  FileText,
  Award,
  Layers,
  Table,
  ArrowLeft,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import { SyncStatus } from "../types";

export const NAV_ITEMS = [
  { id: "dashboard", label: "대시보드 홈", short: "홈", icon: Home },
  { id: "labs", label: "02. 6대 연구실", short: "연구실", icon: GraduationCap },
  { id: "sessions", label: "03. 10차시 로드맵", short: "로드맵", icon: MapPin },
  { id: "question", label: "04. AI 질문 빌더", short: "질문 빌더", icon: Sparkles },
  { id: "walking", label: "05. 걷기·몰입도", short: "걷기 분석", icon: Footprints },
  { id: "resources", label: "06. 연구 꾸러미", short: "자료실", icon: BookOpen },
  { id: "report", label: "07. 학술 보고서", short: "보고서", icon: FileText },
  { id: "evaluation", label: "08. 자기평가", short: "루브릭", icon: Award },
  { id: "studentRecord", label: "09. 학생부 기재", short: "학생부", icon: Layers },
  { id: "sheetExport", label: "10. 시트 동기화", short: "동기화", icon: Table },
];

interface HeaderProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  syncStatus: SyncStatus;
  onManualSync: () => void;
  onSubmitGoogleSheet?: () => void;
  isSubmittingSheet?: boolean;
  onExportJson?: () => void;
  onImportJson?: () => void;
  onJumpToDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onSelectSection,
  syncStatus,
  onManualSync,
  onSubmitGoogleSheet,
  isSubmittingSheet = false,
  onExportJson,
  onImportJson,
  onJumpToDashboard,
}) => {
  const handleHomeClick = () => {
    if (onJumpToDashboard) {
      onJumpToDashboard();
    } else {
      onSelectSection("dashboard");
    }
  };

  const isSubPage = activeSection !== "dashboard";
  const currentNav = NAV_ITEMS.find((item) => item.id === activeSection) || NAV_ITEMS[0];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Brand & Utility Row */}
      <div className="h-16 px-4 md:px-8 flex items-center justify-between gap-2 border-b border-slate-100">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={handleHomeClick}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20 shrink-0">
            4P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base md:text-lg tracking-tight">
                4P 읽걷쓰 전공연계 사회문제탐구
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3 h-3 text-blue-600" /> AI 정밀 탐구 v9
              </span>
            </div>
            <small className="block text-[11px] text-slate-700 font-medium -mt-0.5">
              전공의 눈으로 읽고 · 데이터로 걸으며 · 학술보고서로 쓰다
            </small>
          </div>
        </div>

        {/* Right Actions: Back to Dashboard button (if inside a tab) + Sync Status */}
        <div className="flex items-center gap-2">
          {isSubPage && (
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition hover:scale-102 active:scale-98"
              title="대시보드로 나가기"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>대시보드로 돌아가기</span>
            </button>
          )}

          {/* Google Sheets Direct Submission Button (Always Active & Prominent) */}
          {onSubmitGoogleSheet && (
            <button
              onClick={onSubmitGoogleSheet}
              disabled={isSubmittingSheet}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              title="클릭 시 4대 가로 시트(마스터·보고서·학생부·걷기)에 학생 연구 자료를 새 행으로 누적 제출합니다"
            >
              {isSubmittingSheet ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
              )}
              <span>{isSubmittingSheet ? "구글 시트 제출 중..." : "구글 시트 제출"}</span>
              <span className="hidden md:inline text-[10px] px-1.5 py-0.2 rounded bg-emerald-700/60 font-medium">
                누적저장
              </span>
            </button>
          )}

          {/* Real-time Cloud Sync Status Pill */}
          <button
            onClick={onManualSync}
            disabled={syncStatus.isSyncing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              syncStatus.isSyncing
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : syncStatus.lastSyncedAt
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200"
            }`}
            title="클릭 시 즉시 실시간 클라우드 동기화"
          >
            {syncStatus.isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
            ) : syncStatus.lastSyncedAt ? (
              <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="hidden sm:inline">
              {syncStatus.isSyncing
                ? "동기화 중..."
                : syncStatus.lastSyncedAt
                ? "동기화 완료"
                : "동기화 대기"}
            </span>
          </button>

          {onImportJson && (
            <button
              onClick={onImportJson}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
              title="진행상황 JSON 파일 불러오기"
            >
              <Upload className="w-3.5 h-3.5" />
              불러오기
            </button>
          )}

          {onExportJson && (
            <button
              onClick={onExportJson}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition"
              title="진행상황 JSON 파일 저장"
            >
              <Download className="w-3.5 h-3.5" />
              저장
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>인쇄·PDF</span>
          </button>
        </div>
      </div>

      {/* Global Tab Navigation Bar: Always visible so users can exit any tab anytime */}
      <div className="bg-slate-50/90 border-t border-slate-100 px-3 md:px-8 py-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
