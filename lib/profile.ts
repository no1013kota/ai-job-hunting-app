// プロフィール管理機能

export interface UserProfile {
  // 基本情報
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  
  // 学歴情報
  university: string;
  faculty: string;
  department: string;
  graduationYear: number;
  gpa?: number;
  
  // 基本プロフィール
  birthDate?: string;
  phone?: string;
  address?: string;
  
  // 就活情報
  jobHuntingStatus: 'preparing' | 'active' | 'completed';
  targetIndustries: string[];
  targetPositions: string[];
  desiredSalaryRange: {
    min: number;
    max: number;
  };
  availableStartDate?: string;
  
  // 経験・スキル
  workExperience: WorkExperience[];
  skills: Skill[];
  qualifications: Qualification[];
  languages: Language[];
  
  // 自己PR・ガクチカ
  selfPR: string;
  studentActivities: string; // ガクチカ
  
  // ポートフォリオ
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  
  // 設定
  isPublic: boolean;
  allowRecruiterContact: boolean;
  notificationSettings: NotificationSettings;
  
  // メタデータ
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrentPosition: boolean;
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'technical' | 'soft' | 'language' | 'other';
}

export interface Qualification {
  id: string;
  name: string;
  organization: string;
  obtainedDate: string;
  expirationDate?: string;
  certificateUrl?: string;
}

export interface Language {
  id: string;
  name: string;
  level: 'basic' | 'conversational' | 'business' | 'native';
  toeicScore?: number;
  toeflScore?: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  interviewReminders: boolean;
  applicationDeadlines: boolean;
  newOpportunities: boolean;
  weeklyReports: boolean;
}

// 業界・職種の選択肢
export const INDUSTRIES = [
  'IT・インターネット',
  'メーカー・製造業',
  '金融・保険',
  'コンサルティング',
  '商社・流通・小売',
  '不動産・建設',
  'メディア・広告・デザイン',
  '医療・福祉',
  '教育・人材',
  'サービス業',
  '公務員・非営利',
  'エネルギー・インフラ',
  'その他'
];

export const JOB_POSITIONS = [
  '営業・セールス',
  'マーケティング・企画',
  'エンジニア・開発',
  'デザイナー・クリエイター',
  'コンサルタント',
  '人事・総務・法務',
  '経理・財務',
  '研究・開発',
  '生産・製造',
  'サービス・接客',
  '教育・講師',
  '医療・介護',
  'その他'
];

export const JOB_HUNTING_STATUS_LABELS = {
  preparing: '準備中',
  active: '就活中',
  completed: '就活終了'
};

export const SKILL_LEVEL_LABELS = {
  beginner: '初級',
  intermediate: '中級', 
  advanced: '上級',
  expert: 'エキスパート'
};

export const LANGUAGE_LEVEL_LABELS = {
  basic: '基礎レベル',
  conversational: '日常会話レベル',
  business: 'ビジネスレベル',
  native: 'ネイティブレベル'
};

// プロフィール完成度計算
export const calculateProfileCompleteness = (profile: Partial<UserProfile>): number => {
  const requiredFields = [
    'name', 'email', 'university', 'faculty', 'graduationYear',
    'targetIndustries', 'selfPR', 'studentActivities'
  ];
  
  const optionalFields = [
    'department', 'gpa', 'phone', 'targetPositions', 
    'workExperience', 'skills', 'qualifications', 'portfolioUrl'
  ];
  
  let score = 0;
  let maxScore = 0;
  
  // 必須項目（各10点）
  requiredFields.forEach(field => {
    maxScore += 10;
    if (profile[field as keyof UserProfile]) {
      const value = profile[field as keyof UserProfile];
      if (Array.isArray(value) ? value.length > 0 : value) {
        score += 10;
      }
    }
  });
  
  // 任意項目（各5点）
  optionalFields.forEach(field => {
    maxScore += 5;
    if (profile[field as keyof UserProfile]) {
      const value = profile[field as keyof UserProfile];
      if (Array.isArray(value) ? value.length > 0 : value) {
        score += 5;
      }
    }
  });
  
  return Math.round((score / maxScore) * 100);
};

// プロフィールテンプレート
export const createDefaultProfile = (userId: string, name: string, email: string): UserProfile => {
  const now = new Date().toISOString();
  
  return {
    id: `profile_${Date.now()}`,
    userId,
    name,
    email,
    university: '',
    faculty: '',
    department: '',
    graduationYear: new Date().getFullYear() + 1,
    jobHuntingStatus: 'preparing',
    targetIndustries: [],
    targetPositions: [],
    desiredSalaryRange: { min: 300, max: 600 },
    workExperience: [],
    skills: [],
    qualifications: [],
    languages: [],
    selfPR: '',
    studentActivities: '',
    isPublic: false,
    allowRecruiterContact: false,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      interviewReminders: true,
      applicationDeadlines: true,
      newOpportunities: false,
      weeklyReports: false
    },
    createdAt: now,
    updatedAt: now
  };
};

// バリデーション
export const validateProfile = (profile: Partial<UserProfile>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!profile.name?.trim()) {
    errors.push('氏名は必須です');
  }
  
  if (!profile.email?.trim()) {
    errors.push('メールアドレスは必須です');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    errors.push('メールアドレスの形式が正しくありません');
  }
  
  if (!profile.university?.trim()) {
    errors.push('大学名は必須です');
  }
  
  if (!profile.faculty?.trim()) {
    errors.push('学部名は必須です');
  }
  
  if (!profile.graduationYear || profile.graduationYear < 2020 || profile.graduationYear > 2030) {
    errors.push('卒業年度を正しく入力してください');
  }
  
  if (profile.gpa && (profile.gpa < 0 || profile.gpa > 4.0)) {
    errors.push('GPAは0.0〜4.0の範囲で入力してください');
  }
  
  if (profile.phone && !/^[\d-+().\s]+$/.test(profile.phone)) {
    errors.push('電話番号の形式が正しくありません');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};