'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { getStorage, calculateUserStats, isStorageSupported } from '@/lib/storage';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  CheckCircleIcon,
  TrophyIcon,
  LightBulbIcon,
  ArrowRightIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface RecordingData {
  questionId: string;
  question: string;
  duration: number;
  timestamp: string;
}

interface AnalysisResult {
  overallScore: number;
  categories: {
    clarity: { score: number; feedback: string };
    content: { score: number; feedback: string };
    confidence: { score: number; feedback: string };
    structure: { score: number; feedback: string };
  };
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
}

function InterviewResultsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { triggerAchievementNotification } = useNotifications();
  const [recordingData, setRecordingData] = useState<RecordingData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const loadRecordingData = () => {
      const data = localStorage.getItem('latest_recording');
      if (!data) {
        router.push('/interview');
        return;
      }

      try {
        const parsed = JSON.parse(data) as RecordingData;
        setRecordingData(parsed);
        
        // Simulate AI analysis
        setTimeout(async () => {
          const mockAnalysis: AnalysisResult = generateMockAnalysis(parsed);
          setAnalysisResult(mockAnalysis);
          
          // Save to IndexedDB
          if (user && isStorageSupported()) {
            try {
              const interviewRecord = {
                id: `interview_${Date.now()}`,
                userId: user.id,
                questionId: parsed.questionId,
                question: parsed.question,
                category: 'general', // Could be dynamic based on question
                duration: parsed.duration,
                timestamp: parsed.timestamp,
                analysisResult: {
                  overallScore: mockAnalysis.overallScore,
                  categories: mockAnalysis.categories,
                  strengths: mockAnalysis.strengths,
                  improvements: mockAnalysis.improvements,
                  nextSteps: mockAnalysis.nextSteps
                }
              };

              const storage = getStorage();
              await storage.saveInterview(interviewRecord);
              
              // Update user stats
              const allInterviews = await storage.getInterviews(user.id);
              const stats = calculateUserStats(allInterviews);
              await storage.updateUserStats(user.id, stats);
              
              // Trigger achievement notifications
              if (allInterviews.length === 1) {
                // First interview practice
                triggerAchievementNotification('first_interview', {});
              } else if (mockAnalysis.overallScore >= 90) {
                // High score achievement
                triggerAchievementNotification('high_score', { score: mockAnalysis.overallScore });
              }
              
              // Check for practice streak
              const recentInterviews = allInterviews
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 7);
              
              if (recentInterviews.length >= 3) {
                const dates = recentInterviews.map(i => new Date(i.timestamp).toDateString());
                const uniqueDates = [...new Set(dates)];
                if (uniqueDates.length >= 3) {
                  triggerAchievementNotification('practice_streak', { days: uniqueDates.length });
                }
              }
              
              console.log('Interview data saved successfully');
              // 成功した場合のlocalStorage削除
              localStorage.removeItem('latest_recording');
            } catch (error) {
              console.error('Error saving interview data:', error);
            }
          }
          
          setIsAnalyzing(false);
        }, 3000);
      } catch (err) {
        console.error('Error parsing recording data:', err);
        router.push('/interview');
      }
    };

    loadRecordingData();
  }, [router, user]);

  const generateMockAnalysis = (_data: RecordingData): AnalysisResult => {
    // Generate realistic mock scores based on duration and question type
    const baseScore = 70 + Math.random() * 25; // 70-95 range
    
    return {
      overallScore: Math.round(baseScore),
      categories: {
        clarity: {
          score: Math.round(baseScore + (Math.random() - 0.5) * 10),
          feedback: "発音がはっきりしており、聞き取りやすい話し方でした。"
        },
        content: {
          score: Math.round(baseScore + (Math.random() - 0.5) * 15),
          feedback: "質問に対して適切な内容で回答されています。具体例があるとより良いでしょう。"
        },
        confidence: {
          score: Math.round(baseScore + (Math.random() - 0.5) * 12),
          feedback: "落ち着いて回答されており、自信が感じられます。"
        },
        structure: {
          score: Math.round(baseScore + (Math.random() - 0.5) * 8),
          feedback: "回答の構成が整理されており、聞き手にとって分かりやすい内容でした。"
        }
      },
      strengths: [
        "明確で聞き取りやすい話し方",
        "質問の意図を正確に理解",
        "適切な話す速度とリズム"
      ],
      improvements: [
        "より具体的なエピソードの追加",
        "結論を最初に述べる構成",
        "アイコンタクトの維持"
      ],
      nextSteps: [
        "STAR法（状況・課題・行動・結果）を意識した回答練習",
        "鏡を見ながらの表情練習",
        "異なるタイプの質問での練習継続"
      ]
    };
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (isAnalyzing) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <h1 className="text-2xl font-bold text-gray-900">
              AIが面接を分析中...
            </h1>
            <p className="text-gray-600">
              音声認識と回答内容を解析しています。しばらくお待ちください。
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 分析には約30秒〜1分かかります
              </p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!recordingData || !analysisResult) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">
              データが見つかりません
            </h1>
            <p className="text-gray-600">
              面接結果を表示するためのデータが見つかりませんでした。
            </p>
            <Button onClick={() => router.push('/interview')}>
              面接ページに戻る
            </Button>
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
          <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              面接練習完了！
            </h1>
            <p className="text-gray-600">
              AIによる分析結果をご確認ください
            </p>
          </div>

          {/* Question Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              練習した質問
            </h2>
            <div className="space-y-3">
              <p className="text-gray-700">{recordingData.question}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>回答時間: {formatTime(recordingData.duration)}</span>
                <span>実施日時: {new Date(recordingData.timestamp).toLocaleString('ja-JP')}</span>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <TrophyIcon className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">総合スコア</h2>
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(analysisResult.overallScore)}`}>
                {analysisResult.overallScore}
              </div>
              <div className="text-lg text-gray-600">/ 100点</div>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(analysisResult.categories).map(([key, category]) => {
              const labels = {
                clarity: '明瞭性',
                content: '内容',
                confidence: '自信',
                structure: '構成'
              };
              
              return (
                <div key={key} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {labels[key as keyof typeof labels]}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(category.score)} ${getScoreColor(category.score)}`}>
                      {category.score}点
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{category.feedback}</p>
                </div>
              );
            })}
          </div>

          {/* Strengths */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="flex items-center text-lg font-semibold text-green-800 mb-4">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              良かった点
            </h3>
            <ul className="space-y-2">
              {analysisResult.strengths.map((strength, index) => (
                <li key={index} className="flex items-start text-green-700">
                  <span className="text-green-500 mr-2">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="bg-orange-50 rounded-lg p-6">
            <h3 className="flex items-center text-lg font-semibold text-orange-800 mb-4">
              <LightBulbIcon className="h-5 w-5 mr-2" />
              改善点
            </h3>
            <ul className="space-y-2">
              {analysisResult.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start text-orange-700">
                  <span className="text-orange-500 mr-2">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="flex items-center text-lg font-semibold text-blue-800 mb-4">
              <ArrowRightIcon className="h-5 w-5 mr-2" />
              次のステップ
            </h3>
            <ul className="space-y-2">
              {analysisResult.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start text-blue-700">
                  <span className="text-blue-500 mr-2">{index + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/interview/practice')}
              className="flex items-center justify-center space-x-2"
            >
              <span>もう一度練習する</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/')}
              className="flex items-center justify-center space-x-2"
            >
              <HomeIcon className="h-4 w-4" />
              <span>ホームに戻る</span>
            </Button>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default InterviewResultsPage;