// 内定力スコア計算・統合機能

import type { AssessmentResult } from './assessment';
import type { InterviewRecord } from './storage';
import type { UserProfile } from './profile';

export interface ScoreBreakdown {
  interviewScore: number;        // 面接スコア (0-100)
  assessmentScore: number;       // 適性診断スコア (0-100) 
  profileScore: number;          // プロフィール充実度スコア (0-100)
  activityScore: number;         // 活動量スコア (0-100)
  consistencyScore: number;      // 継続性スコア (0-100)
  improvementScore: number;      // 改善度スコア (0-100)
}

export interface NaiteiRikiScore {
  overall: number;               // 総合内定力スコア (0-100)
  breakdown: ScoreBreakdown;
  level: 'beginner' | 'developing' | 'competent' | 'proficient' | 'expert';
  levelDescription: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidenceInterval: {
    min: number;
    max: number;
  };
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  weeklyChange: number;
}

export interface ScoreHistory {
  date: string;
  score: number;
  breakdown: ScoreBreakdown;
}

// スコアレベルの定義
const SCORE_LEVELS = {
  expert: { min: 90, label: 'エキスパート', description: '企業から強く求められるレベル。複数内定が期待できます。' },
  proficient: { min: 80, label: '上級者', description: '多くの企業で高い評価を得られるレベルです。' },
  competent: { min: 70, label: '中級者', description: '基本的なスキルが身についており、内定獲得の可能性があります。' },
  developing: { min: 50, label: '成長中', description: '改善の余地がありますが、着実に成長しています。' },
  beginner: { min: 0, label: '初心者', description: 'まずは基礎スキルの習得から始めましょう。' }
} as const;

// 重み付け設定
const SCORE_WEIGHTS = {
  interview: 0.35,      // 面接スコア 35%
  assessment: 0.25,     // 適性診断 25%
  profile: 0.15,        // プロフィール充実度 15%
  activity: 0.10,       // 活動量 10%
  consistency: 0.10,    // 継続性 10%
  improvement: 0.05     // 改善度 5%
};

// 面接スコア計算
export const calculateInterviewScore = (interviews: InterviewRecord[]): number => {
  if (interviews.length === 0) return 0;

  const completedInterviews = interviews.filter(i => i.analysisResult);
  if (completedInterviews.length === 0) return 0;

  // 最新5回の平均スコアを基本とする
  const recentInterviews = completedInterviews
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const averageScore = recentInterviews.reduce((acc, interview) => 
    acc + interview.analysisResult!.overallScore, 0) / recentInterviews.length;

  // 面接回数によるボーナス（最大+10点）
  const experienceBonus = Math.min(interviews.length * 2, 10);

  return Math.min(averageScore + experienceBonus, 100);
};

// 適性診断スコア計算
export const calculateAssessmentScore = (assessment: AssessmentResult | null): number => {
  if (!assessment) return 0;

  const scores = Object.values(assessment.scores);
  const averageScore = scores.reduce((acc, score) => acc + score, 0) / scores.length;

  // キャリア提案の適合度も考慮
  const bestMatchScore = assessment.careerSuggestions[0]?.matchScore || 0;
  const matchBonus = (bestMatchScore - 50) * 0.3; // 50%を基準として±15点の範囲で調整

  return Math.max(0, Math.min(averageScore + matchBonus, 100));
};

// プロフィール充実度スコア計算
export const calculateProfileScore = (profile: UserProfile | null): number => {
  if (!profile) return 0;

  let score = 0;
  let maxScore = 0;

  // 基本情報 (30点)
  maxScore += 30;
  if (profile.name && profile.email && profile.university && profile.faculty) score += 30;
  
  // 就活情報 (25点)
  maxScore += 25;
  if (profile.targetIndustries?.length && profile.targetPositions?.length) score += 25;
  
  // 自己PR・ガクチカ (25点)
  maxScore += 25;
  if (profile.selfPR && profile.studentActivities) score += 25;
  
  // 追加情報 (20点)
  maxScore += 20;
  if (profile.workExperience?.length) score += 5;
  if (profile.skills?.length) score += 5;
  if (profile.qualifications?.length) score += 5;
  if (profile.portfolioUrl || profile.githubUrl) score += 5;

  return Math.round((score / maxScore) * 100);
};

// 活動量スコア計算
export const calculateActivityScore = (interviews: InterviewRecord[], daysActive: number): number => {
  const totalInterviews = interviews.length;
  const recentInterviews = interviews.filter(i => {
    const daysSince = (Date.now() - new Date(i.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 30; // 過去30日間
  }).length;

  // 基本活動スコア
  let activityScore = 0;
  if (totalInterviews >= 10) activityScore += 40;
  else if (totalInterviews >= 5) activityScore += 30;
  else if (totalInterviews >= 1) activityScore += 20;

  // 継続的な活動ボーナス
  if (recentInterviews >= 5) activityScore += 30;
  else if (recentInterviews >= 3) activityScore += 20;
  else if (recentInterviews >= 1) activityScore += 10;

  // アクティブ日数ボーナス
  if (daysActive >= 21) activityScore += 30;
  else if (daysActive >= 14) activityScore += 20;
  else if (daysActive >= 7) activityScore += 10;

  return Math.min(activityScore, 100);
};

// 継続性スコア計算
export const calculateConsistencyScore = (interviews: InterviewRecord[]): number => {
  if (interviews.length < 2) return 0;

  const sortedInterviews = interviews.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  // 練習間隔の分析
  const intervals: number[] = [];
  for (let i = 1; i < sortedInterviews.length; i++) {
    const daysBetween = (new Date(sortedInterviews[i].timestamp).getTime() - 
                         new Date(sortedInterviews[i-1].timestamp).getTime()) / (1000 * 60 * 60 * 24);
    intervals.push(daysBetween);
  }

  // 一貫性の計算（理想的な間隔は2-7日）
  const idealInterval = 4;
  const consistencyScores = intervals.map(interval => {
    const deviation = Math.abs(interval - idealInterval);
    return Math.max(0, 100 - (deviation * 10));
  });

  const averageConsistency = consistencyScores.reduce((acc, score) => acc + score, 0) / consistencyScores.length;
  
  // 最近の活動頻度ボーナス
  const recentActivity = intervals.slice(-3); // 最近3回の間隔
  const recentBonus = recentActivity.every(interval => interval <= 7) ? 20 : 0;

  return Math.min(averageConsistency + recentBonus, 100);
};

// 改善度スコア計算
export const calculateImprovementScore = (interviews: InterviewRecord[]): number => {
  const completedInterviews = interviews
    .filter(i => i.analysisResult)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (completedInterviews.length < 3) return 50; // デフォルト値

  // 最初の3回と最後の3回を比較
  const early = completedInterviews.slice(0, 3);
  const recent = completedInterviews.slice(-3);

  const earlyAverage = early.reduce((acc, i) => acc + i.analysisResult!.overallScore, 0) / early.length;
  const recentAverage = recent.reduce((acc, i) => acc + i.analysisResult!.overallScore, 0) / recent.length;

  const improvement = recentAverage - earlyAverage;
  
  // 改善度を0-100のスケールに変換
  const improvementScore = 50 + (improvement * 2); // ±25点の改善で±50点のスコア
  
  return Math.max(0, Math.min(improvementScore, 100));
};

// メイン計算関数
export const calculateNaiteiRikiScore = (
  interviews: InterviewRecord[],
  assessment: AssessmentResult | null,
  profile: UserProfile | null,
  previousScores: ScoreHistory[] = []
): NaiteiRikiScore => {
  
  // 各要素のスコア計算
  const breakdown: ScoreBreakdown = {
    interviewScore: calculateInterviewScore(interviews),
    assessmentScore: calculateAssessmentScore(assessment),
    profileScore: calculateProfileScore(profile),
    activityScore: calculateActivityScore(interviews, 30), // 仮で30日をセット
    consistencyScore: calculateConsistencyScore(interviews),
    improvementScore: calculateImprovementScore(interviews)
  };

  // 重み付け総合スコア計算
  const overall = Math.round(
    breakdown.interviewScore * SCORE_WEIGHTS.interview +
    breakdown.assessmentScore * SCORE_WEIGHTS.assessment +
    breakdown.profileScore * SCORE_WEIGHTS.profile +
    breakdown.activityScore * SCORE_WEIGHTS.activity +
    breakdown.consistencyScore * SCORE_WEIGHTS.consistency +
    breakdown.improvementScore * SCORE_WEIGHTS.improvement
  );

  // スコアレベル判定
  let level: NaiteiRikiScore['level'] = 'beginner';
  let levelDescription = '';
  
  for (const [levelKey, config] of Object.entries(SCORE_LEVELS)) {
    if (overall >= config.min) {
      level = levelKey as NaiteiRikiScore['level'];
      levelDescription = config.description;
      break;
    }
  }

  // 強み・弱みの分析
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  if (breakdown.interviewScore >= 80) strengths.push('面接スキルが高い');
  else if (breakdown.interviewScore <= 50) weaknesses.push('面接練習が不足');
  
  if (breakdown.assessmentScore >= 80) strengths.push('適性が明確');
  else if (breakdown.assessmentScore <= 50) weaknesses.push('自己分析が不足');
  
  if (breakdown.profileScore >= 80) strengths.push('プロフィールが充実');
  else if (breakdown.profileScore <= 50) weaknesses.push('プロフィール情報が不足');
  
  if (breakdown.consistencyScore >= 80) strengths.push('継続的に取り組んでいる');
  else if (breakdown.consistencyScore <= 50) weaknesses.push('継続性に課題');

  // 推奨アクション
  const recommendations: string[] = [];
  if (breakdown.interviewScore < 70) recommendations.push('面接練習を増やしましょう');
  if (breakdown.assessmentScore === 0) recommendations.push('適性診断を受けましょう');
  if (breakdown.profileScore < 70) recommendations.push('プロフィールを充実させましょう');
  if (breakdown.activityScore < 50) recommendations.push('より頻繁に練習しましょう');

  // 信頼区間の計算（±5-15点）
  const confidenceRange = Math.max(5, Math.min(15, (100 - overall) * 0.15));
  const confidenceInterval = {
    min: Math.max(0, overall - confidenceRange),
    max: Math.min(100, overall + confidenceRange)
  };

  // トレンド計算
  let trend: NaiteiRikiScore['trend'] = 'stable';
  let weeklyChange = 0;
  
  if (previousScores.length > 0) {
    const lastWeekScore = previousScores[previousScores.length - 1]?.score || overall;
    weeklyChange = overall - lastWeekScore;
    
    if (weeklyChange >= 3) trend = 'up';
    else if (weeklyChange <= -3) trend = 'down';
  }

  return {
    overall,
    breakdown,
    level,
    levelDescription,
    strengths,
    weaknesses,
    recommendations,
    confidenceInterval,
    lastUpdated: new Date().toISOString(),
    trend,
    weeklyChange
  };
};

// スコア履歴管理
export const updateScoreHistory = (
  currentScore: NaiteiRikiScore,
  previousHistory: ScoreHistory[] = []
): ScoreHistory[] => {
  const newEntry: ScoreHistory = {
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD形式
    score: currentScore.overall,
    breakdown: currentScore.breakdown
  };

  // 同じ日付の記録があれば更新、なければ追加
  const existingIndex = previousHistory.findIndex(h => h.date === newEntry.date);
  let updatedHistory: ScoreHistory[];
  
  if (existingIndex >= 0) {
    updatedHistory = [...previousHistory];
    updatedHistory[existingIndex] = newEntry;
  } else {
    updatedHistory = [...previousHistory, newEntry];
  }

  // 最大90日分のデータを保持
  return updatedHistory
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-90);
};

// スコア比較・分析
export const analyzeScoreProgress = (history: ScoreHistory[]): {
  progress: 'improving' | 'declining' | 'stable';
  avgWeeklyChange: number;
  bestScore: number;
  worstScore: number;
  recentTrend: 'up' | 'down' | 'stable';
} => {
  if (history.length === 0) {
    return {
      progress: 'stable',
      avgWeeklyChange: 0,
      bestScore: 0,
      worstScore: 0,
      recentTrend: 'stable'
    };
  }

  const scores = history.map(h => h.score);
  const bestScore = Math.max(...scores);
  const worstScore = Math.min(...scores);

  // 最近30日のトレンド
  const recent = history.slice(-30);
  if (recent.length < 2) {
    return {
      progress: 'stable',
      avgWeeklyChange: 0,
      bestScore,
      worstScore,
      recentTrend: 'stable'
    };
  }

  const recentChange = recent[recent.length - 1].score - recent[0].score;
  const recentTrend = recentChange > 2 ? 'up' : recentChange < -2 ? 'down' : 'stable';

  // 全体的な進捗
  const totalChange = scores[scores.length - 1] - scores[0];
  const progress = totalChange > 5 ? 'improving' : totalChange < -5 ? 'declining' : 'stable';

  // 週平均変化量
  const weeklyChanges: number[] = [];
  for (let i = 7; i < history.length; i += 7) {
    const weeklyChange = history[i].score - history[Math.max(0, i - 7)].score;
    weeklyChanges.push(weeklyChange);
  }
  const avgWeeklyChange = weeklyChanges.length > 0 ? 
    weeklyChanges.reduce((acc, change) => acc + change, 0) / weeklyChanges.length : 0;

  return {
    progress,
    avgWeeklyChange,
    bestScore,
    worstScore,
    recentTrend
  };
};