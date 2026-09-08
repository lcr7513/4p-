import React, { useState, useEffect } from "react";
import {
  CloudCheck,
  RefreshCw,
  FileDown,
  Copy,
  Table,
  Sparkles,
  CheckCircle2,
  Users,
  Settings,
  Send,
  Database,
  ExternalLink,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  Check,
  Share2,
  Link2,
} from "lucide-react";
import { StudentProfile, SyncStatus, GoogleSheetSyncInfo } from "../types";
import {
  createGoogleSpreadsheet,
  updateGoogleSpreadsheet,
  submitToGoogleSpreadsheet,
  getAccessToken,
  HORIZONTAL_STUDENT_HEADERS,
  buildHorizontalStudentRow,
  HORIZONTAL_REPORT_HEADERS,
  buildHorizontalReportRow,
  HORIZONTAL_STUDENT_RECORD_HEADERS,
  buildHorizontalStudentRecordRow,
  HORIZONTAL_WALKING_HEADERS,
  buildHorizontalWalkingRow,
} from "../services/googleSheets";

interface SheetSyncExportProps {
  profile: StudentProfile;
  syncStatus: SyncStatus;
  fullAppData: any;
  onManualSync: () => void;
  onSubmitGoogleSheet?: () => void;
  isSubmittingGoogleSheet?: boolean;
  onUpdateTeacherWebhook: (url: string) => void;
  onUpdateGoogleSheetInfo?: (info: GoogleSheetSyncInfo) => void;
  onNotify: (msg: string) => void;
}

export const SheetSyncExport: React.FC<SheetSyncExportProps> = ({
  profile,
  syncStatus,
  fullAppData,
  onManualSync,
  onSubmitGoogleSheet,
  isSubmittingGoogleSheet = false,
  onUpdateTeacherWebhook,
  onUpdateGoogleSheetInfo,
  onNotify,
}) => {
  const [webhookInput, setWebhookInput] = useState<string>(() => {
    return (
      syncStatus.teacherSheetWebhookUrl ||
      localStorage.getItem("4p_teacher_webhook_url") ||
      ""
    );
  });
  const [copiedLinkState, setCopiedLinkState] = useState(false);

  // Keep webhookInput synchronized with prop changes and local persistence
  useEffect(() => {
    const activeUrl = syncStatus.teacherSheetWebhookUrl || localStorage.getItem("4p_teacher_webhook_url") || "";
    if (activeUrl && activeUrl !== webhookInput) {
      setWebhookInput(activeUrl);
    }
  }, [syncStatus.teacherSheetWebhookUrl]);

  const [allClassRecords, setAllClassRecords] = useState<any[]>([]);
  const [isLoadingClass, setIsLoadingClass] = useState(false);

  // Google Sheets integration state
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isUpdatingSheet, setIsUpdatingSheet] = useState(false);
  const [googleSheetInfo, setGoogleSheetInfo] = useState<GoogleSheetSyncInfo>(() => {
    if (syncStatus.googleSheet) return syncStatus.googleSheet;
    try {
      const saved = localStorage.getItem("4p_google_sheet_info");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      isConnected: false,
      spreadsheetId: null,
      spreadsheetUrl: null,
      spreadsheetTitle: null,
      lastSyncedAt: null,
      userEmail: null,
    };
  });

  // Keep parent in sync
  const saveGoogleSheetInfo = (info: GoogleSheetSyncInfo) => {
    setGoogleSheetInfo(info);
    localStorage.setItem("4p_google_sheet_info", JSON.stringify(info));
    if (onUpdateGoogleSheetInfo) {
      onUpdateGoogleSheetInfo(info);
    }
  };

  // Active preview tab for inspecting horizontal sheets in UI
  const [activePreviewTab, setActivePreviewTab] = useState<"master" | "report" | "record" | "walking">("master");

  // Load class sync records from server
  const fetchClassRecords = async () => {
    setIsLoadingClass(true);
    try {
      const res = await fetch("/api/sync/all");
      const data = await res.json();
      if (data.ok && Array.isArray(data.records)) {
        setAllClassRecords(data.records);
      }
    } catch (e) {
      console.warn("Failed to fetch class records", e);
    } finally {
      setIsLoadingClass(false);
    }
  };

  useEffect(() => {
    fetchClassRecords();
  }, [syncStatus.lastSyncedAt]);

  // Handle direct student accumulation submission to Google Sheets
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  const isSubmitting = isSubmittingGoogleSheet || isSubmittingInternal;

  const handleSubmitGoogleSheetAccumulation = async () => {
    if (onSubmitGoogleSheet) {
      onSubmitGoogleSheet();
      return;
    }
    setIsSubmittingInternal(true);
    try {
      onNotify("구글 계정 인증 및 스프레드시트 누적 제출을 시작합니다...");
      const result = await submitToGoogleSpreadsheet(
        googleSheetInfo.spreadsheetId,
        profile,
        fullAppData
      );
      const newInfo: GoogleSheetSyncInfo = {
        isConnected: true,
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
        spreadsheetTitle: result.title,
        lastSyncedAt: new Date().toISOString(),
      };
      saveGoogleSheetInfo(newInfo);
      const successMsg = result.isAccumulated
        ? `[${profile.name || "학생"}] 연구자료가 구글 시트에 새 행으로 성공적으로 누적 제출되었습니다!`
        : `[${result.title}] 구글 시트가 생성되고 첫 번째 학생 자료로 성공적으로 제출되었습니다!`;
      onNotify(successMsg);
    } catch (err: any) {
      console.error("Sheet submit failed:", err);
      const msg = err?.message || "구글 시트 제출 중 오류가 발생했습니다.";
      onNotify(`제출 오류: ${msg}`);
    } finally {
      setIsSubmittingInternal(false);
    }
  };

  // Handle direct creation of Google Spreadsheet in user's Drive
  const handleCreateGoogleSpreadsheet = async () => {
    setIsCreatingSheet(true);
    try {
      onNotify("구글 계정 인증 및 스프레드시트 생성을 시작합니다...");
      const result = await createGoogleSpreadsheet(profile, fullAppData);
      const newInfo: GoogleSheetSyncInfo = {
        isConnected: true,
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
        spreadsheetTitle: result.title,
        lastSyncedAt: new Date().toISOString(),
      };
      saveGoogleSheetInfo(newInfo);
      onNotify(`구글 드라이브에 [${result.title}] 시트가 성공적으로 생성되었습니다!`);
    } catch (err: any) {
      console.error("Sheet creation failed:", err);
      const msg = err?.message || "구글 시트 생성 중 오류가 발생했습니다.";
      onNotify(`연동 오류: ${msg}`);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Handle manual sync to existing linked Google Spreadsheet (Transforms Tab 1 into the 38-column horizontal master)
  const handleUpdateGoogleSpreadsheet = async () => {
    if (!googleSheetInfo.spreadsheetId) {
      handleCreateGoogleSpreadsheet();
      return;
    }
    setIsUpdatingSheet(true);
    try {
      await updateGoogleSpreadsheet(googleSheetInfo.spreadsheetId, profile, fullAppData);
      const updatedInfo: GoogleSheetSyncInfo = {
        ...googleSheetInfo,
        isConnected: true,
        lastSyncedAt: new Date().toISOString(),
      };
      saveGoogleSheetInfo(updatedInfo);
      onNotify("모든 시트(1~4탭)가 인적사항 포함 가로 1행 구조로 완벽히 변환 및 동기화되었습니다! 기존의 세로 잔여 내용은 깨끗이 삭제되었습니다.");
    } catch (err: any) {
      console.error("Sheet update failed:", err);
      const msg = err?.message || "구글 시트 동기화 중 오류가 발생했습니다.";
      onNotify(`동기화 오류: ${msg}`);
    } finally {
      setIsUpdatingSheet(false);
    }
  };

  // Disconnect sheet link
  const handleDisconnectSheet = () => {
    if (confirm("연동된 구글 시트 연결 정보를 해제하시겠습니까? (구글 드라이브의 실제 시트 파일은 삭제되지 않습니다)")) {
      const resetInfo: GoogleSheetSyncInfo = {
        isConnected: false,
        spreadsheetId: null,
        spreadsheetUrl: null,
        spreadsheetTitle: null,
        lastSyncedAt: null,
      };
      saveGoogleSheetInfo(resetInfo);
      onNotify("구글 시트 연동이 해제되었습니다.");
    }
  };

  // Helper: Get active tab headers and row
  const getActiveTabData = () => {
    switch (activePreviewTab) {
      case "report":
        return {
          title: "02_10단계_학술보고서_가로",
          headers: HORIZONTAL_REPORT_HEADERS,
          row: buildHorizontalReportRow(profile, fullAppData),
          tag: "21개 열 가로 구성",
        };
      case "record":
        return {
          title: "03_학생부_12문항_가로",
          headers: HORIZONTAL_STUDENT_RECORD_HEADERS,
          row: buildHorizontalStudentRecordRow(profile, fullAppData),
          tag: "22개 열 가로 구성",
        };
      case "walking":
        return {
          title: "04_걷기_원자료_가로",
          headers: HORIZONTAL_WALKING_HEADERS,
          row: buildHorizontalWalkingRow(profile, fullAppData),
          tag: "20개 열 가로 구성",
        };
      case "master":
      default:
        return {
          title: "01_학생별_가로통합기록부",
          headers: HORIZONTAL_STUDENT_HEADERS,
          row: buildHorizontalStudentRow(profile, fullAppData),
          tag: "38개 열 마스터 가로 구성",
        };
    }
  };

  // Generate clean TSV for 1-click Google Sheet pasting for currently selected horizontal tab
  const generateGoogleSheetsTSV = (includeHeader = true) => {
    const { headers, row } = getActiveTabData();
    const formatCell = (val: any) =>
      `"${String(val ?? "").replace(/"/g, '""').replace(/[\r\n]+/g, " ")}"`;

    if (!includeHeader) {
      return row.map(formatCell).join("\t");
    }
    return `${headers.join("\t")}\n${row.map(formatCell).join("\t")}`;
  };

  // Copy TSV for 1-click pasting into cell A1 in Google Sheets (Headers + Student Row)
  const handleCopyForGoogleSheets = async () => {
    try {
      const { title } = getActiveTabData();
      const tsv = generateGoogleSheetsTSV(true);
      await navigator.clipboard.writeText(tsv);
      onNotify(`[${title}] 가로 전체 데이터(헤더+학생인적사항 1행)가 복사되었습니다. 구글 시트 A1 셀에서 Ctrl+V 하세요.`);
    } catch {
      onNotify("복사에 실패했습니다.");
    }
  };

  // Copy ONLY the student data row for appending to an existing master sheet
  const handleCopyStudentRowOnly = async () => {
    try {
      const { title } = getActiveTabData();
      const tsv = generateGoogleSheetsTSV(false);
      await navigator.clipboard.writeText(tsv);
      onNotify(`[${title}] 학생 1인 가로 1행 데이터만 복사되었습니다. 시트의 빈 행 A열에서 Ctrl+V 하세요.`);
    } catch {
      onNotify("복사에 실패했습니다.");
    }
  };

  // Download CSV file with currently selected Horizontal Columns
  const handleDownloadCSV = () => {
    try {
      const { title } = getActiveTabData();
      const tsv = generateGoogleSheetsTSV(true);
      const csv = tsv
        .split("\n")
        .map((row) =>
          row
            .split("\t")
            .map((cell) => {
              if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
                return `"${cell.replace(/"/g, '""')}"`;
              }
              return cell;
            })
            .join(",")
        )
        .join("\n");

      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `4P_${title}_${profile.studentId || "데이터"}_${profile.name || "학생"}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onNotify(`[${title}] CSV 파일이 성공적으로 다운로드되었습니다.`);
    } catch {
      onNotify("CSV 생성 중 오류가 발생했습니다.");
    }
  };

  // Export full JSON Backup
  const handleDownloadJSON = () => {
    try {
      const jsonStr = JSON.stringify(fullAppData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `4P_연구탐구_전체백업_${profile.name || "student"}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onNotify("전체 연구 데이터 백업본(JSON)이 다운로드되었습니다.");
    } catch {
      onNotify("백업본 다운로드에 실패했습니다.");
    }
  };

  return (
    <section id="sheetExport" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">
            10 · GOOGLE WORKSPACE DRIVE & SHEETS DIRECT SYNC
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>내 구글 시트 연동 & 실시간 클라우드 동기화</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              공식 연동 활성화
            </span>
          </h2>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-0.5">
            학생의 구글 드라이브에 직접 맞춤형 스프레드시트를 생성하고, 10차시 탐구 전 과정(개요·보고서·학생부·걷기로그)을 실시간 반영합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Top Quick Google Sheet Submit Button */}
          <button
            onClick={handleSubmitGoogleSheetAccumulation}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition hover:scale-102 active:scale-98 cursor-pointer"
            title="구글 시트 4개 탭 전체에 학생 연구자료를 새 행으로 누적 제출합니다"
          >
            {isSubmitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
            )}
            <span>{isSubmitting ? "구글 시트 제출 중..." : "구글 시트 제출 (누적 저장)"}</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded bg-emerald-700 font-bold">
              누적 ON
            </span>
          </button>

          <button
            onClick={onManualSync}
            disabled={syncStatus.isSyncing}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            {syncStatus.isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>웹앱 서버 동기화</span>
          </button>
        </div>
      </div>

      {/* HIGHLIGHT: Google Workspace Drive & Sheets Direct Integration Hero Card */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white shadow-xl border border-emerald-800/60 relative overflow-hidden">
        {/* Subtle background glow decoration */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-emerald-800/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-300">
                    Google Workspace API Direct Sync
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    누적 제출 활성화
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
                  내 구글 드라이브 스프레드시트 실시간 연동 & 누적 제출
                </h3>
              </div>
            </div>

            {/* Connection Status Badge */}
            <div className="flex items-center gap-2">
              {googleSheetInfo.spreadsheetId ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>내 구글 시트 연동 완료 (누적 모드)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>구글 시트 미생성 상태 (원클릭 생성 & 제출 가능)</span>
                </span>
              )}
            </div>
          </div>

          {/* Conditional View: Created & Linked vs. Not yet created */}
          {googleSheetInfo.spreadsheetId ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-300 font-bold">연동된 파일명:</span>
                    <span className="text-sm md:text-base font-extrabold text-white">
                      {googleSheetInfo.spreadsheetTitle || `[4P 읽걷쓰] ${profile.name || "학생"}_사회문제탐구_연구기록부`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      시트 ID: <code className="text-emerald-300 font-mono text-[11px]">{googleSheetInfo.spreadsheetId.substring(0, 16)}...</code>
                    </span>
                    <span>
                      최종 동기화/제출:{" "}
                      <strong className="text-white">
                        {googleSheetInfo.lastSyncedAt
                          ? new Date(googleSheetInfo.lastSyncedAt).toLocaleString("ko-KR")
                          : "방금 전"}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Primary Action: Accumulate Submit Button */}
                  <button
                    onClick={handleSubmitGoogleSheetAccumulation}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition hover:scale-102 active:scale-98 cursor-pointer"
                    title="기존 학생 데이터를 지우지 않고 새 행으로 안전하게 추가 누적 저장합니다"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <Send className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    )}
                    <span>{isSubmitting ? "누적 제출 처리 중..." : "구글 시트 제출 (누적 저장)"}</span>
                  </button>

                  <a
                    href={googleSheetInfo.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${googleSheetInfo.spreadsheetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition hover:scale-102 cursor-pointer"
                  >
                    <span>내 구글 시트 바로 열기</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                  </a>

                  <button
                    onClick={handleUpdateGoogleSpreadsheet}
                    disabled={isUpdatingSheet}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                    title="모든 시트(1~4탭)를 가로 1행 구조로 초기화하고 세로 잔여 내용을 깨끗이 삭제합니다"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingSheet ? "animate-spin" : ""}`} />
                    <span>양식 초기화 동기화</span>
                  </button>

                  <button
                    onClick={handleDisconnectSheet}
                    className="px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition cursor-pointer"
                    title="연결 해제 후 새로 만들기"
                  >
                    연결 해제
                  </button>
                </div>
              </div>

              {/* Accumulation Mode Notification */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-xs text-emerald-200 flex items-start gap-2.5">
                <span className="text-base leading-none mt-0.5">💡</span>
                <p className="leading-relaxed">
                  <strong className="text-white font-bold">학생 데이터 누적(Append) 모드 작동 중:</strong>{" "}
                  <strong>[구글 시트 제출 (누적 저장)]</strong> 버튼을 클릭할 때마다 이전 학생들의 데이터가 지워지지 않고,
                  4개 시트(마스터·보고서·학생부·걷기) 모두에 <strong>새로운 행(Row)으로 계속해서 차곡차곡 누적 기록</strong>됩니다.
                  각 행에는 <strong>학번·성명·학년·소속·희망전공·관심문제·연구실·RQ 8대 인적사항</strong>이 일관되게 포함됩니다.
                </p>
              </div>

              {/* Transformation Notice for Image 1 to Image 2 & All Horizontal Sheets */}
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-xs text-cyan-200 flex items-start gap-2.5">
                <span className="text-base leading-none mt-0.5">✨</span>
                <p className="leading-relaxed">
                  <strong className="text-white font-bold">모든 시트(1~4탭) 가로형 일괄 전환 및 세로 찌꺼기 완전 삭제:</strong>{" "}
                  기존 시트에 남아 있던 세로 레이블이나 설명 텍스트는 깨끗하게 초기화되고, 4개 시트 모두{" "}
                  <strong>[학번·성명·학년·소속·희망전공·관심문제·연구실·RQ] 8대 인적사항이 A~H열에 가로로 자동 포함</strong>되며,
                  각 탭별 핵심 원자료가 <strong>짙은 남색 헤더(#12244f), 흰색 볼드 폰트, 틀 고정(Freeze)</strong>이 적용된 가로 1행 테이블로 동기화됩니다.
                </p>
              </div>

              {/* 4 Tabs Structure Explanation with Horizontal Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border-2 border-emerald-400/40 text-xs space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950 font-black text-[10px]">TAB 1</span>
                    <span className="text-emerald-300 font-bold block">01_학생별_가로통합기록부 (38열)</span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    <strong>인적사항+보고서+학생부+걷기 종합:</strong> 학생 1인 1행 가로 데이터베이스로 수합
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-400/30 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-400 text-slate-950 font-black text-[10px]">TAB 2</span>
                    <span className="text-indigo-300 font-bold block">02_10단계_학술보고서_가로 (21열)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>인적사항 8열 가로 포함:</strong> 1장 제목부터 10장 참고문헌까지 각 단락 내용이 가로 1행으로 기록
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-400/30 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-purple-400 text-slate-950 font-black text-[10px]">TAB 3</span>
                    <span className="text-purple-300 font-bold block">03_학생부_12문항_가로 (22열)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>인적사항 8열 가로 포함:</strong> 대입 세특 12개 핵심 문항별 서술 문장이 가로 1행으로 기록
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px]">TAB 4</span>
                    <span className="text-amber-300 font-bold block">04_걷기_원자료_가로 (20열)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>인적사항 8열 가로 포함:</strong> 걷기계획, 서약, 수집건수, 몰입도, 1~5회차 현장로그 가로 기록
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-normal">
                아래 버튼을 누르면 <strong>선생님/학생분의 구글 계정 인증</strong>을 거친 후, 구글 드라이브에
                『<strong>[4P 읽걷쓰] {profile.name || "학생"}_사회문제탐구_연구기록부</strong>』 스프레드시트가 자동으로 즉시 생성됩니다.
                생성된 시트의 첫 번째 탭에는 <strong className="text-emerald-300">짙은 남색 헤더의 38열 가로 1행 마스터 테이블(두 번째 그림 양식)</strong>이 구축되며,
                세부 학술보고서 및 학생부 12문항 탭도 함께 서식화되어 채워집니다.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleSubmitGoogleSheetAccumulation}
                  disabled={isSubmitting || isCreatingSheet}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs md:text-sm flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition hover:scale-102 active:scale-98 cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <Send className="w-4 h-4 stroke-[2.5]" />
                  )}
                  <span>
                    {isSubmitting ? "구글 시트 생성 및 제출 중..." : "구글 시트 제출 (자동 생성 및 누적 저장)"}
                  </span>
                </button>

                <button
                  onClick={handleCreateGoogleSpreadsheet}
                  disabled={isCreatingSheet || isSubmitting}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                >
                  {isCreatingSheet ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  )}
                  <span>
                    {isCreatingSheet ? "가로 마스터 시트 생성 중..." : "시트 빈 양식만 먼저 생성하기"}
                  </span>
                </button>

                <span className="text-[11px] text-emerald-300/80 font-medium">
                  ※ Google Sheets & Drive 공식 API 안전 통신 (누적 모드 기본 탑재)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sync Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-600">
            <Database className="w-5 h-5" />
            <h3 className="font-extrabold text-sm text-slate-900">1. 브라우저 안전 저장</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            새로고침을 하거나 탭을 닫아도 localStorage를 통해 타이핑 즉시 안전하게 보관됩니다.
          </p>
          <span className="text-[11px] font-bold text-emerald-600 block">
            ✓ 상태: 자동 로컬 영구 보관 중
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-600">
            <FileSpreadsheet className="w-5 h-5" />
            <h3 className="font-extrabold text-sm text-slate-900">2. 내 구글 시트 연동</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            구글 드라이브에 직접 생성된 스프레드시트와 실시간 동기화되어 언제든 열람·공유할 수 있습니다.
          </p>
          <span className="text-[11px] font-bold text-emerald-600 block">
            {googleSheetInfo.spreadsheetId ? "✓ 상태: 구글 드라이브 시트 연결됨" : "○ 상태: 상단에서 원클릭 생성 가능"}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <Table className="w-5 h-5" />
            <h3 className="font-extrabold text-sm text-slate-900">3. 교사용 서버 수합</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            교사용 웹훅 또는 중앙 서버 모니터링을 통해 학급 전체 탐구 진행 현황이 집계됩니다.
          </p>
          <span className="text-[11px] font-bold text-indigo-600 block">
            ✓ 최근 동기화: {syncStatus.lastSyncedAt ? new Date(syncStatus.lastSyncedAt).toLocaleTimeString() : "기록됨"}
          </span>
        </div>
      </div>

      {/* 1-Click Export & Download Strip */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-blue-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <span className="text-xs text-cyan-300 font-bold uppercase tracking-wider block">
              {getActiveTabData().title} ({getActiveTabData().tag})
            </span>
            <h3 className="text-base md:text-lg font-black text-white">
              선택 탭 가로 1행 데이터 복사 및 엑셀(.csv) 내보내기
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyForGoogleSheets}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="선택된 시트의 전체 가로 헤더와 학생 1행을 함께 복사"
            >
              <Copy className="w-3.5 h-3.5" />
              가로 전체 복사 (헤더+1행)
            </button>

            <button
              onClick={handleCopyStudentRowOnly}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="헤더 없이 학생 데이터 1행만 복사 (기존 구글 시트 추가용)"
            >
              <Copy className="w-3.5 h-3.5" />
              학생 1행만 복사 (추가용)
            </button>

            <button
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              선택 탭 CSV 다운로드
            </button>

            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              전체 JSON 백업
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed font-medium">
          💡 <strong className="text-white">전체 4개 시트 가로 정리 안내:</strong>{" "}
          <strong className="text-emerald-300">01_가로통합기록부</strong>(38열),{" "}
          <strong className="text-indigo-300">02_10단계_학술보고서_가로</strong>(21열),{" "}
          <strong className="text-purple-300">03_학생부_12문항_가로</strong>(22열),{" "}
          <strong className="text-amber-300">04_걷기_원자료_가로</strong>(20열) 등 모든 탭의 1행에 헤더가 위치하고, 2행부터 각 학생의 인적사항과 원자료가 1행 가로 데이터로 정렬됩니다. 불필요한 설명 내용이나 세로 찌꺼기는 전부 제거되었습니다.
        </div>
      </div>

      {/* Live Horizontal Table Preview Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                구글 시트 4개 탭 가로 1행 실시간 미리보기
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                각 탭을 클릭하여 구글 시트에 가로로 기록되는 실제 데이터 형태를 확인해보세요. (좌우 스크롤 지원)
              </p>
            </div>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActivePreviewTab("master")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePreviewTab === "master"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              01 가로통합 (38열)
            </button>
            <button
              onClick={() => setActivePreviewTab("report")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePreviewTab === "report"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              02 학술보고서 가로 (21열)
            </button>
            <button
              onClick={() => setActivePreviewTab("record")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePreviewTab === "record"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              03 학생부12문항 가로 (22열)
            </button>
            <button
              onClick={() => setActivePreviewTab("walking")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePreviewTab === "walking"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              04 걷기원자료 가로 (20열)
            </button>
          </div>
        </div>

        {/* Current Tab Indicator */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-500 font-bold">선택 탭:</span>
            <span className="font-extrabold text-slate-900">{getActiveTabData().title}</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
              {getActiveTabData().tag}
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">
            ※ 모든 시트 공통: <strong>A~H열(8대 인적사항)</strong> 가로 자동 배치 & <strong>학번·성명 틀 고정</strong>
          </span>
        </div>

        {/* Horizontally Scrollable Master Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/50 shadow-inner max-h-[360px]">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-900 text-white font-bold sticky top-0 z-20">
                {getActiveTabData().headers.map((header, idx) => {
                  const isStickyLeft = idx === 0 || idx === 1;
                  const stickyClass = idx === 0
                    ? "sticky left-0 z-30 bg-slate-950 border-r border-slate-700 shadow-sm"
                    : idx === 1
                    ? "sticky left-[80px] z-30 bg-slate-950 border-r-2 border-indigo-400 shadow-sm"
                    : "";
                  return (
                    <th
                      key={idx}
                      className={`px-3 py-2.5 text-[11px] font-bold border-b border-slate-800 ${stickyClass}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-mono">
                          {idx < 26 ? String.fromCharCode(65 + idx) : `A${String.fromCharCode(65 + idx - 26)}`}
                        </span>
                        <span>{header}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white hover:bg-blue-50/40 transition">
                {getActiveTabData().row.map((cellValue, idx) => {
                  const isStickyLeft = idx === 0 || idx === 1;
                  const stickyClass = idx === 0
                    ? "sticky left-0 z-10 bg-white font-black text-slate-900 border-r border-slate-200"
                    : idx === 1
                    ? "sticky left-[80px] z-10 bg-white font-black text-blue-700 border-r-2 border-indigo-300"
                    : "";
                  return (
                    <td
                      key={idx}
                      className={`px-3 py-3 border-b border-slate-200 text-slate-700 max-w-[320px] truncate ${stickyClass}`}
                      title={cellValue || "(비어있음)"}
                    >
                      {cellValue ? (
                        <span>{cellValue}</span>
                      ) : (
                        <span className="text-slate-300 italic text-[11px]">(미작성)</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>※ A열(학번)과 B열(성명)은 좌우 스크롤 시에도 고정(Freeze)되어 편리하게 식별할 수 있습니다.</span>
          <span className="font-bold text-slate-700">{getActiveTabData().headers.length}개 필드 가로 구성</span>
        </div>
      </div>

      {/* Teacher Google Sheet Webhook Configuration & Student Distribution Link */}
      {(() => {
        const effectiveWebhook = (webhookInput || syncStatus.teacherSheetWebhookUrl || localStorage.getItem("4p_teacher_webhook_url") || "").trim();
        const studentShareUrl = effectiveWebhook
          ? `${window.location.origin}${window.location.pathname}?teacherWebhook=${encodeURIComponent(effectiveWebhook)}`
          : "";

        return (
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 md:p-8 border-2 border-indigo-500/50 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-300">
                      TEACHER CENTRAL SHEET DISPATCH
                    </span>
                    {effectiveWebhook ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        교사용 시트 연동 활성화됨 (영구 보존)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        웹 앱 URL 등록 대기
                      </span>
                    )}
                  </div>
                  <h3 className="text-base md:text-lg font-black text-white">
                    교사용 구글 시트 웹 앱 URL 등록 및 학생 배포 링크
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-normal">
              선생님의 구글 시트에서 배포한 <strong className="text-indigo-300">Apps Script 웹 앱 URL(`.../exec`)</strong>을 아래에 등록하시면,
              <strong> 이 앱을 사용하는 모든 학생들이 [웹앱 서버 동기화] 또는 [구글 시트 제출]을 누를 때마다 선생님 시트로 1행씩 자동 전송·누적 수합</strong>됩니다.
            </p>

            {/* Input & Save Button */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-indigo-200 block">
                1단계: 교사용 구글 웹 앱 URL (`https://script.google.com/macros/s/.../exec`)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={webhookInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setWebhookInput(val);
                    if (val.trim()) {
                      localStorage.setItem("4p_teacher_webhook_url", val.trim());
                    }
                  }}
                  placeholder="https://script.google.com/macros/s/.../exec (선생님의 웹 앱 URL 붙여넣기)"
                  className="flex-1 px-4 py-2.5 text-xs md:text-sm rounded-xl border border-indigo-400/30 bg-slate-900/90 text-white placeholder-slate-400 focus:bg-slate-900 focus:border-indigo-400 outline-none transition font-mono"
                />
                <button
                  onClick={() => {
                    const trimmed = webhookInput.trim();
                    localStorage.setItem("4p_teacher_webhook_url", trimmed);
                    onUpdateTeacherWebhook(trimmed);
                    onNotify(
                      trimmed
                        ? "선생님의 구글 시트 웹 앱 URL이 등록되었습니다! 아래 생성된 학생용 링크도 영구 보존됩니다."
                        : "교사용 웹 앱 URL이 초기화되었습니다."
                    );
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white text-xs font-black transition whitespace-nowrap shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  URL 전역 등록 및 영구 저장
                </button>
              </div>
            </div>

            {/* Permanent Student Distribution Link Box */}
            {effectiveWebhook ? (
              <div className="p-4 md:p-5 rounded-2xl bg-slate-900/90 border border-indigo-400/40 space-y-3 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-extrabold text-xs text-emerald-300 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-emerald-400" />
                      2단계: 학생 배포용 전용 링크 (선생님 시트 자동 연동 완비)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ✓ 브라우저를 닫거나 새로고침해도 영구 유지됩니다
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  아래 링크를 복사하여 학생들에게 공유(카카오톡, 밴드, 클래스룸 등)하세요.
                  학생이 링크를 열면 <strong>선생님의 시트가 100% 자동 연결</strong>되어, 학생이 [전송/제출]만 누르면 선생님 시트로 바로 들어옵니다.
                </p>

                {/* Visible URL Field & Copy Button */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    readOnly
                    value={studentShareUrl}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-slate-700 text-emerald-300 font-mono select-all outline-none"
                    title="클릭하여 전체 선택"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(studentShareUrl);
                        setCopiedLinkState(true);
                        setTimeout(() => setCopiedLinkState(false), 4500);
                        onNotify("학생 배포용 링크가 클립보드에 복사되었습니다! 학생들에게 공유해 주세요.");
                      }}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                        copiedLinkState
                          ? "bg-emerald-400 text-slate-950"
                          : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      }`}
                    >
                      {copiedLinkState ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          ✓ 복사 완료!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          학생 공유용 링크 복사
                        </>
                      )}
                    </button>

                    <a
                      href={studentShareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
                      title="학생 화면에서 실제로 어떻게 열리는지 새 창에서 미리보기"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      새 탭 테스트
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/5 border border-dashed border-indigo-400/30 text-xs text-indigo-200 text-center font-medium">
                ☝️ 위 1단계에 선생님의 Apps Script 웹 앱 URL을 붙여넣고 [영구 저장]을 누르시면, 학생들에게 배포할 <strong>전용 링크가 여기에 고정 생성</strong>됩니다.
              </div>
            )}
          </div>
        );
      })()}

      {/* Classroom Real-time Synced Records View */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                서버 수합 현황 및 학급 연구 진행 모니터링
              </h3>
              <span className="text-xs text-slate-600 font-medium">
                서버에 실시간 동기화된 학생들의 연구 진행 상태 목록
              </span>
            </div>
          </div>

          <button
            onClick={fetchClassRecords}
            disabled={isLoadingClass}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingClass ? "animate-spin" : ""}`} />
            목록 새로고침
          </button>
        </div>

        {allClassRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-600 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            현재 등록된 실시간 동기화 기록이 1건(내 데이터) 준비 중입니다. 상단의 '웹앱 서버 동기화'를 눌러보세요.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">학번</th>
                  <th className="p-3">이름</th>
                  <th className="p-3">희망 전공</th>
                  <th className="p-3">연구실</th>
                  <th className="p-3">진행률</th>
                  <th className="p-3">최근 동기화</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allClassRecords.map((rec: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-semibold text-slate-900">{rec.studentId || "-"}</td>
                    <td className="p-3 font-bold text-slate-900">{rec.name || "학생"}</td>
                    <td className="p-3 text-slate-700">{rec.major || "-"}</td>
                    <td className="p-3 text-blue-700 font-medium">{rec.labName || "-"}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        {rec.progressPercent || 0}% 완료
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">
                      {rec.lastUpdated ? new Date(rec.lastUpdated).toLocaleTimeString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
