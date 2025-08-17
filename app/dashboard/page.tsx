'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { getStorage, isStorageSupported } from '@/lib/storage';
import { calculateNaiteiRikiScore, updateScoreHistory, analyzeScoreProgress, type NaiteiRikiScore, type ScoreHistory } from '@/lib/scoring';
import type { AssessmentResult } from '@/lib/assessment';
import type { UserProfile } from '@/lib/profile';
import type { InterviewRecord } from '@/lib/storage';
import {
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

interface ScoreCircleProps {
  score: number;
  size?: 'small' | 'large';
  label?: string;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, size = 'large', label }) => {
  const radius = size === 'large' ? 90 : 45;
  const strokeWidth = size === 'large' ? 8 : 4;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#10b981'; // green-500
    if (score >= 80) return '#3b82f6'; // blue-500  
    if (score >= 70) return '#f59e0b'; // amber-500
    if (score >= 60) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  const getScoreGradient = (score: number): string => {
    if (score >= 90) return 'from-green-400 to-emerald-600';
    if (score >= 80) return 'from-blue-400 to-indigo-600';  
    if (score >= 70) return 'from-yellow-400 to-amber-600';
    if (score >= 60) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-red-600';
  };

  const svgSize = size === 'large' ? 200 : 100;
  const fontSize = size === 'large' ? 'text-3xl' : 'text-lg';
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className={`w-${svgSize === 200 ? '52' : '26'} h-${svgSize === 200 ? '52' : '26'} rounded-full bg-gradient-to-br ${getScoreGradient(score)} p-2 shadow-2xl animate-pulse-slow`}>
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
            <svg
              height={svgSize}
              width={svgSize}
              className="transform -rotate-90"
            >
              <circle
                stroke="#e5e7eb"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={svgSize / 2}
                cy={svgSize / 2}
              />
              <circle
                stroke={getScoreColor(score)}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={svgSize / 2}
                cy={svgSize / 2}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${fontSize} font-bold`} style={{ color: getScoreColor(score) }}>
              {score}
              {size === 'large' && <span className="text-sm font-normal text-gray-600 mt-1">/ 100</span>}
            </div>
          </div>
        </div>
      </div>
      {label && <span className="text-sm text-gray-600 mt-3 text-center font-medium">{label}</span>}
    </div>
  );
};

function DashboardPage() {
  const { user } = useAuth();
  const [naiteiRikiScore, setNaiteiRikiScore] = useState<NaiteiRikiScore | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user || !isStorageSupported()) {
        setIsLoading(false);
        return;
      }

      try {
        const storage = getStorage();
        
        // データを並行して取得
        const [interviews, assessment, profile, savedHistory] = await Promise.all([
          storage.getInterviews(user.id),
          storage.getSetting(`assessment_${user.id}`) as Promise<AssessmentResult | null>,
          storage.getSetting(`profile_${user.id}`) as Promise<UserProfile | null>,
          storage.getSetting(`score_history_${user.id}`) as Promise<ScoreHistory[] | null>
        ]);

        // 内定力スコア計算
        const currentScore = calculateNaiteiRikiScore(interviews, assessment, profile, savedHistory || []);
        
        // スコア履歴更新
        const updatedHistory = updateScoreHistory(currentScore, savedHistory || []);
        
        // 結果を保存
        await Promise.all([
          storage.setSetting(`naitei_riki_score_${user.id}`, currentScore),
          storage.setSetting(`score_history_${user.id}`, updatedHistory)
        ]);

        setNaiteiRikiScore(currentScore);
        setScoreHistory(updatedHistory);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
      
      setIsLoading(false);
    };

    loadDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">内定力スコアを計算中...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!naiteiRikiScore) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">データが不足しています</h1>
              <p className="text-gray-600">
                内定力スコアを計算するためには、面接練習または適性診断が必要です
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/interview">
                <Button size="lg">面接練習を開始</Button>
              </Link>
              <Link href="/assessment">
                <Button variant="outline" size="lg">適性診断を受ける</Button>
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const progress = analyzeScoreProgress(scoreHistory);
  const trendIcon = naiteiRikiScore.trend === 'up' ? ArrowTrendingUpIcon : 
                   naiteiRikiScore.trend === 'down' ? ArrowTrendingDownIcon : MinusIcon;
  const TrendIcon = trendIcon;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <ChartBarIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">内定力ダッシュボード</h1>
            <p className="text-gray-600">AIが分析したあなたの総合的な就活力</p>
          </div>

          {/* Overall Score */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-6 lg:mb-0">
                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                  <TrophyIcon className="h-8 w-8 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900">内定力スコア</h2>
                  <div className="flex items-center space-x-1">
                    <TrendIcon className={`h-5 w-5 ${
                      naiteiRikiScore.trend === 'up' ? 'text-green-500' : 
                      naiteiRikiScore.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      naiteiRikiScore.trend === 'up' ? 'text-green-600' : 
                      naiteiRikiScore.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {naiteiRikiScore.weeklyChange > 0 ? '+' : ''}{naiteiRikiScore.weeklyChange.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg text-gray-700">{naiteiRikiScore.levelDescription}</p>
                  <div className="flex items-center justify-center lg:justify-start space-x-4 text-sm text-gray-600">
                    <span>信頼区間: {naiteiRikiScore.confidenceInterval.min} - {naiteiRikiScore.confidenceInterval.max}</span>
                    <span>最終更新: {new Date(naiteiRikiScore.lastUpdated).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              </div>
              <ScoreCircle score={naiteiRikiScore.overall} />
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">スコア内訳</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <ScoreCircle score={naiteiRikiScore.breakdown.interviewScore} size="small" label="面接スキル" />
              <ScoreCircle score={naiteiRikiScore.breakdown.assessmentScore} size="small" label="適性診断" />
              <ScoreCircle score={naiteiRikiScore.breakdown.profileScore} size="small" label="プロフィール" />
              <ScoreCircle score={naiteiRikiScore.breakdown.activityScore} size="small" label="活動量" />
              <ScoreCircle score={naiteiRikiScore.breakdown.consistencyScore} size="small" label="継続性" />
              <ScoreCircle score={naiteiRikiScore.breakdown.improvementScore} size="small" label="改善度" />
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Strengths */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <FireIcon className="h-5 w-5 mr-2" />
                あなたの強み
              </h3>
              {naiteiRikiScore.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {naiteiRikiScore.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center text-green-800">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-700">継続的な取り組みで強みを発見しましょう</p>
              )}
            </div>

            {/* Weaknesses */}
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                改善ポイント
              </h3>
              {naiteiRikiScore.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {naiteiRikiScore.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-center text-orange-800">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-orange-700">バランスよく成長しています</p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <LightBulbIcon className="h-5 w-5 mr-2" />
              おすすめのアクション
            </h3>
            {naiteiRikiScore.recommendations.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {naiteiRikiScore.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-sm rounded-full flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span className="text-blue-800">{rec}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-blue-800">現在のペースを継続してください</p>
            )}
          </div>

          {/* Progress Overview */}
          {scoreHistory.length > 1 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">進捗サマリー</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{progress.bestScore}</div>
                  <div className="text-sm text-gray-600">最高スコア</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    progress.avgWeeklyChange > 0 ? 'text-green-600' : 
                    progress.avgWeeklyChange < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {progress.avgWeeklyChange > 0 ? '+' : ''}{progress.avgWeeklyChange.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">週平均変化</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    progress.progress === 'improving' ? 'text-green-600' : 
                    progress.progress === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {progress.progress === 'improving' ? '↗' : 
                     progress.progress === 'declining' ? '↘' : '→'}
                  </div>
                  <div className="text-sm text-gray-600">全体トレンド</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{scoreHistory.length}</div>
                  <div className="text-sm text-gray-600">記録日数</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/interview" className="block">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-semibold">面</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">面接練習</h3>
                  <p className="text-sm text-gray-600">AIと面接練習をしてスコアを向上</p>
                </div>
              </div>
            </Link>

            <Link href="/assessment" className="block">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-semibold">診</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">適性診断</h3>
                  <p className="text-sm text-gray-600">適性を再診断して精度向上</p>
                </div>
              </div>
            </Link>

            <Link href="/profile" className="block">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 font-semibold">P</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">プロフィール</h3>
                  <p className="text-sm text-gray-600">プロフィールを充実させる</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default DashboardPage;