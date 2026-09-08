import { StudentProfile, ReportDraft, StudentRecordData, WalkingLog } from "../types";

export const GOOGLE_CLIENT_ID =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID) ||
  "778145941236-kjn3819pl6ad19tplqh0em4n903a4lrp.apps.googleusercontent.com";

const SCOPES =
  "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

// Get or request OAuth Access Token using Google Identity Services (GIS)
export function getAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if token is still valid (with 60s buffer)
    if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
      resolve(cachedToken);
      return;
    }

    if (typeof window === "undefined" || !(window as any).google?.accounts?.oauth2) {
      reject(
        new Error(
          "구글 인증 라이브러리(GSI)가 로드되지 않았습니다. 인터넷 연결 또는 새로고침 후 다시 시도해 주세요."
        )
      );
      return;
    }

    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error || "구글 로그인 실패"));
            return;
          }

          if (response.access_token) {
            cachedToken = response.access_token;
            const expiresIn = Number(response.expires_in) || 3600;
            tokenExpiresAt = Date.now() + expiresIn * 1000;
            resolve(response.access_token);
          } else {
            reject(new Error("유효한 액세스 토큰을 수신하지 못했습니다."));
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: "" });
    } catch (err: any) {
      reject(new Error(err?.message || "구글 인증 클라이언트 초기화 실패"));
    }
  });
}

// Check if user is currently signed in with a valid token
export function isGoogleSignedIn(): boolean {
  return Boolean(cachedToken && Date.now() < tokenExpiresAt - 60000);
}

// Clear token
export function signOutGoogle(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}

export interface SpreadsheetCreationResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

// 38 Standard Horizontal Columns for 1 Student per Row (Sheet 1: Master)
export const HORIZONTAL_STUDENT_HEADERS: string[] = [
  "학번",
  "성명",
  "학년",
  "소속",
  "희망 전공",
  "관심 사회문제/현상",
  "선택 연구실",
  "확정 탐구 질문 (RQ)",
  "10차시 이수율",
  "연구 몰입도 지수",
  "자기평가 루브릭 총점",
  // 10단계 학술 보고서
  "[보고서 01] 연구 제목",
  "[보고서 02] 연구 배경 및 필요성",
  "[보고서 03] 선행연구 검토 및 이론적 틀",
  "[보고서 04] 연구 질문 및 가설",
  "[보고서 05] 걷기 및 연구 방법론",
  "[보고서 06] 데이터 분석 및 주요 발견",
  "[보고서 07] 논의 및 사회적·정책적 대안",
  "[보고서 08] 반론 검토 및 연구의 한계",
  "[보고서 09] 결론 및 대학 후속 질문",
  "[보고서 10] 참고문헌 (APA)",
  // 학생부 세특 12문항
  "[학생부 01] 활동명 및 탐구 주제",
  "[학생부 02] 활동 기간 및 이수 시수",
  "[학생부 03] 참여 동기 및 문제의식",
  "[학생부 04] 적용한 전공 핵심 이론·개념",
  "[학생부 05] 설정한 최종 연구 질문 (RQ)",
  "[학생부 06] 수행한 걷기 활동 및 원자료 수집",
  "[학생부 07] 데이터 분석 방법 및 도출 지표",
  "[학생부 08] 도출한 핵심 결론 및 사회적 대안",
  "[학생부 09] 연구의 한계 성찰 및 보완점",
  "[학생부 10] 발표 및 동료 피드백 과정",
  "[학생부 11] 활동을 통한 학술적 성장과 변화",
  "[학생부 12] 대학 진학 후 심화할 후속 연구",
  // 걷기 활동 및 메타
  "걷기 활동 계획",
  "연구 윤리 준수 서약",
  "수집 원자료 총 건수",
  "최근 걷기 현장 로그",
  "최종 갱신 일시",
];

// Common 8 Student Profile Headers for all sheets
export const STUDENT_PROFILE_HEADERS: string[] = [
  "학번",
  "성명",
  "학년",
  "소속",
  "희망 전공",
  "관심 사회문제/현상",
  "선택 연구실",
  "확정 탐구 질문 (RQ)",
];

export function buildStudentProfileRow(profile: StudentProfile, fullData: any): string[] {
  return [
    profile.studentId || "미입력",
    profile.name || "미입력",
    profile.grade || "3학년",
    profile.grade ? `${profile.grade}` : "고교",
    profile.major || "미입력",
    profile.issue || "미입력",
    fullData.selectedLabName || "미선택",
    fullData.researchQuestion || "미입력",
  ];
}

// Helper: Build horizontal 1-row data for a single student (Sheet 1)
export function buildHorizontalStudentRow(profile: StudentProfile, fullData: any): string[] {
  const reportDraft = fullData.reportDraft || {};
  const studentRecord = fullData.studentRecord || {};
  const walkingLogs: WalkingLog[] = fullData.walkingLogs || [];
  const completedSessionsCount = Object.values(fullData.sessions || {}).filter(Boolean).length;
  const rubricScoreTotal = Object.values(fullData.rubricScores || {}).reduce(
    (acc: number, s: any) => acc + (Number(s) || 3),
    0
  );
  const totalDataPoints = walkingLogs.reduce(
    (acc: number, log: any) => acc + (Number(log.dataPointsCollected) || 0),
    0
  );
  const latestLog = walkingLogs[walkingLogs.length - 1];
  const latestLogSummary = latestLog
    ? `[${latestLog.date || ""}] ${latestLog.type || ""}: ${latestLog.description || ""}`
    : "기록 없음";

  return [
    ...buildStudentProfileRow(profile, fullData),
    `${completedSessionsCount} / 10 차시 (${completedSessionsCount * 10}%)`,
    `${fullData.walkingEngagementScore || 85}점`,
    `${rubricScoreTotal}점 / 32점`,
    // 10단계 학술 보고서
    reportDraft.ch1_title || "",
    reportDraft.ch2_background || "",
    reportDraft.ch3_theory || "",
    reportDraft.ch4_questions || "",
    reportDraft.ch5_methods || "",
    reportDraft.ch6_findings || "",
    reportDraft.ch7_discussion || "",
    reportDraft.ch8_limitations || "",
    reportDraft.ch9_conclusion || "",
    reportDraft.ch10_references || "",
    // 학생부 세특 12문항
    studentRecord.item1_topic || "",
    studentRecord.item2_period || "",
    studentRecord.item3_motivation || "",
    studentRecord.item4_concept || "",
    studentRecord.item5_rq || "",
    studentRecord.item6_walking || "",
    studentRecord.item7_analysis || "",
    studentRecord.item8_conclusion || "",
    studentRecord.item9_limitation || "",
    studentRecord.item10_presentation || "",
    studentRecord.item11_growth || "",
    studentRecord.item12_future || "",
    // 걷기 및 윤리
    fullData.walkPlan || "",
    fullData.walkEthics || "",
    `${totalDataPoints}건`,
    latestLogSummary,
    new Date().toLocaleString("ko-KR"),
  ];
}

// Sheet 2: 10단계 학술보고서 가로 헤더 및 데이터 빌더 (21열)
export const HORIZONTAL_REPORT_HEADERS: string[] = [
  ...STUDENT_PROFILE_HEADERS,
  "[보고서 01] 연구 제목",
  "[보고서 02] 연구 배경 및 필요성",
  "[보고서 03] 선행연구 검토 및 이론적 틀",
  "[보고서 04] 연구 질문 및 가설",
  "[보고서 05] 걷기 및 연구 방법론",
  "[보고서 06] 데이터 분석 및 주요 발견",
  "[보고서 07] 논의 및 사회적·정책적 대안",
  "[보고서 08] 반론 검토 및 연구의 한계",
  "[보고서 09] 결론 및 대학 후속 질문",
  "[보고서 10] 참고문헌 (APA 양식)",
  "보고서 총 글자 수",
  "작성 완료 단계 수",
  "최종 갱신 일시",
];

export function buildHorizontalReportRow(profile: StudentProfile, fullData: any): string[] {
  const profileCols = buildStudentProfileRow(profile, fullData);
  const draft = fullData.reportDraft || {};
  const chapters = [
    draft.ch1_title || "",
    draft.ch2_background || "",
    draft.ch3_theory || "",
    draft.ch4_questions || "",
    draft.ch5_methods || "",
    draft.ch6_findings || "",
    draft.ch7_discussion || "",
    draft.ch8_limitations || "",
    draft.ch9_conclusion || "",
    draft.ch10_references || "",
  ];
  const totalLength = chapters.reduce((acc, text) => acc + (text || "").length, 0);
  const completedCount = chapters.filter((text) => (text || "").trim().length > 0).length;

  return [
    ...profileCols,
    ...chapters,
    `${totalLength.toLocaleString()}자`,
    `${completedCount} / 10 단계 (${completedCount * 10}%)`,
    new Date().toLocaleString("ko-KR"),
  ];
}

// Sheet 3: 학생부 12문항 가로 헤더 및 데이터 빌더 (22열)
export const HORIZONTAL_STUDENT_RECORD_HEADERS: string[] = [
  ...STUDENT_PROFILE_HEADERS,
  "[문항 01] 활동명 및 탐구 주제",
  "[문항 02] 활동 기간 및 이수 시수",
  "[문항 03] 참여 동기 및 문제의식",
  "[문항 04] 적용한 전공 핵심 이론·개념",
  "[문항 05] 설정한 최종 연구 질문 (RQ)",
  "[문항 06] 수행한 걷기 활동 및 원자료 수집",
  "[문항 07] 데이터 분석 방법 및 도출 지표",
  "[문항 08] 도출한 핵심 결론 및 사회적 대안",
  "[문항 09] 연구의 한계 성찰 및 보완점",
  "[문항 10] 발표 및 동료 피드백 과정",
  "[문항 11] 활동을 통한 학술적 성장과 변화",
  "[문항 12] 대학 진학 후 심화할 후속 연구",
  "12문항 작성 완료율",
  "최종 갱신 일시",
];

export function buildHorizontalStudentRecordRow(profile: StudentProfile, fullData: any): string[] {
  const profileCols = buildStudentProfileRow(profile, fullData);
  const rec = fullData.studentRecord || {};
  const items = [
    rec.item1_topic || "",
    rec.item2_period || "",
    rec.item3_motivation || "",
    rec.item4_concept || "",
    rec.item5_rq || "",
    rec.item6_walking || "",
    rec.item7_analysis || "",
    rec.item8_conclusion || "",
    rec.item9_limitation || "",
    rec.item10_presentation || "",
    rec.item11_growth || "",
    rec.item12_future || "",
  ];
  const completedCount = items.filter((text) => (text || "").trim().length > 0).length;

  return [
    ...profileCols,
    ...items,
    `${completedCount} / 12 문항 (${Math.round((completedCount / 12) * 100)}%)`,
    new Date().toLocaleString("ko-KR"),
  ];
}

// Sheet 4: 걷기 원자료 가로 헤더 및 데이터 빌더 (20열)
export const HORIZONTAL_WALKING_HEADERS: string[] = [
  ...STUDENT_PROFILE_HEADERS,
  "걷기 활동 계획",
  "연구 윤리 준수 서약",
  "수집 원자료 총 건수",
  "연구 몰입도 지수",
  "총 등록 로그 수",
  "최근 걷기 현장 로그",
  "[로그 01] 일자·유형·출처/장소·건수·몰입도·관찰메모",
  "[로그 02] 일자·유형·출처/장소·건수·몰입도·관찰메모",
  "[로그 03] 일자·유형·출처/장소·건수·몰입도·관찰메모",
  "[로그 04] 일자·유형·출처/장소·건수·몰입도·관찰메모",
  "[로그 05] 일자·유형·출처/장소·건수·몰입도·관찰메모",
  "최종 갱신 일시",
];

export function buildHorizontalWalkingRow(profile: StudentProfile, fullData: any): string[] {
  const profileCols = buildStudentProfileRow(profile, fullData);
  const walkingLogs: WalkingLog[] = fullData.walkingLogs || [];
  const totalDataPoints = walkingLogs.reduce(
    (acc: number, log: any) => acc + (Number(log.dataPointsCollected) || 0),
    0
  );
  const latestLog = walkingLogs[walkingLogs.length - 1];
  const latestLogSummary = latestLog
    ? `[${latestLog.date || ""}] ${latestLog.type || ""}: ${latestLog.description || ""} (${latestLog.dataPointsCollected || 0}건) - ${latestLog.notes || ""}`
    : "기록 없음";

  const logSlots: string[] = [];
  for (let i = 0; i < 5; i++) {
    const log = walkingLogs[i];
    if (log) {
      logSlots.push(
        `[${log.date || ""}] 유형: ${log.type || ""} | 장소/출처: ${log.description || ""} | 수집: ${log.dataPointsCollected || 0}건 | 몰입도: ${log.immersionLevel || 80}점 | 메모: ${log.notes || "없음"}`
      );
    } else {
      logSlots.push("");
    }
  }

  return [
    ...profileCols,
    fullData.walkPlan || "",
    fullData.walkEthics || "",
    `${totalDataPoints}건`,
    `${fullData.walkingEngagementScore || 85}점`,
    `${walkingLogs.length}건 등록`,
    latestLogSummary,
    ...logSlots,
    new Date().toLocaleString("ko-KR"),
  ];
}

// Create a new Google Spreadsheet in the user's Google Drive with styled tabs
export async function createGoogleSpreadsheet(
  profile: StudentProfile,
  fullData: any
): Promise<SpreadsheetCreationResult> {
  const token = await getAccessToken();

  const title = `[4P 읽걷쓰] ${profile.name || "학생"}_사회문제탐구_연구기록부_${profile.studentId || ""}`.trim();

  // 1. Create Spreadsheet with predefined sheets (All 4 sheets are horizontal 1-row structures)
  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title,
        locale: "ko_KR",
        autoRecalc: "ON_CHANGE",
      },
      sheets: [
        {
          properties: {
            sheetId: 0,
            title: "01_학생별_가로통합기록부",
            gridProperties: { rowCount: 100, columnCount: 45, frozenRowCount: 1, frozenColumnCount: 2 },
          },
        },
        {
          properties: {
            sheetId: 1,
            title: "02_10단계_학술보고서_가로",
            gridProperties: { rowCount: 100, columnCount: 30, frozenRowCount: 1, frozenColumnCount: 2 },
          },
        },
        {
          properties: {
            sheetId: 2,
            title: "03_학생부_12문항_가로",
            gridProperties: { rowCount: 100, columnCount: 30, frozenRowCount: 1, frozenColumnCount: 2 },
          },
        },
        {
          properties: {
            sheetId: 3,
            title: "04_걷기_원자료_가로",
            gridProperties: { rowCount: 100, columnCount: 30, frozenRowCount: 1, frozenColumnCount: 2 },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(
      errData?.error?.message || `구글 시트 생성 실패 (상태 코드: ${createRes.status})`
    );
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // 2. Populate initial values into all 4 horizontal sheets
  await populateSpreadsheetData(token, spreadsheetId, profile, fullData);

  // 3. Format header styling on all 4 sheets (Navy background, White text, Bold, Frozen Columns, Pixel Widths)
  await applyStylingToAllHorizontalSheets(token, spreadsheetId, [0, 1, 2, 3]);

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
}

// Synchronize all research data to an existing Google Spreadsheet and transform ALL Tabs into horizontal structures
export async function updateGoogleSpreadsheet(
  spreadsheetId: string,
  profile: StudentProfile,
  fullData: any,
  mode: "append" | "overwriteFirstRow" = "append"
): Promise<{ success: boolean; mode: string }> {
  const token = await getAccessToken();

  const standardTitles = [
    "01_학생별_가로통합기록부",
    "02_10단계_학술보고서_가로",
    "03_학생부_12문항_가로",
    "04_걷기_원자료_가로",
  ];

  const sheetIds: number[] = [];
  const currentTitles: string[] = [];

  // 1. Inspect existing sheet metadata and ensure tab titles
  try {
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (metaRes.ok) {
      const meta = await metaRes.json();
      const sheets = meta.sheets || [];
      const renameRequests: any[] = [];

      sheets.forEach((s: any, idx: number) => {
        const p = s.properties || {};
        const id = p.sheetId ?? idx;
        const currentTitle = p.title || `Sheet${idx + 1}`;
        sheetIds.push(id);
        currentTitles.push(currentTitle);

        const targetTitle = standardTitles[idx] || currentTitle;
        if (currentTitle !== targetTitle && idx < 4) {
          renameRequests.push({
            updateSheetProperties: {
              properties: {
                sheetId: id,
                title: targetTitle,
                gridProperties: {
                  columnCount: Math.max(p.gridProperties?.columnCount || 26, 45),
                },
              },
              fields: "title,gridProperties.columnCount",
            },
          });
        }
      });

      if (renameRequests.length > 0) {
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ requests: renameRequests }),
          }
        );
      }
    }
  } catch (e) {
    console.warn("Could not inspect or rename sheet metadata:", e);
  }

  // 2. IMPORTANT: Do NOT clear existing student data!
  // Accumulate new student data by appending to each horizontal sheet
  await populateSpreadsheetData(token, spreadsheetId, profile, fullData, mode);

  // 3. Apply Dark Navy header, white bold text, freeze columns, and column widths
  await applyStylingToAllHorizontalSheets(token, spreadsheetId, sheetIds.length > 0 ? sheetIds : [0, 1, 2, 3]);

  return { success: true, mode };
}

// Append or update single horizontal sheet with data accumulation
async function appendOrUpdateHorizontalSheet(
  token: string,
  spreadsheetId: string,
  sheetTitle: string,
  headers: string[],
  studentRow: string[],
  mode: "append" | "overwriteFirstRow" = "append"
): Promise<void> {
  // 1. Inspect existing rows in the sheet
  let existingRows: string[][] = [];
  try {
    const getRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetTitle)}'!A1:B200`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (getRes.ok) {
      const data = await getRes.json();
      existingRows = data.values || [];
    }
  } catch (err) {
    console.warn(`Could not read existing rows for ${sheetTitle}:`, err);
  }

  // Check if header row exists
  const hasHeader = existingRows.length > 0 && Boolean(existingRows[0]?.[0]);

  // If header is missing, write header to row 1 first
  if (!hasHeader) {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetTitle)}'!A1?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [headers] }),
      }
    );
    existingRows = [headers];
  }

  // 2. Data placement:
  // If mode is "overwriteFirstRow", write to row 2
  // If mode is "append" (default for accumulation), append as a new row so all students/submissions accumulate!
  if (mode === "overwriteFirstRow") {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetTitle)}'!A2?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [studentRow] }),
      }
    );
    return;
  }

  // Mode: "append" (Accumulation)
  // Use Google Sheets values:append API to seamlessly append below the last data row
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetTitle)}'!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [studentRow],
      }),
    }
  );

  // Fallback if append API returned non-OK: calculate row manually and PUT
  if (!appendRes.ok) {
    const nextRow = Math.max(2, existingRows.length + 1);
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetTitle)}'!A${nextRow}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [studentRow] }),
      }
    );
  }
}

// Helper: Populate data values across all 4 horizontal sheets with accumulation support
export async function populateSpreadsheetData(
  token: string,
  spreadsheetId: string,
  profile: StudentProfile,
  fullData: any,
  mode: "append" | "overwriteFirstRow" = "append"
) {
  // Row data for each sheet
  const masterRow = buildHorizontalStudentRow(profile, fullData);
  const reportRow = buildHorizontalReportRow(profile, fullData);
  const recordRow = buildHorizontalStudentRecordRow(profile, fullData);
  const walkingRow = buildHorizontalWalkingRow(profile, fullData);

  const t1 = "01_학생별_가로통합기록부";
  const t2 = "02_10단계_학술보고서_가로";
  const t3 = "03_학생부_12문항_가로";
  const t4 = "04_걷기_원자료_가로";

  // Append data row to each of the 4 horizontal sheets in parallel
  await Promise.all([
    appendOrUpdateHorizontalSheet(token, spreadsheetId, t1, HORIZONTAL_STUDENT_HEADERS, masterRow, mode),
    appendOrUpdateHorizontalSheet(token, spreadsheetId, t2, HORIZONTAL_REPORT_HEADERS, reportRow, mode),
    appendOrUpdateHorizontalSheet(token, spreadsheetId, t3, HORIZONTAL_STUDENT_RECORD_HEADERS, recordRow, mode),
    appendOrUpdateHorizontalSheet(token, spreadsheetId, t4, HORIZONTAL_WALKING_HEADERS, walkingRow, mode),
  ]);
}

// Comprehensive Student Submission Function:
// Always creates or appends to Google Spreadsheet cleanly, accumulating rows without data loss
export async function submitToGoogleSpreadsheet(
  currentSpreadsheetId: string | null | undefined,
  profile: StudentProfile,
  fullData: any
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string; isAccumulated: boolean }> {
  // If there's an existing linked spreadsheet, append directly to it to accumulate student data
  if (currentSpreadsheetId && currentSpreadsheetId.trim().length > 5) {
    try {
      await updateGoogleSpreadsheet(currentSpreadsheetId, profile, fullData, "append");
      return {
        spreadsheetId: currentSpreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${currentSpreadsheetId}`,
        title: `[4P 읽걷쓰] ${profile.name || "학생"}_사회문제탐구_연구기록부`,
        isAccumulated: true,
      };
    } catch (err: any) {
      console.warn("Update to existing spreadsheet failed, creating fresh sheet:", err);
      // If updating failed (e.g. deleted or permissions), fall through to creation
    }
  }

  // If no spreadsheet exists or update failed, create a new spreadsheet with the 4 horizontal tabs
  const result = await createGoogleSpreadsheet(profile, fullData);
  return {
    ...result,
    isAccumulated: false,
  };
}

// Helper: Apply professional styling to ALL horizontal sheets
async function applyStylingToAllHorizontalSheets(
  token: string,
  spreadsheetId: string,
  sheetIds: number[]
) {
  try {
    const allRequests: any[] = [];

    sheetIds.slice(0, 4).forEach((sheetId, idx) => {
      let colCount = HORIZONTAL_STUDENT_HEADERS.length;
      if (idx === 1) colCount = HORIZONTAL_REPORT_HEADERS.length;
      if (idx === 2) colCount = HORIZONTAL_STUDENT_RECORD_HEADERS.length;
      if (idx === 3) colCount = HORIZONTAL_WALKING_HEADERS.length;

      allRequests.push(
        // 1. Freeze 1st row and 2 leftmost columns (Student ID and Name)
        {
          updateSheetProperties: {
            properties: {
              sheetId,
              gridProperties: {
                frozenRowCount: 1,
                frozenColumnCount: 2,
              },
            },
            fields: "gridProperties(frozenRowCount,frozenColumnCount)",
          },
        },
        // 2. Format Header Row with deep academic navy background (#12244f) and white bold text
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: colCount,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.07,
                  green: 0.14,
                  blue: 0.31, // Deep Royal Navy (#12244f)
                },
                textFormat: {
                  foregroundColor: {
                    red: 1.0,
                    green: 1.0,
                    blue: 1.0,
                  },
                  bold: true,
                  fontSize: 11,
                },
                horizontalAlignment: "CENTER",
                verticalAlignment: "MIDDLE",
                wrapStrategy: "CLIP",
                padding: {
                  top: 8,
                  bottom: 8,
                  left: 10,
                  right: 10,
                },
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy,padding)",
          },
        },
        // 3. Set Header Row Height (40px)
        {
          updateDimensionProperties: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: 0,
              endIndex: 1,
            },
            properties: {
              pixelSize: 40,
            },
            fields: "pixelSize",
          },
        },
        // 4. Set Column Widths for student ID (90px) & Name (100px)
        {
          updateDimensionProperties: {
            range: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 1 },
            properties: { pixelSize: 90 },
            fields: "pixelSize",
          },
        },
        {
          updateDimensionProperties: {
            range: { sheetId, dimension: "COLUMNS", startIndex: 1, endIndex: 2 },
            properties: { pixelSize: 100 },
            fields: "pixelSize",
          },
        },
        // Grade & School (85px)
        {
          updateDimensionProperties: {
            range: { sheetId, dimension: "COLUMNS", startIndex: 2, endIndex: 4 },
            properties: { pixelSize: 85 },
            fields: "pixelSize",
          },
        },
        // Major, Issue, Lab (170px)
        {
          updateDimensionProperties: {
            range: { sheetId, dimension: "COLUMNS", startIndex: 4, endIndex: 7 },
            properties: { pixelSize: 170 },
            fields: "pixelSize",
          },
        },
        // RQ (280px)
        {
          updateDimensionProperties: {
            range: { sheetId, dimension: "COLUMNS", startIndex: 7, endIndex: 8 },
            properties: { pixelSize: 280 },
            fields: "pixelSize",
          },
        },
        // Content Columns (280px each)
        {
          updateDimensionProperties: {
            range: { sheetId, dimension: "COLUMNS", startIndex: 8, endIndex: colCount },
            properties: { pixelSize: 270 },
            fields: "pixelSize",
          },
        },
        // 5. Data rows center alignment for student ID & name
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 1,
              endRowIndex: 100,
              startColumnIndex: 0,
              endColumnIndex: 2,
            },
            cell: {
              userEnteredFormat: {
                horizontalAlignment: "CENTER",
                verticalAlignment: "MIDDLE",
                textFormat: {
                  bold: true,
                },
              },
            },
            fields: "userEnteredFormat(horizontalAlignment,verticalAlignment,textFormat)",
          },
        }
      );
    });

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requests: allRequests }),
      }
    );
  } catch (e) {
    console.warn("Styling all horizontal sheets failed:", e);
  }
}
