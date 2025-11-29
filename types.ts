

export enum Subject {
  TORTS = 'Torts',
  CONTRACTS = 'Contracts',
  CRIMINAL_LAW = 'Criminal Law',
  PROPERTY = 'Property',
  CONSTITUTIONAL_LAW = 'Constitutional Law',
  EVIDENCE = 'Evidence',
  CIVIL_PROCEDURE = 'Civil Procedure',
  PROFESSIONAL_RESPONSIBILITY = 'Professional Responsibility',
  COMMUNITY_PROPERTY = 'Community Property',
  WILLS_TRUSTS = 'Wills & Trusts',
  BUSINESS_ASSOCIATIONS = 'Business Associations',
  REMEDIES = 'Remedies'
}

export interface Question {
  id: string;
  subject: Subject;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  factPattern?: string;
}

export interface MBELogEntry {
  id: string;
  date: string;
  subject: Subject;
  questionsCompleted: number;
  correctCount: number;
  timeSpent: number; // minutes
  topics?: string;
}

export interface MBEQuestionAnalysis {
  id: string;
  subject: Subject;
  questionText: string; // Extracted via OCR or pasted
  imageUrl?: string; // Base64
  patternIdentified: string;
  distractorType: string;
  aiAnalysis: string;
  userNotes: string;
  dateAdded: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  type: 'MBE' | 'Essay' | 'Review' | 'Other';
  subject: Subject;
  completed: boolean;
}

export interface KnowledgeDocument {
  id: string;
  title: string; // e.g., "July 2018 Question 2"
  subject: Subject;
  content: string; // The full text of the Model Answer
  year?: string;
  isSelected: boolean;
}

export interface RuleMatch {
  term: string;
  ruleStatement: string;
  sourceDocId: string;
  sourceDocTitle: string;
  confidence: number;
}

export interface EssayPattern {
  name: string;
  frequency: number;
  description: string;
  relatedEssays: string[]; // IDs of essays where this appears
}

export interface SubtopicAnalysis {
  subtopic: string;
  count: number;
  total: number;
  percentage: number;
  relatedDocs: string[];
}

export interface FrequencyStat {
  subject: Subject;
  count: number;
  percentage: number;
  lastAppeared?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface EssayAnalysisResult {
  score: number;
  feedbackSummary: string;
  missedIssues: string[];
  strengths: string[];
  weaknesses: string[];
  caDistinctionsNote: string;
}
