'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { getStorage, isStorageSupported } from '@/lib/storage';
import { ES_TEMPLATES, type ESContent, type ESTemplate } from '@/lib/es-support';
import {
  PlusIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  SparklesIcon,
  RocketLaunchIcon,
  StarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

interface ESListItemProps {
  es: ESContent;
  template: ESTemplate;
  onSelect: (es: ESContent) => void;
}

const ESListItem: React.FC<ESListItemProps> = ({ es, template, onSelect }) => {
  const getStatusIcon = (status: ESContent['status']) => {
    switch (status) {
      case 'draft': return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
      case 'completed': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'submitted': return <PaperAirplaneIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusText = (status: ESContent['status']) => {
    switch (status) {
      case 'draft': return '下書き';
      case 'completed': return '完了';
      case 'submitted': return '提出済み';
    }
  };

  const getStatusColor = (status: ESContent['status']) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'completed': return 'text-green-700 bg-green-100';
      case 'submitted': return 'text-blue-700 bg-blue-100';
    }
  };

  return (
    <div
      className="glass-effect rounded-2xl p-6 border border-white/20 shadow-xl bg-gradient-to-br from-white/90 to-gray-50/60 hover:scale-102 hover:shadow-2xl transition-all duration-300 cursor-pointer animate-slide-up"
      onClick={() => onSelect(es)}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-gray-800">{es.title}</h3>
          </div>
          <p className="text-blue-600 font-medium mb-2">{template.title}</p>
          <p className="text-gray-600 line-clamp-2">{es.question}</p>
        </div>
        <div className="flex flex-col items-end space-y-3">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium shadow-lg ${getStatusColor(es.status)}`}>
            {getStatusIcon(es.status)}
            <span className="ml-2">{getStatusText(es.status)}</span>
          </span>
          {es.analysis && (
            <div className="flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 rounded-full border border-blue-200">
              <StarIcon className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm font-bold text-blue-700">{es.analysis.overallScore}点</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">{es.wordCount} / {template.wordLimit} 文字</span>
          </div>
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">履歴 {es.history.length} 件</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ClockIcon className="h-4 w-4" />
          <span>{new Date(es.updatedAt).toLocaleDateString('ja-JP')}</span>
        </div>
      </div>
    </div>
  );
};

interface TemplateGridProps {
  templates: ESTemplate[];
  onSelectTemplate: (template: ESTemplate) => void;
}

const TemplateGrid: React.FC<TemplateGridProps> = ({ templates, onSelectTemplate }) => {
  const getCategoryColor = (category: ESTemplate['category']) => {
    const colors = {
      'self-pr': 'bg-blue-50 text-blue-700 border-blue-200',
      'motivation': 'bg-green-50 text-green-700 border-green-200',
      'gakuchika': 'bg-purple-50 text-purple-700 border-purple-200',
      'career-plan': 'bg-orange-50 text-orange-700 border-orange-200',
      'challenge': 'bg-red-50 text-red-700 border-red-200',
      'teamwork': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'other': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[category];
  };

  const getCategoryLabel = (category: ESTemplate['category']) => {
    const labels = {
      'self-pr': '自己PR',
      'motivation': '志望動機',
      'gakuchika': 'ガクチカ',
      'career-plan': 'キャリアプラン',
      'challenge': '挑戦経験',
      'teamwork': 'チームワーク',
      'other': 'その他'
    };
    return labels[category];
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template, index) => (
        <div
          key={template.id}
          className="glass-effect rounded-2xl p-6 border border-white/20 shadow-xl bg-gradient-to-br from-white/90 to-blue-50/40 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer animate-slide-up"
          onClick={() => onSelectTemplate(template)}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="mb-6">
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border-2 mb-4 shadow-lg ${getCategoryColor(template.category)}`}>
              <SparklesIcon className="h-4 w-4 mr-1" />
              {getCategoryLabel(template.category)}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{template.title}</h3>
            <p className="text-gray-600 line-clamp-3 leading-relaxed">{template.question}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{template.wordLimit} 文字制限</span>
              <span>{template.guidelines.length} つのポイント</span>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/30">
              <div className="flex items-center text-sm text-blue-600 font-medium">
                <RocketLaunchIcon className="h-4 w-4 mr-2" />
                すぐに作成開始
              </div>
              <Button 
                variant="gradient" 
                size="sm"
                className="shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                作成開始
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

function ESSupportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [esContents, setEsContents] = useState<ESContent[]>([]);
  const [filteredContents, setFilteredContents] = useState<ESContent[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'templates'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ESContent['status']>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadESContents = async () => {
      if (!user || !isStorageSupported()) {
        setIsLoading(false);
        return;
      }

      try {
        const storage = getStorage();
        const contents = await storage.getSetting(`es_contents_${user.id}`) as ESContent[] | null;
        
        if (contents) {
          setEsContents(contents);
          setFilteredContents(contents);
        }
      } catch (error) {
        console.error('Error loading ES contents:', error);
      }
      
      setIsLoading(false);
    };

    loadESContents();
  }, [user]);

  useEffect(() => {
    let filtered = esContents;

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(es =>
        es.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        es.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        es.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter(es => es.status === statusFilter);
    }

    setFilteredContents(filtered);
  }, [esContents, searchQuery, statusFilter]);

  const handleSelectES = (es: ESContent) => {
    router.push(`/es-support/editor?id=${es.id}`);
  };

  const handleSelectTemplate = async (template: ESTemplate) => {
    if (!user || !isStorageSupported()) return;

    try {
      const storage = getStorage();
      
      // 新しいESコンテンツを作成
      const newES: ESContent = {
        id: `es_${Date.now()}`,
        userId: user.id,
        templateId: template.id,
        title: `${template.title} - ${new Date().toLocaleDateString('ja-JP')}`,
        question: template.question,
        content: '',
        wordCount: 0,
        status: 'draft',
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 既存のコンテンツに追加
      const updatedContents = [...esContents, newES];
      await storage.setSetting(`es_contents_${user.id}`, updatedContents);
      
      setEsContents(updatedContents);
      router.push(`/es-support/editor?id=${newES.id}`);
    } catch (error) {
      console.error('Error creating new ES:', error);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">ESデータを読み込み中...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          {/* Enhanced Header */}
          <div className="text-center glass-effect rounded-3xl p-12 border border-white/20 shadow-2xl bg-gradient-to-br from-blue-50/80 via-white/90 to-purple-50/80 animate-slide-up">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto">
                <DocumentTextIcon className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <SparklesIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              ES支援ツール
            </h1>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full border border-blue-200">
              <LightBulbIcon className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800 font-medium text-lg">AIが分析・フィードバックするエントリーシート作成ツール</p>
            </div>
          </div>

          {/* Enhanced View Toggle */}
          <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="glass-effect flex bg-white/80 rounded-2xl p-1.5 border border-white/30 shadow-xl">
              <button
                onClick={() => setCurrentView('list')}
                className={`px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  currentView === 'list'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <DocumentTextIcon className="h-4 w-4 mr-2 inline" />
                作成済みES
              </button>
              <button
                onClick={() => setCurrentView('templates')}
                className={`px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                  currentView === 'templates'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <SparklesIcon className="h-4 w-4 mr-2 inline" />
                テンプレート
              </button>
            </div>

            {currentView === 'templates' && (
              <Button 
                variant="gradient" 
                size="lg" 
                onClick={() => setCurrentView('list')}
                className="shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                新しいES作成
              </Button>
            )}
          </div>

          {currentView === 'list' ? (
            <div className="space-y-6">
              {/* Filters */}
              {esContents.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ES を検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | ESContent['status'])}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">全てのステータス</option>
                    <option value="draft">下書き</option>
                    <option value="completed">完了</option>
                    <option value="submitted">提出済み</option>
                  </select>
                </div>
              )}

              {/* ES List */}
              {filteredContents.length > 0 ? (
                <div className="space-y-4">
                  {filteredContents.map(es => {
                    const template = ES_TEMPLATES.find(t => t.id === es.templateId);
                    if (!template) return null;
                    
                    return (
                      <ESListItem
                        key={es.id}
                        es={es}
                        template={template}
                        onSelect={handleSelectES}
                      />
                    );
                  })}
                </div>
              ) : esContents.length === 0 ? (
                <div className="text-center py-16 glass-effect rounded-3xl border border-white/20 shadow-xl bg-gradient-to-br from-white/90 to-blue-50/60">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <DocumentTextIcon className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">まだESがありません</h3>
                  <p className="text-gray-600 mb-8 text-lg">テンプレートを使って最初のESを作成しましょう</p>
                  <Button 
                    variant="gradient" 
                    size="lg" 
                    onClick={() => setCurrentView('templates')}
                    className="shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    <RocketLaunchIcon className="h-5 w-5 mr-2" />
                    テンプレートから作成
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">検索結果が見つかりません</h3>
                  <p className="text-gray-600 mb-6">検索条件を変更してもう一度お試しください</p>
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                    フィルターをリセット
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Enhanced Templates Header */}
              <div className="text-center glass-effect rounded-2xl p-8 border border-white/20 shadow-xl bg-gradient-to-br from-white/90 to-purple-50/60 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">ESテンプレート</h2>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  豊富なテンプレートから選んでESを作成できます。各テンプレートには構成ガイドと例文が含まれています。
                </p>
              </div>

              {/* Templates Grid */}
              <TemplateGrid templates={ES_TEMPLATES} onSelectTemplate={handleSelectTemplate} />
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default ESSupportPage;