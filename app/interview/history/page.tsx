'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { getStorage, isStorageSupported, type InterviewRecord } from '@/lib/storage';
import {
  ClockIcon,
  TrophyIcon,
  CalendarDaysIcon,
  EyeIcon,
  ArrowLeftIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';


function InterviewHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [history, setHistory] = useState<InterviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (!isStorageSupported()) {
        console.warn('IndexedDB not supported, using empty history');
        setHistory([]);
        setIsLoading(false);
        return;
      }

      try {
        // Load interview history from IndexedDB
        const storage = getStorage();
        const interviews = await storage.getInterviews(user.id);
        setHistory(interviews);
      } catch (error) {
        console.error('Error loading interview history:', error);
        // Fallback to empty history
        setHistory([]);
      }
      
      setIsLoading(false);
    };

    loadHistory();
  }, [user]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const completedInterviews = history.filter(item => item.analysisResult);
  const averageScore = completedInterviews.length > 0 ? 
    Math.round(completedInterviews.reduce((acc, item) => acc + item.analysisResult!.overallScore, 0) / completedInterviews.length) : 0;

  const totalPracticeTime = history.reduce((acc, item) => acc + item.duration, 0);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">面接履歴を読み込み中...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/interview')}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>戻る</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">面接練習履歴</h1>
                <p className="text-gray-600">これまでの練習結果を確認できます</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-600">{history.length}</div>
              <div className="text-sm text-gray-600">総練習回数</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <TrophyIcon className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-600">
                {averageScore > 0 ? `${averageScore}点` : '-'}
              </div>
              <div className="text-sm text-gray-600">平均スコア</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <ClockIcon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-600">{formatTime(totalPracticeTime)}</div>
              <div className="text-sm text-gray-600">総練習時間</div>
            </div>
          </div>

          {/* History List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">練習履歴</h2>
            </div>
            
            {history.length === 0 ? (
              <div className="p-8 text-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  まだ面接練習を行っていません
                </h3>
                <p className="text-gray-600 mb-6">
                  面接練習を開始して、結果をここで確認しましょう！
                </p>
                <Button onClick={() => router.push('/interview/practice')}>
                  面接練習を開始する
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {history.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.category === 'general' ? '一般' : item.category === 'behavioral' ? '行動面接' : '技術面接'}
                          </span>
                          {item.analysisResult && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(item.analysisResult.overallScore)}`}>
                              {item.analysisResult.overallScore}点
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 font-medium mb-2 line-clamp-2">
                          {item.question}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatTime(item.duration)}
                          </div>
                          <div className="flex items-center">
                            <CalendarDaysIcon className="h-4 w-4 mr-1" />
                            {formatDate(item.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to detailed results if available
                            if (item.analysisResult) {
                              // For demo, just show alert with score
                              alert(`スコア: ${item.analysisResult.overallScore}点\n\n詳細な結果表示機能は準備中です`);
                            } else {
                              alert('この練習はまだ分析中です');
                            }
                          }}
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          詳細
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          {history.length > 0 && (
            <div className="text-center">
              <Button 
                size="lg" 
                onClick={() => router.push('/interview/practice')}
                className="px-8"
              >
                新しい面接練習を開始
              </Button>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default InterviewHistoryPage;