// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  university?: string;
  major?: string;
  graduationYear?: number;
  skills?: string[];
}

// Interview types
export interface InterviewQuestion {
  id: string;
  text: string;
  category: 'general' | 'behavioral' | 'technical';
  timeLimit: number; // seconds
}

export interface InterviewRecord {
  id: string;
  userId: string;
  questionId: string;
  videoBlob?: Blob;
  duration: number;
  recordedAt: string;
  scores?: InterviewScore;
}

export interface InterviewScore {
  overall: number; // 0-100
  breakdown: {
    content: number;
    structure: number;
    clarity: number;
    confidence: number;
  };
  feedback: string;
  improvements: string[];
}

// Assessment types
export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'single' | 'scale';
  options?: string[];
  category: 'action' | 'thinking' | 'interest';
}

export interface AssessmentResult {
  scores: {
    action: number;
    thinking: number;
    people: number;
    things: number;
    systems: number;
  };
  recommendedJobs: string[];
  summary: string;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  token: string;
}