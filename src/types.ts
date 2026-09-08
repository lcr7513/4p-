export interface SubDiscipline {
  id: string;
  name: string;
  badge: string;
  description: string;
  detailedFields: string[];
  coreQuestions: string[];
  recommendedMethod: string;
  recommendedSources: string[];
  faculty: {
    name: string;
    title: string;
    affiliation: string;
    researchInterest: string;
    recentWork: string;
    advisoryTip: string;
  }[];
}

export interface ResearchLab {
  id: number;
  name: string;
  shortName: string;
  icon: string;
  socialChange: string;
  subDisciplines: SubDiscipline[];
}

export interface ResourceDocument {
  id: string;
  level: number;
  levelTitle: string;
  title: string;
  publisher: string;
  category: string;
  year: string;
  summary: string;
  sampleExcerpts: string;
  methodNotes: string;
  downloadFileName: string;
  fileContent: string;
  citationFormat: string;
  keyKeywords: string[];
}

export interface WalkingLog {
  id: string;
  type: string;
  date: string;
  durationMinutes: number;
  dataPointsCollected: number;
  description: string;
  immersionLevel: number; // 1 - 100
  notes: string;
}

export interface AIEvaluationResult {
  overallScore: number;
  grade: string;
  criteriaScores: {
    specificity: number;
    feasibility: number;
    theoreticalLinkage: number;
    methodologicalRigor: number;
    originality: number;
  };
  strengths: string[];
  improvements: string[];
  refinedQuestions: string[];
  suggestedSubQuestions: string[];
  personalizedGuidance: string;
  isAiGenerated?: boolean;
}

export interface AIRecommendation {
  title: string;
  question: string;
  concept: string;
  method: string;
  dataSources: string;
  walkingTip: string;
}

export interface StudentProfile {
  studentId: string;
  name: string;
  grade: string;
  major: string;
  issue: string;
}

export interface StudentRecordData {
  item1_topic: string;
  item2_period: string;
  item3_motivation: string;
  item4_concept: string;
  item5_rq: string;
  item6_walking: string;
  item7_analysis: string;
  item8_conclusion: string;
  item9_limitation: string;
  item10_presentation: string;
  item11_growth: string;
  item12_future: string;
  [key: string]: string;
}

export interface ReportDraft {
  ch1_title: string;
  ch2_background: string;
  ch3_theory: string;
  ch4_questions: string;
  ch5_methods: string;
  ch6_findings: string;
  ch7_discussion: string;
  ch8_limitations: string;
  ch9_conclusion: string;
  ch10_references: string;
  [key: string]: string;
}

export interface GoogleSheetSyncInfo {
  isConnected: boolean;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  spreadsheetTitle: string | null;
  lastSyncedAt: string | null;
  userEmail?: string | null;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  autoSyncEnabled?: boolean;
  isAutoSyncEnabled?: boolean;
  teacherSheetWebhookUrl?: string;
  serverRecordsCount: number;
  syncCount?: number;
  lastError?: string | null;
  googleSheet?: GoogleSheetSyncInfo;
}

