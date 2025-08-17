export interface Company {
  id: string;
  name: string;
  industry: string;
  size: 'large' | 'medium' | 'small';
  location: string;
  establishedYear: number;
  employees: number;
  acceptanceRate: number; // 内定率 (0-100)
  applicationCount: number; // 応募者数
  acceptedCount: number; // 内定者数
  averageSalary?: number;
  workLifeBalance: number; // 1-5点
  description: string;
  benefits: string[];
  requirements: string[];
  selectionProcess: string[];
  website?: string;
  logoUrl?: string;
  tags: string[];
}

export const companies: Company[] = [
  {
    id: 'google-japan',
    name: 'Google Japan',
    industry: 'IT・インターネット',
    size: 'large',
    location: '東京都港区',
    establishedYear: 2001,
    employees: 2000,
    acceptanceRate: 2.5,
    applicationCount: 10000,
    acceptedCount: 250,
    averageSalary: 12000000,
    workLifeBalance: 4.5,
    description: '世界最大の検索エンジン会社の日本法人。革新的な技術開発と働きやすい環境で知られています。',
    benefits: ['フレックスタイム制', 'リモートワーク可', '社食無料', '健康保険完備', '研修制度充実'],
    requirements: ['コンピューターサイエンス系学位', 'プログラミングスキル', '英語力（TOEIC800以上）'],
    selectionProcess: ['書類選考', 'コーディングテスト', '技術面接（3回）', '最終面接'],
    website: 'https://careers.google.com/jobs/results/?location=Japan',
    tags: ['外資系', 'IT', 'AI', 'クラウド', '高給与']
  },
  {
    id: 'softbank',
    name: 'ソフトバンク株式会社',
    industry: '通信・インフラ',
    size: 'large',
    location: '東京都港区',
    establishedYear: 1986,
    employees: 18000,
    acceptanceRate: 15.2,
    applicationCount: 8500,
    acceptedCount: 1292,
    averageSalary: 8500000,
    workLifeBalance: 3.8,
    description: '日本を代表する通信会社。5GやAI技術の最前線で事業を展開しています。',
    benefits: ['社宅・寮完備', '財形貯蓄', '社員持株会', '各種手当充実'],
    requirements: ['四年制大学卒業', 'チャレンジ精神', 'コミュニケーション能力'],
    selectionProcess: ['エントリーシート', 'Webテスト', 'グループディスカッション', '個人面接（2回）'],
    tags: ['通信', '5G', 'AI', '大手企業', '安定']
  },
  {
    id: 'rakuten',
    name: '楽天グループ株式会社',
    industry: 'IT・インターネット',
    size: 'large',
    location: '東京都世田谷区',
    establishedYear: 1997,
    employees: 23000,
    acceptanceRate: 12.8,
    applicationCount: 7200,
    acceptedCount: 922,
    averageSalary: 7800000,
    workLifeBalance: 3.9,
    description: 'eコマースを中心とした総合インターネットサービス企業。多様なサービスを展開。',
    benefits: ['英語公用語', 'カフェテリア', '社内イベント豊富', 'キャリア開発支援'],
    requirements: ['英語力（TOEIC800点以上推奨）', '主体性', 'グローバル志向'],
    selectionProcess: ['書類選考', 'Webテスト', '面接（3回）', '役員面接'],
    tags: ['IT', 'eコマース', '英語', 'グローバル', 'ベンチャー気質']
  },
  {
    id: 'toyota',
    name: 'トヨタ自動車株式会社',
    industry: '自動車・輸送機器',
    size: 'large',
    location: '愛知県豊田市',
    establishedYear: 1937,
    employees: 366000,
    acceptanceRate: 8.5,
    applicationCount: 15000,
    acceptedCount: 1275,
    averageSalary: 8500000,
    workLifeBalance: 4.1,
    description: '世界最大級の自動車メーカー。革新的な技術開発と品質管理で世界をリード。',
    benefits: ['社宅・寮完備', '退職金制度', '健康管理センター', 'スポーツ施設'],
    requirements: ['工学系学位優遇', 'ものづくりへの情熱', 'チームワーク'],
    selectionProcess: ['エントリーシート', 'SPI', 'グループワーク', '個人面接（2回）'],
    tags: ['自動車', '製造業', '技術開発', '安定', '大手企業']
  },
  {
    id: 'mercari',
    name: '株式会社メルカリ',
    industry: 'IT・インターネット',
    size: 'medium',
    location: '東京都港区',
    establishedYear: 2013,
    employees: 2100,
    acceptanceRate: 25.4,
    applicationCount: 2800,
    acceptedCount: 711,
    averageSalary: 9200000,
    workLifeBalance: 4.3,
    description: 'フリマアプリ「メルカリ」を運営するスタートアップ企業。急成長を続けています。',
    benefits: ['ストックオプション', 'MacBook支給', '書籍購入補助', 'ランチ補助'],
    requirements: ['エンジニアリング経験', 'スピード感', '変化対応力'],
    selectionProcess: ['書類選考', 'コーディングテスト', '面接（2-3回）'],
    tags: ['スタートアップ', 'フリマ', 'アプリ', '急成長', '高給与']
  },
  {
    id: 'nintendo',
    name: '任天堂株式会社',
    industry: 'ゲーム・エンターテイメント',
    size: 'large',
    location: '京都府京都市',
    establishedYear: 1889,
    employees: 6574,
    acceptanceRate: 3.2,
    applicationCount: 12500,
    acceptedCount: 400,
    averageSalary: 9350000,
    workLifeBalance: 4.2,
    description: '世界的なゲーム会社。創造性と技術力で多くの人に楽しさを提供し続けています。',
    benefits: ['クリエイティブ環境', '社員食堂', '保養所', '各種クラブ活動'],
    requirements: ['ゲームへの情熱', '創造性', '技術力またはデザイン力'],
    selectionProcess: ['書類選考', 'ポートフォリオ審査', '筆記試験', '面接（2回）'],
    tags: ['ゲーム', 'エンターテイメント', 'クリエイティブ', '老舗', '人気企業']
  },
  {
    id: 'cyberagent',
    name: '株式会社サイバーエージェント',
    industry: 'IT・インターネット',
    size: 'large',
    location: '東京都渋谷区',
    establishedYear: 1998,
    employees: 5282,
    acceptanceRate: 18.7,
    applicationCount: 4500,
    acceptedCount: 842,
    averageSalary: 7170000,
    workLifeBalance: 3.7,
    description: 'インターネット広告事業を中心に、ゲームやメディア事業も展開する成長企業。',
    benefits: ['若手登用', 'スキルアップ支援', '社内イベント豊富', 'カジュアル環境'],
    requirements: ['向上心', 'チャレンジ精神', 'コミュニケーション能力'],
    selectionProcess: ['エントリーシート', 'Webテスト', '面接（3-4回）'],
    tags: ['IT', '広告', 'ゲーム', '若手活躍', 'ベンチャー']
  },
  {
    id: 'jal',
    name: '日本航空株式会社（JAL）',
    industry: '運輸・物流',
    size: 'large',
    location: '東京都品川区',
    establishedYear: 1951,
    employees: 13069,
    acceptanceRate: 11.3,
    applicationCount: 6800,
    acceptedCount: 768,
    averageSalary: 8260000,
    workLifeBalance: 4.0,
    description: '日本を代表する航空会社。国内外のネットワークで人々の移動をサポート。',
    benefits: ['航空券割引', '海外研修', '健康管理充実', '退職金制度'],
    requirements: ['語学力', 'ホスピタリティ', '体力・健康'],
    selectionProcess: ['エントリーシート', 'Webテスト', 'グループディスカッション', '面接（2回）'],
    tags: ['航空', '運輸', 'グローバル', 'サービス業', '安定']
  }
];

export const getCompanyById = (id: string): Company | undefined => {
  return companies.find(company => company.id === id);
};

export const searchCompanies = (query: string): Company[] => {
  if (!query) return companies;
  
  const searchTerm = query.toLowerCase();
  return companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm) ||
    company.industry.toLowerCase().includes(searchTerm) ||
    company.location.toLowerCase().includes(searchTerm) ||
    company.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

export const getCompaniesByIndustry = (industry: string): Company[] => {
  return companies.filter(company => company.industry === industry);
};

export const getCompaniesBySize = (size: string): Company[] => {
  return companies.filter(company => company.size === size);
};

export const getTopAcceptanceRateCompanies = (limit: number = 10): Company[] => {
  return [...companies]
    .sort((a, b) => b.acceptanceRate - a.acceptanceRate)
    .slice(0, limit);
};

export const getTopSalaryCompanies = (limit: number = 10): Company[] => {
  return [...companies]
    .filter(company => company.averageSalary)
    .sort((a, b) => (b.averageSalary || 0) - (a.averageSalary || 0))
    .slice(0, limit);
};

export const industries = [
  'IT・インターネット',
  '通信・インフラ',
  '自動車・輸送機器',
  'ゲーム・エンターテイメント',
  '運輸・物流',
  '金融・保険',
  '商社・流通',
  '製造業',
  'コンサルティング',
  '広告・マーケティング'
];

export const companySizes = [
  { value: 'large', label: '大企業（1000人以上）' },
  { value: 'medium', label: '中企業（300-1000人）' },
  { value: 'small', label: '小企業（300人未満）' }
];