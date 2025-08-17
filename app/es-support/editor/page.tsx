'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { getStorage, isStorageSupported } from '@/lib/storage';
import { ES_TEMPLATES, analyzeESContent, type ESContent, type ESTemplate, type ESAnalysis } from '@/lib/es-support';
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  FireIcon,
  BookmarkIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface AnalysisDisplayProps {
  analysis: ESAnalysis;
  template: ESTemplate;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, template }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return 'border-green-200';
    if (score >= 70) return 'border-blue-200';
    if (score >= 60) return 'border-yellow-200';
    return 'border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className={`rounded-lg border-2 p-6 ${getScoreBorderColor(analysis.overallScore)}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">総合スコア</h3>
          <div className={`px-4 py-2 rounded-full text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
            {analysis.overallScore}点
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-600">推定読了時間</div>
            <div className="font-semibold">{analysis.estimatedReadTime}分</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">文章レベル</div>
            <div className="font-semibold">
              {analysis.overallScore >= 90 ? '上級' :
               analysis.overallScore >= 75 ? '中級' : 
               analysis.overallScore >= 60 ? '初級' : '要改善'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">複雑さ</div>
            <div className="font-semibold">
              {analysis.sentenceAnalysis.complexityScore >= 70 ? '高' :
               analysis.sentenceAnalysis.complexityScore >= 40 ? '中' : '低'}
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">詳細分析</h3>
        <div className="space-y-4">
          {Object.entries(analysis.breakdown).map(([key, data]) => {
            const labels: { [key: string]: string } = {
              structure: '構成',
              content: '内容',
              logic: '論理性', 
              originality: '独自性',
              readability: '読みやすさ'
            };

            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-700">{labels[key]}</span>
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${getScoreColor(data.score)}`}>
                      {data.score}点
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        data.score >= 80 ? 'bg-green-500' :
                        data.score >= 70 ? 'bg-blue-500' :
                        data.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{data.feedback}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 rounded-lg p-6">
          <h4 className="flex items-center font-semibold text-green-900 mb-4">
            <FireIcon className="h-5 w-5 mr-2" />
            良い点
          </h4>
          {analysis.strengths.length > 0 ? (
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-700">継続的な改善で強みを発見しましょう</p>
          )}
        </div>

        {/* Improvements */}
        <div className="bg-orange-50 rounded-lg p-6">
          <h4 className="flex items-center font-semibold text-orange-900 mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            改善点
          </h4>
          {analysis.improvements.length > 0 ? (
            <ul className="space-y-2">
              {analysis.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start text-orange-800">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  {improvement}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-orange-700">バランスよく作成されています</p>
          )}
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="flex items-center font-semibold text-blue-900 mb-4">
          <LightBulbIcon className="h-5 w-5 mr-2" />
          改善提案
        </h4>
        {analysis.suggestions.length > 0 ? (
          <div className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-sm rounded-full flex items-center justify-center font-medium mt-0.5 mr-3">
                  {index + 1}
                </span>
                <span className="text-blue-800">{suggestion}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-blue-800">現在の内容で十分です</p>
        )}
      </div>

      {/* Keyword Density */}
      {analysis.keywordDensity.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-semibold text-gray-900 mb-4">キーワード密度</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {analysis.keywordDensity.slice(0, 10).map((keyword, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="font-medium text-gray-900">{keyword.word}</div>
                <div className="text-sm text-gray-600">{keyword.count}回</div>
                <div className="text-xs text-gray-500">{keyword.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function ESEditorContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const esId = searchParams.get('id');

  const [esContent, setEsContent] = useState<ESContent | null>(null);
  const [template, setTemplate] = useState<ESTemplate | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [analysis, setAnalysis] = useState<ESAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadESContent = async () => {
      if (!user || !isStorageSupported() || !esId) {
        setIsLoading(false);
        return;
      }

      try {
        const storage = getStorage();
        const contents = await storage.getSetting(`es_contents_${user.id}`) as ESContent[] | null;
        
        if (contents) {
          const foundES = contents.find(es => es.id === esId);
          if (foundES) {
            setEsContent(foundES);
            setContent(foundES.content);
            setTitle(foundES.title);
            setAnalysis(foundES.analysis || null);
            
            const foundTemplate = ES_TEMPLATES.find(t => t.id === foundES.templateId);
            setTemplate(foundTemplate || null);
          }
        }
      } catch (error) {
        console.error('Error loading ES content:', error);
      }
      
      setIsLoading(false);
    };

    loadESContent();
  }, [user, esId]);

  const saveES = useCallback(async (newContent: string, newTitle: string, newStatus?: ESContent['status'], newAnalysis?: ESAnalysis) => {
    if (!user || !esContent || !isStorageSupported()) return;

    setIsSaving(true);
    try {
      const storage = getStorage();
      const contents = await storage.getSetting(`es_contents_${user.id}`) as ESContent[] | null;
      
      if (contents) {
        const updatedContent: ESContent = {
          ...esContent,
          title: newTitle,
          content: newContent,
          wordCount: newContent.replace(/\s+/g, '').length,
          status: newStatus || esContent.status,
          analysis: newAnalysis || esContent.analysis,
          updatedAt: new Date().toISOString()
        };

        // 履歴を追加（内容が変更された場合のみ）
        if (newContent !== esContent.content) {
          const historyEntry = {
            version: esContent.history.length + 1,
            content: esContent.content,
            timestamp: esContent.updatedAt,
            analysis: esContent.analysis
          };
          updatedContent.history = [...esContent.history, historyEntry];
        }

        const updatedContents = contents.map(es => 
          es.id === esContent.id ? updatedContent : es
        );
        
        await storage.setSetting(`es_contents_${user.id}`, updatedContents);
        setEsContent(updatedContent);
      }
    } catch (error) {
      console.error('Error saving ES content:', error);
    }
    setIsSaving(false);
  }, [user, esContent]);

  const handleAnalyze = async () => {
    if (!content.trim() || !template) return;

    setIsAnalyzing(true);
    try {
      const newAnalysis = analyzeESContent(content, template);
      setAnalysis(newAnalysis);
      setShowAnalysis(true);
      await saveES(content, title, 'completed', newAnalysis);
    } catch (error) {
      console.error('Error analyzing ES content:', error);
    }
    setIsAnalyzing(false);
  };

  const handleStatusChange = async (newStatus: ESContent['status']) => {
    await saveES(content, title, newStatus);
  };

  // Auto-save functionality
  useEffect(() => {
    if (!esContent || content === esContent.content) return;

    const timer = setTimeout(() => {
      saveES(content, title);
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, title, saveES, esContent]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">ESを読み込み中...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!esContent || !template) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ESが見つかりません</h1>
            <p className="text-gray-600 mb-6">指定されたESが存在しないか、アクセス権限がありません</p>
            <Button onClick={() => router.push('/es-support')}>
              ES一覧に戻る
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const wordCount = content.replace(/\s+/g, '').length;
  const wordRatio = wordCount / template.wordLimit;

  return (
    <ProtectedRoute>
      <Layout showBottomNav={false}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/es-support')}
              className="flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              ES一覧に戻る
            </Button>
            
            <div className="flex items-center space-x-3">
              {isSaving && (
                <span className="text-sm text-gray-500">保存中...</span>
              )}
              <Button
                variant="outline"
                onClick={handleAnalyze}
                disabled={!content.trim() || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full" />
                    分析中...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    AI分析実行
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Editor Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Status */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 text-xl font-semibold bg-transparent border-none outline-none text-gray-900"
                    placeholder="ESタイトル"
                  />
                  <div className="flex items-center space-x-2 ml-4">
                    <select
                      value={esContent.status}
                      onChange={(e) => handleStatusChange(e.target.value as ESContent['status'])}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="draft">下書き</option>
                      <option value="completed">完了</option>
                      <option value="submitted">提出済み</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{template.title}</span>
                  <span>•</span>
                  <span className={`${wordRatio > 1.2 ? 'text-red-600' : wordRatio < 0.8 ? 'text-orange-600' : 'text-green-600'}`}>
                    {wordCount} / {template.wordLimit} 文字
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {new Date(esContent.updatedAt).toLocaleString('ja-JP')}
                  </span>
                </div>
              </div>

              {/* Question */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">設問</h3>
                <p className="text-blue-800">{template.question}</p>
              </div>

              {/* Editor */}
              <div className="bg-white rounded-lg border">
                <div className="border-b p-4">
                  <h3 className="font-semibold text-gray-900">本文</h3>
                </div>
                <div className="p-6">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="ここにESの内容を書いてください..."
                    className="w-full h-96 p-4 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Guidelines */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <BookmarkIcon className="h-5 w-5 mr-2 text-blue-600" />
                  作成のポイント
                </h3>
                <ul className="space-y-2">
                  {template.guidelines.map((guideline, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      {guideline}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Structure Guide */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">構成ガイド</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium text-gray-700 mb-1">序論</div>
                    <div className="text-gray-600">{template.structure.introduction}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1">本論</div>
                    <div className="text-gray-600">{template.structure.body}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1">結論</div>
                    <div className="text-gray-600">{template.structure.conclusion}</div>
                  </div>
                </div>
              </div>

              {/* Examples */}
              {template.examples.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">例文</h3>
                  {template.examples.map((example, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="text-sm text-gray-700 mb-2 p-3 bg-gray-50 rounded-md">
                        {example.good}
                      </div>
                      <div className="text-xs text-gray-600">{example.explanation}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          {showAnalysis && analysis && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <ChartBarIcon className="h-8 w-8 mr-3 text-blue-600" />
                  AI分析結果
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setShowAnalysis(false)}
                >
                  分析を閉じる
                </Button>
              </div>
              <AnalysisDisplay analysis={analysis} template={template} />
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function ESEditorPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    }>
      <ESEditorContent />
    </Suspense>
  );
}

export default ESEditorPage;