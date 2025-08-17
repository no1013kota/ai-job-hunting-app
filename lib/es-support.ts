// ES（エントリーシート）支援機能

export interface ESTemplate {
  id: string;
  title: string;
  category: 'self-pr' | 'motivation' | 'gakuchika' | 'career-plan' | 'challenge' | 'teamwork' | 'other';
  question: string;
  wordLimit: number;
  guidelines: string[];
  structure: {
    introduction: string;
    body: string;
    conclusion: string;
  };
  examples: {
    good: string;
    explanation: string;
  }[];
}

export interface ESContent {
  id: string;
  userId: string;
  templateId: string;
  title: string;
  question: string;
  content: string;
  wordCount: number;
  status: 'draft' | 'completed' | 'submitted';
  analysis?: ESAnalysis;
  history: {
    version: number;
    content: string;
    timestamp: string;
    analysis?: ESAnalysis;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ESAnalysis {
  overallScore: number;
  breakdown: {
    structure: { score: number; feedback: string };
    content: { score: number; feedback: string };
    logic: { score: number; feedback: string };
    originality: { score: number; feedback: string };
    readability: { score: number; feedback: string };
  };
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  keywordDensity: { word: string; count: number; percentage: number }[];
  sentenceAnalysis: {
    averageLength: number;
    varietyScore: number;
    complexityScore: number;
  };
  estimatedReadTime: number;
}

// ES質問テンプレート
export const ES_TEMPLATES: ESTemplate[] = [
  {
    id: 'self_pr_basic',
    title: '基本的な自己PR',
    category: 'self-pr',
    question: 'あなたの長所について、具体的なエピソードを交えて教えてください。',
    wordLimit: 400,
    guidelines: [
      '結論を最初に述べる',
      '具体的なエピソードを盛り込む',
      '数字で成果を表現する',
      '企業でどう活かせるかを述べる'
    ],
    structure: {
      introduction: '結論：私の長所は○○です。',
      body: '具体例：学生時代に○○に取り組み、○○という成果を上げました。',
      conclusion: '活用：この長所を御社の○○で活かしたいと考えています。'
    },
    examples: [
      {
        good: '私の長所は、困難な状況でも諦めずに解決策を見つける行動力です。大学のプロジェクトで、メンバー間の意見対立により作業が停滞した際、私が中心となって個別面談を実施し、全員の意見を整理・統合することで、期限内にプロジェクトを成功させました。その結果、最優秀賞を受賞し、チームの結束も深まりました。この行動力を御社の営業職で活かし、お客様の課題解決に貢献したいと考えています。',
        explanation: '結論→具体例→成果→活用という構成で、数字や具体的な行動が明記されている良い例です。'
      }
    ]
  },
  {
    id: 'motivation_basic',
    title: '志望動機',
    category: 'motivation',
    question: '当社を志望する理由を教えてください。',
    wordLimit: 400,
    guidelines: [
      '企業研究の成果を盛り込む',
      '自分の価値観との合致点を述べる',
      '具体的な職種・部門に言及する',
      '将来のビジョンを含める'
    ],
    structure: {
      introduction: '志望理由：御社を志望する理由は○○です。',
      body: '根拠：御社の○○という特徴が、私の○○という価値観と合致するためです。',
      conclusion: '展望：御社で○○として活躍し、○○を実現したいと考えています。'
    },
    examples: [
      {
        good: '私が御社を志望する理由は、「テクノロジーで社会課題を解決する」という企業理念に強く共感したからです。大学での研究を通じて、IT技術が持つ社会変革の可能性を実感し、私も技術を通じて人々の生活を豊かにしたいと考えるようになりました。特に御社の○○事業は、私が関心を持つ高齢化社会の課題解決に直結しており、エンジニアとして技術開発に携わりたいと強く思います。将来的には、自らがリーダーとなって新しいサービスを企画・開発し、より多くの人に価値を提供したいと考えています。',
        explanation: '企業理念への共感、自身の経験との関連、具体的な事業への言及、将来ビジョンが含まれた良い例です。'
      }
    ]
  },
  {
    id: 'gakuchika_basic',
    title: '学生時代に力を入れたこと',
    category: 'gakuchika',
    question: '学生時代に最も力を入れて取り組んだことについて教えてください。',
    wordLimit: 500,
    guidelines: [
      'STAR法（状況・課題・行動・結果）を使う',
      '困難や課題を具体的に述べる',
      '自分の役割と行動を明確にする',
      '定量的な成果を示す'
    ],
    structure: {
      introduction: '取組み：私が最も力を入れたのは○○です。',
      body: '状況・課題：○○という状況で、○○という課題がありました。行動：私は○○を行い、○○という結果を得ました。',
      conclusion: '学び：この経験から○○を学び、社会人になっても活かしたいと考えています。'
    },
    examples: [
      {
        good: '私が最も力を入れたのは、アルバイト先の飲食店での売上向上施策です。コロナ禍でお客様が激減し、月間売上が前年比40%減という深刻な状況でした。私は店長に提案し、SNSマーケティングとテイクアウトサービスの導入を担当しました。InstagramとTwitterで毎日の特別メニューを発信し、フォロワーを0から3000人まで増やすことで、テイクアウト利用者が月間200件に達しました。結果、3ヶ月で売上を前年比80%まで回復させることができました。この経験から、現状分析と改善提案の重要性を学び、御社でも積極的に課題発見・解決に取り組みたいと考えています。',
        explanation: 'STAR法に沿って具体的な数字を交えながら、行動と成果が明確に示されている優れた例です。'
      }
    ]
  },
  {
    id: 'career_plan_basic',
    title: 'キャリアプラン',
    category: 'career-plan',
    question: '入社後のキャリアプランについて教えてください。',
    wordLimit: 350,
    guidelines: [
      '短期・中期・長期に分けて述べる',
      '企業の事業内容と関連づける',
      '具体的な目標を設定する',
      '学習・成長への意欲を示す'
    ],
    structure: {
      introduction: '目標：私のキャリア目標は○○です。',
      body: '段階：短期（1-3年）で○○、中期（3-5年）で○○、長期（5-10年）で○○を目指します。',
      conclusion: '貢献：これらの経験を通じて、御社の○○に貢献したいと考えています。'
    },
    examples: []
  },
  {
    id: 'teamwork_basic',
    title: 'チームワーク経験',
    category: 'teamwork',
    question: 'チームで取り組んだ経験について、あなたの役割と貢献を教えてください。',
    wordLimit: 400,
    guidelines: [
      'チーム構成と目標を明確にする',
      '自分の具体的な役割を述べる',
      'チーム内での課題と解決策を示す',
      '協働の成果を定量化する'
    ],
    structure: {
      introduction: 'チーム：○人チームで○○に取り組みました。',
      body: '役割・課題：私は○○として、○○という課題解決に貢献しました。',
      conclusion: '成果：結果として○○を達成し、チームワークの重要性を実感しました。'
    },
    examples: []
  }
];

// ES分析機能
export const analyzeESContent = (content: string, template: ESTemplate): ESAnalysis => {
  const words = content.replace(/\s+/g, '').length;
  const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 0);
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  // 構成分析
  const structureScore = calculateStructureScore(content, paragraphs);
  
  // 内容分析
  const contentScore = calculateContentScore(content, template);
  
  // 論理性分析
  const logicScore = calculateLogicScore(content, sentences);
  
  // 独自性分析
  const originalityScore = calculateOriginalityScore(content);
  
  // 読みやすさ分析
  const readabilityScore = calculateReadabilityScore(sentences, paragraphs);

  // キーワード分析
  const keywordDensity = calculateKeywordDensity(content);

  // 文章分析
  const sentenceAnalysis = analyzeSentences(sentences);

  // 総合スコア計算
  const overallScore = Math.round(
    structureScore * 0.25 +
    contentScore * 0.30 +
    logicScore * 0.20 +
    originalityScore * 0.10 +
    readabilityScore * 0.15
  );

  // フィードバック生成
  const breakdown = {
    structure: { 
      score: structureScore, 
      feedback: generateStructureFeedback(structureScore, paragraphs.length) 
    },
    content: { 
      score: contentScore, 
      feedback: generateContentFeedback(contentScore, words, template.wordLimit) 
    },
    logic: { 
      score: logicScore, 
      feedback: generateLogicFeedback(logicScore) 
    },
    originality: { 
      score: originalityScore, 
      feedback: generateOriginalityFeedback(originalityScore) 
    },
    readability: { 
      score: readabilityScore, 
      feedback: generateReadabilityFeedback(readabilityScore, sentenceAnalysis) 
    }
  };

  const strengths = generateStrengths(breakdown);
  const improvements = generateImprovements(breakdown);
  const suggestions = generateSuggestions(content, template);

  return {
    overallScore,
    breakdown,
    strengths,
    improvements,
    suggestions,
    keywordDensity,
    sentenceAnalysis,
    estimatedReadTime: Math.ceil(words / 500) // 500文字/分で計算
  };
};

// スコア計算関数群
const calculateStructureScore = (content: string, paragraphs: string[]): number => {
  let score = 50;
  
  // 段落数チェック（3-5段落が理想）
  if (paragraphs.length >= 3 && paragraphs.length <= 5) score += 20;
  else if (paragraphs.length >= 2) score += 10;
  
  // 結論の有無
  if (content.includes('です。') || content.includes('ます。')) score += 15;
  
  // 具体例の有無
  if (content.includes('例えば') || content.includes('具体的に') || content.includes('実際に')) score += 15;
  
  return Math.min(score, 100);
};

const calculateContentScore = (content: string, template: ESTemplate): number => {
  let score = 40;
  const wordCount = content.replace(/\s+/g, '').length;
  const targetWords = template.wordLimit;
  
  // 文字数適正性（80-120%が理想）
  const ratio = wordCount / targetWords;
  if (ratio >= 0.8 && ratio <= 1.2) score += 25;
  else if (ratio >= 0.6 && ratio <= 1.4) score += 15;
  else if (ratio >= 0.4) score += 5;
  
  // テンプレートのガイドライン準拠
  template.guidelines.forEach(guideline => {
    if (checkGuidelineCompliance(content, guideline)) {
      score += 35 / template.guidelines.length;
    }
  });
  
  return Math.min(score, 100);
};

const calculateLogicScore = (content: string, sentences: string[]): number => {
  let score = 60;
  
  // 接続詞の使用
  const connectors = ['そして', 'また', 'しかし', 'そのため', 'その結果', 'つまり'];
  const connectorCount = connectors.filter(c => content.includes(c)).length;
  score += Math.min(connectorCount * 5, 20);
  
  // 文の長さの適正性
  const avgSentenceLength = sentences.reduce((acc, s) => acc + s.length, 0) / sentences.length;
  if (avgSentenceLength >= 20 && avgSentenceLength <= 60) score += 20;
  else if (avgSentenceLength >= 10) score += 10;
  
  return Math.min(score, 100);
};

const calculateOriginalityScore = (content: string): number => {
  let score = 70;
  
  // 一般的すぎるフレーズの減点
  const commonPhrases = ['頑張りたい', '成長したい', '貢献したい', 'やりがい', '魅力的'];
  commonPhrases.forEach(phrase => {
    if (content.includes(phrase)) score -= 5;
  });
  
  // 具体的な固有名詞や数字の加点
  if (/\d+/.test(content)) score += 15; // 数字の使用
  if (content.length > content.replace(/[A-Za-z]/g, '').length) score += 10; // 英語の使用
  
  return Math.max(Math.min(score, 100), 30);
};

const calculateReadabilityScore = (sentences: string[], paragraphs: string[]): number => {
  let score = 50;
  
  // 文の長さのばらつき
  const lengths = sentences.map(s => s.length);
  const variance = lengths.reduce((acc, len) => acc + Math.pow(len - (lengths.reduce((a, b) => a + b) / lengths.length), 2), 0) / lengths.length;
  if (variance > 100) score += 25; // 文の長さにバリエーションがある
  
  // 段落の長さの適正性
  const avgParagraphLength = paragraphs.reduce((acc, p) => acc + p.length, 0) / paragraphs.length;
  if (avgParagraphLength >= 50 && avgParagraphLength <= 200) score += 25;
  
  return Math.min(score, 100);
};

// キーワード密度計算
const calculateKeywordDensity = (content: string): { word: string; count: number; percentage: number }[] => {
  const words = content.replace(/[。、！？\s]/g, '').match(/.{1,2}/g) || [];
  const wordCount: { [key: string]: number } = {};
  
  words.forEach(word => {
    if (word.length >= 2) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  const totalWords = words.length;
  return Object.entries(wordCount)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      percentage: Math.round((count / totalWords) * 100 * 10) / 10
    }));
};

// 文章分析
const analyzeSentences = (sentences: string[]) => {
  const lengths = sentences.map(s => s.length);
  const averageLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  
  // 長さの標準偏差を計算してバリエーションスコアとする
  const variance = lengths.reduce((acc, len) => acc + Math.pow(len - averageLength, 2), 0) / lengths.length;
  const varietyScore = Math.min(Math.sqrt(variance), 100);
  
  // 複雑性スコア（長い文ほど複雑とみなす）
  const complexityScore = Math.min(averageLength * 2, 100);
  
  return {
    averageLength: Math.round(averageLength),
    varietyScore: Math.round(varietyScore),
    complexityScore: Math.round(complexityScore)
  };
};

// フィードバック生成関数群
const generateStructureFeedback = (score: number, paragraphCount: number): string => {
  if (score >= 80) return '文章の構成がよく整理されており、読みやすい構造になっています。';
  if (score >= 60) return '基本的な構成はできていますが、段落分けをもう少し工夫すると良いでしょう。';
  return '文章の構成を見直し、序論・本論・結論を明確に分けることをお勧めします。';
};

const generateContentFeedback = (score: number, wordCount: number, targetWords: number): string => {
  const ratio = wordCount / targetWords;
  if (score >= 80) return '内容が充実しており、文字数も適切です。';
  if (ratio < 0.8) return `文字数が不足しています（${wordCount}/${targetWords}文字）。もう少し詳しく記述しましょう。`;
  if (ratio > 1.2) return `文字数が多すぎます（${wordCount}/${targetWords}文字）。要点を絞って簡潔にまとめましょう。`;
  return '内容をもう少し具体的に記述すると良いでしょう。';
};

const generateLogicFeedback = (score: number): string => {
  if (score >= 80) return '論理的な構成で、話の流れが明確です。';
  if (score >= 60) return '基本的な論理性はありますが、接続詞を使ってより明確にしましょう。';
  return '論理の流れを整理し、因果関係を明確にすることをお勧めします。';
};

const generateOriginalityFeedback = (score: number): string => {
  if (score >= 80) return '独自性があり、印象に残る内容です。';
  if (score >= 60) return '基本的な内容はできていますが、より具体的なエピソードがあると良いでしょう。';
  return '一般的な表現が多いため、具体的な体験や数字を交えてオリジナリティを高めましょう。';
};

const generateReadabilityFeedback = (score: number, analysis: { averageLength: number }): string => {
  if (score >= 80) return '読みやすく、適切な文の長さです。';
  if (analysis.averageLength > 60) return '文が長すぎる傾向があります。短い文に分割することをお勧めします。';
  if (analysis.averageLength < 20) return '文が短すぎる傾向があります。もう少し詳しく記述しましょう。';
  return '文の長さにもう少しバリエーションを持たせると読みやすくなります。';
};

const generateStrengths = (breakdown: Record<string, { score: number; feedback: string }>): string[] => {
  const strengths: string[] = [];
  Object.entries(breakdown).forEach(([key, value]) => {
    if (value.score >= 80) {
      const labels: { [key: string]: string } = {
        structure: '文章構成が優秀',
        content: '内容が充実',
        logic: '論理性が高い',
        originality: '独自性がある',
        readability: '読みやすい文章'
      };
      strengths.push(labels[key] || key);
    }
  });
  return strengths;
};

const generateImprovements = (breakdown: Record<string, { score: number; feedback: string }>): string[] => {
  const improvements: string[] = [];
  Object.entries(breakdown).forEach(([key, value]) => {
    if (value.score < 60) {
      const labels: { [key: string]: string } = {
        structure: '文章構成の改善',
        content: '内容の充実化',
        logic: '論理性の向上',
        originality: '独自性の強化',
        readability: '読みやすさの改善'
      };
      improvements.push(labels[key] || key);
    }
  });
  return improvements;
};

const generateSuggestions = (content: string, template: ESTemplate): string[] => {
  const suggestions: string[] = [];
  
  if (!content.includes('具体的')) {
    suggestions.push('具体的なエピソードや事例を追加してください');
  }
  
  if (!/\d/.test(content)) {
    suggestions.push('数字を使って成果を定量化してください');
  }
  
  if (content.length < template.wordLimit * 0.8) {
    suggestions.push('指定文字数に近づくよう、内容を詳しく記述してください');
  }
  
  if (!content.includes('御社') && !content.includes('貴社')) {
    suggestions.push('企業への言及を含めて志望度をアピールしてください');
  }
  
  return suggestions;
};

// ガイドライン準拠チェック
const checkGuidelineCompliance = (content: string, guideline: string): boolean => {
  const checks: { [key: string]: () => boolean } = {
    '結論を最初に述べる': () => {
      const firstSentence = content.split(/[。！？]/)[0];
      return firstSentence.includes('は') || firstSentence.includes('です') || firstSentence.includes('ます');
    },
    '具体的なエピソードを盛り込む': () => {
      return content.includes('例えば') || content.includes('具体的') || content.includes('実際') || content.includes('経験');
    },
    '数字で成果を表現する': () => {
      return /\d+/.test(content);
    },
    '企業でどう活かせるかを述べる': () => {
      return content.includes('活かし') || content.includes('貢献') || content.includes('役立');
    }
  };
  
  return checks[guideline] ? checks[guideline]() : true;
};