import React, { useState } from "react";
import { X, Copy, Check, ExternalLink, Link2, Share2, CheckCircle2, AlertCircle, Settings } from "lucide-react";

interface StudentShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherWebhookUrl: string;
  onUpdateTeacherWebhook: (url: string) => void;
  onNotify: (msg: string) => void;
}

export const StudentShareModal: React.FC<StudentShareModalProps> = ({
  isOpen,
  onClose,
  teacherWebhookUrl,
  onUpdateTeacherWebhook,
  onNotify,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const [inputUrl, setInputUrl] = useState(teacherWebhookUrl || "");

  if (!isOpen) return null;

  const effectiveWebhook = (teacherWebhookUrl || localStorage.getItem("4p_teacher_webhook_url") || "").trim();
  const studentShareUrl = effectiveWebhook
    ? `${window.location.origin}${window.location.pathname}?teacherWebhook=${encodeURIComponent(effectiveWebhook)}`
    : `${window.location.origin}${window.location.pathname}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(studentShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
    onNotify("학생 배포용 링크가 클립보드에 복사되었습니다!");
  };

  const handleSaveWebhook = () => {
    const trimmed = inputUrl.trim();
    localStorage.setItem("4p_teacher_webhook_url", trimmed);
    onUpdateTeacherWebhook(trimmed);
    setShowSetting(false);
    onNotify(
      trimmed
        ? "교사용 구글 시트 웹 앱 URL이 성공적으로 등록되었습니다!"
        : "교사용 웹 앱 URL이 초기화되었습니다."
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-cyan-300 border border-white/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                  STUDENT DISTRIBUTION LINK
                </span>
                {effectiveWebhook ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950 flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    교사용 시트 수합 활성화
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                    시트 URL 등록 필요
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-white">학생 배포용 전용 링크 안내</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Important Notice */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1.5 leading-relaxed">
            <div className="font-extrabold flex items-center gap-1.5 text-blue-900">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              선생님, 이 링크 창은 닫기 버튼을 누르기 전까지 절대 자동으로 사라지지 않습니다!
            </div>
            <p className="text-slate-700">
              아래 링크를 복사하여 학생들에게 전달(카카오톡, 밴드, 구글 클래스룸 등)하시면,
              학생들이 링크를 열었을 때 <strong>선생님의 구글 시트가 100% 자동 매핑</strong>되어 학생이 제출할 때마다 선생님 시트로 1행씩 누적 저장됩니다.
            </p>
          </div>

          {/* Student Link Display & Copy Area */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-900 flex items-center justify-between">
              <span>🔗 학생 공유용 링크 (클릭하여 복사)</span>
              <span className="text-[11px] text-slate-500 font-normal">전체 주소 자동 선택</span>
            </label>

            <div className="relative">
              <textarea
                readOnly
                rows={3}
                value={studentShareUrl}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className="w-full p-3.5 text-xs font-mono rounded-2xl bg-slate-950 text-emerald-300 border border-slate-800 focus:border-emerald-500 outline-none select-all resize-none shadow-inner leading-relaxed"
                title="클릭 시 전체 주소가 선택됩니다"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                onClick={handleCopy}
                className={`flex-1 w-full py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
                  copied
                    ? "bg-emerald-500 text-slate-950 shadow-emerald-500/20"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>✓ 클립보드에 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>학생용 링크 전체 복사하기</span>
                  </>
                )}
              </button>

              <a
                href={studentShareUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-300 cursor-pointer"
                title="학생 화면에서 실제로 어떻게 열리는지 새 창에서 미리 확인"
              >
                <ExternalLink className="w-4 h-4 text-slate-600" />
                <span>새 탭에서 열어보기</span>
              </a>
            </div>
          </div>

          {/* Teacher Webhook URL Accordion */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => setShowSetting(!showSetting)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>교사용 구글 시트 웹 앱 URL {showSetting ? "접기 ▲" : "확인 및 변경하기 ▼"}</span>
            </button>

            {showSetting && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  구글 스프레드시트의 <strong>[확장 프로그램] → [Apps Script]</strong>에서 배포한 웹 앱 URL(`.../exec`)을 등록합니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSaveWebhook}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition whitespace-nowrap cursor-pointer"
                  >
                    URL 저장
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {effectiveWebhook ? "✓ 교사 시트 연동 준비 완료" : "○ 웹 앱 URL 등록 대기"}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            창 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
