'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { getStorage, isStorageSupported } from '@/lib/storage';
import { useNotifications } from '@/contexts/NotificationContext';
import type { AssessmentResult } from '@/lib/assessment';
import {
  TrophyIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  BriefcaseIcon,
  LightBulbIcon,
  ShareIcon,
  ArrowPathIcon,
  SparklesIcon,
  CheckBadgeIcon,
  StarIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface RadarChartProps {
  scores: AssessmentResult['scores'];
}

const RadarChart: React.FC<RadarChartProps> = ({ scores }) => {
  const maxScore = 100;
  const center = 150;
  const radius = 100;
  
  const axes = [
    { key: 'action', label: '行動力', angle: 0 },
    { key: 'thinking', label: '思考力', angle: 60 },
    { key: 'people', label: '人への関心', angle: 120 },
    { key: 'things', label: 'モノへの関心', angle: 180 },
    { key: 'systems', label: '仕組みへの関心', angle: 240 },
    { key: 'proactive', label: '能動性', angle: 300 }
  ] as const;

  const getPoint = (score: number, angle: number) => {
    const radian = (angle * Math.PI) / 180;
    const r = (score / maxScore) * radius;
    return {
      x: center + r * Math.cos(radian - Math.PI / 2),
      y: center + r * Math.sin(radian - Math.PI / 2)
    };
  };

  const pathData = axes.map((axis, index) => {
    const score = scores[axis.key as keyof typeof scores];
    const point = getPoint(score, axis.angle);
    return index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`;
  }).join(' ') + ' Z';

  return (
    <div className="relative">
      <svg width="300" height="300" className="mx-auto">
        {/* Background circles */}
        {[20, 40, 60, 80, 100].map(level => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / maxScore) * radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Axes lines */}
        {axes.map(axis => {
          const endPoint = getPoint(maxScore, axis.angle);
          return (
            <line
              key={axis.key}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Data area */}
        <path
          d={pathData}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        
        {/* Data points */}
        {axes.map(axis => {
          const score = scores[axis.key as keyof typeof scores];
          const point = getPoint(score, axis.angle);
          return (
            <circle
              key={axis.key}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#3b82f6"
            />
          );
        })}
        
        {/* Labels */}
        {axes.map(axis => {
          const labelPoint = getPoint(maxScore + 20, axis.angle);
          const score = scores[axis.key as keyof typeof scores];
          return (
            <text
              key={axis.key}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium fill-gray-700"
            >
              {axis.label}
              <tspan x={labelPoint.x} dy="12" className="text-xs font-bold fill-blue-600">
                {score}
              </tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
};

function AssessmentResultPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { triggerAchievementNotification } = useNotifications();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      if (!user || !isStorageSupported()) {
        setIsLoading(false);
        return;
      }

      try {
        const storage = getStorage();
        const savedResult = await storage.getSetting('latest_assessment') as AssessmentResult | null;
        
        if (savedResult && savedResult.userId === user.id) {
          setResult(savedResult);
          // Trigger achievement notification for assessment completion
          triggerAchievementNotification('assessment_complete', {});
        } else {
          // ユーザー固有の診断結果も確認
          const userResult = await storage.getSetting(`assessment_${user.id}`) as AssessmentResult | null;
          if (userResult) {
            setResult(userResult);
            // Trigger achievement notification for assessment completion
            triggerAchievementNotification('assessment_complete', {});
          }
        }
      } catch (error) {
        console.error('Error loading assessment result:', error);
      }
      
      setIsLoading(false);
    };

    loadResult();
  }, [user]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">診断結果を読み込み中...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!result) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">診断結果がありません</h1>
              <p className="text-gray-600">
                まずは適性診断を受けてください
              </p>
            </div>
            <Button onClick={() => router.push('/assessment/start')}>
              適性診断を開始する
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const topScores = Object.entries(result.scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between animate-slide-up">
            <Button
              variant="ghost"
              onClick={() => router.push('/assessment')}
              className="flex items-center space-x-2 hover:bg-white/80 transition-all duration-300"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>戻る</span>
            </Button>
            <div className="glass-effect px-4 py-2 rounded-xl border border-white/20 bg-white/60">
              <div className="text-sm text-gray-600 flex items-center space-x-2">
                <CheckBadgeIcon className="h-4 w-4 text-green-600" />
                <span>診断実施日: {new Date(result.completedAt).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          </div>

          {/* Hero Title */}
          <div className="text-center glass-effect rounded-3xl p-12 border border-white/20 shadow-2xl bg-gradient-to-br from-blue-50/80 via-white/90 to-purple-50/80 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                <TrophyIcon className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <SparklesIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              AI適性診断結果
            </h1>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full border border-blue-200">
              <StarIcon className="h-5 w-5 text-blue-600" />
              <p className="text-blue-800 font-medium text-lg">{result.summary}</p>
            </div>
          </div>

          {/* Enhanced Radar Chart */}
          <div className="glass-effect rounded-3xl p-10 border border-white/20 shadow-2xl bg-gradient-to-br from-white/90 to-blue-50/60 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                  <ChartBarIcon className="h-5 w-5 text-white" />
                </div>
                あなたの適性チャート
              </h2>
              <p className="text-gray-600">各領域でのあなたの能力を視覚化しました</p>
            </div>
            
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <RadarChart scores={result.scores} />
            </div>
            
            {/* Enhanced Top 3 Strengths */}
            <div className="mt-10">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
                <RocketLaunchIcon className="h-6 w-6 mr-2 text-yellow-600" />
                あなたの上位3つの強み
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {topScores.map(([key, score], index) => {
                  const labels: Record<string, string> = {
                    action: '行動力',
                    thinking: '思考力', 
                    people: '人への関心',
                    things: 'モノへの関心',
                    systems: '仕組みへの関心',
                    proactive: '能動性',
                    reactive: '受動性'
                  };
                  
                  const colors = [
                    'from-yellow-400 to-orange-500',
                    'from-blue-400 to-blue-600', 
                    'from-green-400 to-green-600'
                  ];
                  
                  const medals = ['🥇', '🥈', '🥉'];
                  
                  return (
                    <div key={key} className={`text-center p-6 glass-effect rounded-2xl border border-white/30 shadow-xl bg-gradient-to-br ${colors[index]} text-white hover:scale-105 transition-all duration-300`}>
                      <div className="text-4xl mb-2">{medals[index]}</div>
                      <div className="text-xl font-bold mb-1">{index + 1}位</div>
                      <div className="font-semibold text-lg mb-2">{labels[key]}</div>
                      <div className="text-4xl font-bold">{score}</div>
                      <div className="text-sm opacity-90 mt-1">ポイント</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Enhanced Career Suggestions */}
          <div className="glass-effect rounded-3xl p-10 border border-white/20 shadow-2xl bg-gradient-to-br from-white/90 to-green-50/60 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              AI推奨キャリア
            </h2>
            <p className="text-center text-gray-600 mb-8">あなたの適性にマッチしたキャリアを推奨します</p>
            
            <div className="grid gap-8">
              {result.careerSuggestions.map((suggestion, index) => (
                <div key={index} className="glass-effect border border-white/30 rounded-2xl p-8 shadow-xl bg-gradient-to-br from-white/90 to-gray-50/60 hover:scale-102 transition-all duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-gray-800">{suggestion.jobType}</h3>
                      </div>
                      <p className="text-lg text-blue-600 font-medium">{suggestion.industry}</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full border border-green-200">
                        <StarIcon className="h-5 w-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-700">{suggestion.matchScore}%</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">適合度</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{suggestion.description}</p>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">必要スキル</h4>
                      <ul className="space-y-1">
                        {suggestion.requiredSkills.map((skill, skillIndex) => (
                          <li key={skillIndex} className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">成長可能性</h4>
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${suggestion.growthPotential}%` }}
                          ></div>
                        </div>
                        <span className="text-green-600 font-semibold">{suggestion.growthPotential}%</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">想定年収</h4>
                      <div className="text-gray-700">
                        {suggestion.salaryRange.min}万円 〜 {suggestion.salaryRange.max}万円
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Next Steps */}
          <div className="glass-effect rounded-3xl p-10 border border-white/20 shadow-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <LightBulbIcon className="h-6 w-6 text-white" />
              </div>
              次のアクションプラン
            </h2>
            <p className="text-center text-gray-600 mb-8">診断結果を活かして、就活を成功に導きましょう</p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-effect rounded-2xl p-8 border border-white/30 shadow-xl bg-gradient-to-br from-white/90 to-blue-50/60 hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">面接練習で強化</h3>
                  <p className="text-gray-600 mb-6">
                    診断結果をベースに、面接でのアピールポイントを練習しましょう
                  </p>
                  <Button 
                    variant="gradient"
                    size="lg"
                    onClick={() => router.push('/interview')}
                    className="w-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    <RocketLaunchIcon className="h-5 w-5 mr-2" />
                    面接練習を開始
                  </Button>
                </div>
              </div>
              
              <div className="glass-effect rounded-2xl p-8 border border-white/30 shadow-xl bg-gradient-to-br from-white/90 to-purple-50/60 hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">内定力スコア確認</h3>
                  <p className="text-gray-600 mb-6">
                    面接結果と診断結果を統合した総合スコアを確認しましょう
                  </p>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => router.push('/dashboard')}
                    className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300"
                  >
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    ダッシュボードを見る
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Actions */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up" style={{animationDelay: '0.5s'}}>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/assessment/start')}
              className="flex items-center space-x-2 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span>再診断する</span>
            </Button>
            
            <Button
              variant="gradient"
              size="lg"
              onClick={() => {
                // 結果を共有する機能（将来実装）
                alert('共有機能は準備中です🚀');
              }}
              className="flex items-center space-x-2 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <ShareIcon className="h-5 w-5" />
              <span>結果を共有</span>
            </Button>
          </div>

          {/* Enhanced Disclaimer */}
          <div className="glass-effect rounded-2xl p-6 border border-yellow-200/50 shadow-lg bg-gradient-to-r from-yellow-50/80 to-orange-50/80 animate-slide-up" style={{animationDelay: '0.6s'}}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">⚠️</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-yellow-800 mb-2">重要なお知らせ</h3>
                <p className="text-sm text-yellow-800 leading-relaxed">
                  この診断結果はAIによる参考情報です。最終的なキャリア選択は、あなた自身の価値観、経験、状況を総合的に考慮して判断してください。この結果を参考に、さらなる成長を目指しましょう！
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default AssessmentResultPage;