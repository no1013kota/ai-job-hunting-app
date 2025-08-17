// AI適性診断機能のデータと評価ロジック

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'scale' | 'single' | 'multiple';
  category: 'action' | 'thinking' | 'interest' | 'personality';
  options?: string[];
  scaleRange?: { min: number; max: number; minLabel: string; maxLabel: string };
}

export interface AssessmentResponse {
  questionId: string;
  answer: string | number | string[];
}

export interface AssessmentResult {
  id: string;
  userId: string;
  completedAt: string;
  responses: AssessmentResponse[];
  scores: {
    action: number;      // 行動力 (0-100)
    thinking: number;    // 思考力 (0-100)
    people: number;      // 人への興味 (0-100)
    things: number;      // モノへの興味 (0-100)
    systems: number;     // 仕組みへの興味 (0-100)
    proactive: number;   // 能動性 (0-100)
    reactive: number;    // 受動性 (0-100)
  };
  careerSuggestions: CareerSuggestion[];
  summary: string;
}

export interface CareerSuggestion {
  jobType: string;
  industry: string;
  matchScore: number;
  description: string;
  requiredSkills: string[];
  growthPotential: number;
  salaryRange: { min: number; max: number };
}

// 診断質問データ
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // 行動力関連
  {
    id: 'action_1',
    text: '新しいプロジェクトや課題に取り組む時、あなたはどのように行動しますか？',
    type: 'scale',
    category: 'action',
    scaleRange: { 
      min: 1, max: 7, 
      minLabel: '慎重に計画を立ててから行動する', 
      maxLabel: 'まず行動してから調整する' 
    }
  },
  {
    id: 'action_2', 
    text: 'チームでの役割として最も自然に感じるのは？',
    type: 'single',
    category: 'action',
    options: [
      'リーダーとして方向性を示す',
      'アイデアを提案する',
      '実行・推進する',
      'サポート・調整する',
      '分析・改善提案する'
    ]
  },
  {
    id: 'action_3',
    text: '困難な状況に直面した時の対処法は？',
    type: 'scale',
    category: 'action',
    scaleRange: { 
      min: 1, max: 7, 
      minLabel: '一人で解決策を考える', 
      maxLabel: 'チームで相談しながら解決する' 
    }
  },

  // 思考力関連
  {
    id: 'thinking_1',
    text: '複雑な問題を解決する時、あなたのアプローチは？',
    type: 'single',
    category: 'thinking',
    options: [
      '全体像を把握してから詳細を検討',
      '具体例から一般化していく',
      '既存の事例と比較検討する',
      '数値・データで分析する',
      '直感を重視して判断する'
    ]
  },
  {
    id: 'thinking_2',
    text: '学習や仕事で最も集中できるのは？',
    type: 'scale',
    category: 'thinking',
    scaleRange: { 
      min: 1, max: 7, 
      minLabel: '理論・概念の理解', 
      maxLabel: '実践・実務での応用' 
    }
  },
  {
    id: 'thinking_3',
    text: '意思決定をする際に最も重視するのは？',
    type: 'multiple',
    category: 'thinking',
    options: [
      '論理的な根拠',
      '過去の経験・実績',
      '将来への影響',
      '関係者への配慮',
      '直感・第六感',
      'リスクの最小化'
    ]
  },

  // 興味・関心（人）
  {
    id: 'people_1',
    text: '人と関わる活動の中で最もやりがいを感じるのは？',
    type: 'single',
    category: 'interest',
    options: [
      '人の成長をサポートする',
      'チームをまとめる',
      '新しい人との出会い',
      '人の悩みを聞く・解決する',
      '人に何かを教える・伝える'
    ]
  },
  {
    id: 'people_2',
    text: 'コミュニケーションで得意なのは？',
    type: 'scale',
    category: 'interest',
    scaleRange: { 
      min: 1, max: 7, 
      minLabel: '1対1の深い対話', 
      maxLabel: '多人数での発表・司会' 
    }
  },

  // 興味・関心（モノ）  
  {
    id: 'things_1',
    text: 'モノづくりや技術に関する活動で興味があるのは？',
    type: 'multiple',
    category: 'interest',
    options: [
      'プログラミング・アプリ開発',
      'デザイン・クリエイティブ',
      '機械・ハードウェア',
      '建築・インフラ',
      '研究・実験',
      'データ分析・統計'
    ]
  },
  {
    id: 'things_2',
    text: '技術的な課題に取り組む時の姿勢は？',
    type: 'scale',
    category: 'interest',
    scaleRange: { 
      min: 1, max: 7, 
      minLabel: '既存技術の改良・最適化', 
      maxLabel: '新技術の創造・開発' 
    }
  },

  // 興味・関心（仕組み）
  {
    id: 'systems_1',
    text: '組織や仕組みに関わる活動で興味があるのは？',
    type: 'single',
    category: 'interest',
    options: [
      '業務プロセスの改善',
      '組織運営・マネジメント',
      '企画・戦略立案',
      'ルール・制度設計',
      'データ分析・意思決定支援'
    ]
  },
  {
    id: 'systems_2',
    text: '問題のある仕組みを見つけた時の行動は？',
    type: 'scale',
    category: 'interest',
    scaleRange: { 
      min: 1, max: 7, 
      minLabel: '個別に対処する', 
      maxLabel: '根本的な仕組みを変える' 
    }
  },

  // 能動性・受動性
  {
    id: 'proactivity_1',
    text: '新しい環境や変化に対するあなたの反応は？',
    type: 'scale',
    category: 'personality',
    scaleRange: { 
      min: 1, max: 7, 
      minLabel: '慎重に様子を見る', 
      maxLabel: '積極的に新しいことに挑戦する' 
    }
  },
  {
    id: 'proactivity_2',
    text: '仕事や学習での理想的なスタイルは？',
    type: 'single',
    category: 'personality',
    options: [
      '明確な指示に従って確実に実行',
      '大枠の目標に向けて自由に取り組む',
      'チームで協力しながら進める',
      '専門性を活かして独立して作業',
      '状況に応じて柔軟に対応'
    ]
  }
];

// スコア計算ロジック
export const calculateAssessmentScores = (responses: AssessmentResponse[]): AssessmentResult['scores'] => {
  const scoreMap: { [key: string]: number[] } = {
    action: [],
    thinking: [],
    people: [],
    things: [],
    systems: [],
    proactive: [],
    reactive: []
  };

  responses.forEach(response => {
    const question = ASSESSMENT_QUESTIONS.find(q => q.id === response.questionId);
    if (!question) return;

    // 質問IDに基づいてスコアを計算
    if (question.id.includes('action')) {
      const score = typeof response.answer === 'number' ? response.answer : 4;
      scoreMap.action.push(score * 14.3); // 7段階スケールを100点満点に換算
    }
    
    if (question.id.includes('thinking')) {
      const score = typeof response.answer === 'number' ? response.answer : 4;
      scoreMap.thinking.push(score * 14.3);
    }
    
    if (question.id.includes('people')) {
      const score = typeof response.answer === 'number' ? response.answer : 4;
      scoreMap.people.push(score * 14.3);
    }
    
    if (question.id.includes('things')) {
      const score = typeof response.answer === 'number' ? response.answer : 4;
      scoreMap.things.push(score * 14.3);
    }
    
    if (question.id.includes('systems')) {
      const score = typeof response.answer === 'number' ? response.answer : 4;
      scoreMap.systems.push(score * 14.3);
    }
    
    if (question.id.includes('proactivity')) {
      const score = typeof response.answer === 'number' ? response.answer : 4;
      scoreMap.proactive.push(score * 14.3);
      scoreMap.reactive.push((8 - score) * 14.3); // 逆スコア
    }
  });

  // 平均値を計算
  const calculateAverage = (scores: number[]): number => {
    if (scores.length === 0) return 50; // デフォルト値
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / scores.length);
  };

  return {
    action: calculateAverage(scoreMap.action),
    thinking: calculateAverage(scoreMap.thinking),
    people: calculateAverage(scoreMap.people),
    things: calculateAverage(scoreMap.things),
    systems: calculateAverage(scoreMap.systems),
    proactive: calculateAverage(scoreMap.proactive),
    reactive: calculateAverage(scoreMap.reactive)
  };
};

// キャリア提案生成
export const generateCareerSuggestions = (scores: AssessmentResult['scores']): CareerSuggestion[] => {
  const suggestions: CareerSuggestion[] = [];

  // 高得点の組み合わせに基づいて職種を推薦
  if (scores.thinking >= 70 && scores.things >= 70) {
    suggestions.push({
      jobType: 'エンジニア・開発職',
      industry: 'IT・テクノロジー',
      matchScore: Math.round((scores.thinking + scores.things) / 2),
      description: '論理的思考力と技術への興味を活かせる職種です。',
      requiredSkills: ['プログラミング', '論理的思考', '問題解決'],
      growthPotential: 95,
      salaryRange: { min: 400, max: 1200 }
    });
  }

  if (scores.people >= 70 && scores.action >= 70) {
    suggestions.push({
      jobType: '営業・マーケティング',
      industry: '各種業界',
      matchScore: Math.round((scores.people + scores.action) / 2),
      description: 'コミュニケーション能力と行動力を活かせる職種です。',
      requiredSkills: ['コミュニケーション', '行動力', '提案力'],
      growthPotential: 85,
      salaryRange: { min: 350, max: 1000 }
    });
  }

  if (scores.systems >= 70 && scores.thinking >= 70) {
    suggestions.push({
      jobType: 'コンサルタント・企画職',
      industry: 'コンサルティング・事業会社',
      matchScore: Math.round((scores.systems + scores.thinking) / 2),
      description: '組織や仕組みを最適化する思考力を活かせる職種です。',
      requiredSkills: ['戦略思考', '分析力', '提案力'],
      growthPotential: 90,
      salaryRange: { min: 450, max: 1500 }
    });
  }

  if (scores.people >= 70 && scores.reactive >= 60) {
    suggestions.push({
      jobType: '人事・教育・サポート',
      industry: '各種業界',
      matchScore: Math.round((scores.people + (100 - scores.reactive)) / 2),
      description: '人をサポートし、成長を支援することに適性があります。',
      requiredSkills: ['傾聴力', '支援力', 'チームワーク'],
      growthPotential: 80,
      salaryRange: { min: 320, max: 800 }
    });
  }

  if (scores.things >= 60 && scores.people >= 60) {
    suggestions.push({
      jobType: 'デザイナー・クリエイター',
      industry: 'クリエイティブ・メディア',
      matchScore: Math.round((scores.things + scores.people) / 2),
      description: 'クリエイティブな表現で人に価値を提供する職種です。',
      requiredSkills: ['デザインスキル', 'クリエイティビティ', 'ユーザー理解'],
      growthPotential: 75,
      salaryRange: { min: 300, max: 900 }
    });
  }

  // 最低3つの提案を保証
  if (suggestions.length < 3) {
    suggestions.push({
      jobType: '総合職・一般事務',
      industry: '各種業界',
      matchScore: 65,
      description: '様々な業務に対応できる汎用性の高い職種です。',
      requiredSkills: ['基礎業務スキル', '適応力', 'コミュニケーション'],
      growthPotential: 70,
      salaryRange: { min: 280, max: 600 }
    });
  }

  return suggestions.sort((a, b) => b.matchScore - a.matchScore);
};

// 診断結果サマリー生成
export const generateAssessmentSummary = (scores: AssessmentResult['scores']): string => {
  const topStrengths: string[] = [];
  
  if (scores.action >= 70) topStrengths.push('高い行動力');
  if (scores.thinking >= 70) topStrengths.push('優れた思考力');
  if (scores.people >= 70) topStrengths.push('人との関わりを重視');
  if (scores.things >= 70) topStrengths.push('技術・モノづくりへの興味');
  if (scores.systems >= 70) topStrengths.push('仕組み・組織への関心');
  if (scores.proactive >= 70) topStrengths.push('積極的な姿勢');

  if (topStrengths.length === 0) {
    return 'バランス型の適性を持っており、様々な分野で活躍できる可能性があります。';
  }

  return `あなたの主な強みは「${topStrengths.join('」「')}」です。これらの特性を活かせる職種での活躍が期待できます。`;
};