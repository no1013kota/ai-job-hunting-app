'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { PlayIcon, ClipboardDocumentListIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { getStorage, calculateUserStats, isStorageSupported } from '@/lib/storage';

function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    totalPracticeTime: 0
  });

  const [gamification, setGamification] = useState({
    level: 1,
    xp: 150,
    xpToNext: 300,
    streak: 5,
    badges: ['first-interview', 'early-bird', 'consistent-learner'],
    dailyGoals: {
      completed: 2,
      total: 3
    }
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!user || !isStorageSupported()) return;
      
      try {
        const storage = getStorage();
        const interviews = await storage.getInterviews(user.id);
        const userStats = calculateUserStats(interviews);
        setStats(userStats);
      } catch (error) {
        console.error('Error loading user stats:', error);
      }
    };

    loadStats();
  }, [user]);

  return (
    <Layout>
      <div className="space-y-12">
        {/* Welcome Section */}
        <div className="text-center py-12 animate-fade-in">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl shadow-2xl mb-6 animate-pulse-slow">
              <span className="text-3xl">🚀</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
            就活AIアシスタント
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-xl text-gray-600 mb-4 font-medium">
              <span className="text-blue-600 font-bold">{user?.name}</span>さん、お疲れ様です！
            </p>
            <p className="text-lg text-gray-500 leading-relaxed">
              AIがあなたの就職活動を<br className="hidden sm:block" />
              <span className="font-semibold text-gray-700">効率的にサポート</span>します
            </p>
          </div>
          
          {/* Gamification Status */}
          <div className="mt-8 max-w-4xl mx-auto">
            {/* Level & Progress */}
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-2xl mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-3xl mr-3">⭐</span>
                    <div>
                      <div className="text-2xl font-bold">レベル {gamification.level}</div>
                      <div className="text-amber-100 text-sm">就活レベル</div>
                    </div>
                  </div>
                  <div className="w-64 bg-white/20 rounded-full h-3 mb-2">
                    <div 
                      className="bg-white rounded-full h-3 transition-all duration-1000 ease-out"
                      style={{ width: `${(gamification.xp / gamification.xpToNext) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-amber-100">
                    {gamification.xp}/{gamification.xpToNext} XP
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🔥</span>
                    <div>
                      <div className="text-2xl font-bold">{gamification.streak}日</div>
                      <div className="text-amber-100 text-sm">連続で頑張った日数</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Goals */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/30 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-xl mr-2">🎯</span>
                  <span className="font-bold text-gray-800">今日の目標</span>
                </div>
                <div className="text-sm text-gray-600">
                  {gamification.dailyGoals.completed}/{gamification.dailyGoals.total} 達成
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full h-2 transition-all duration-1000"
                  style={{ width: `${(gamification.dailyGoals.completed / gamification.dailyGoals.total) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/30 shadow-lg">
              <div className="flex items-center mb-3">
                <span className="text-xl mr-2">🏆</span>
                <span className="font-bold text-gray-800">がんばった証</span>
              </div>
              <div className="flex gap-3">
                {gamification.badges.map((badge, index) => (
                  <div key={index} className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-200 cursor-pointer">
                    <span className="text-white text-lg font-bold">
                      {badge === 'first-interview' ? '🎙️' : 
                       badge === 'early-bird' ? '🌅' : 
                       badge === 'consistent-learner' ? '📚' : '🎖️'}
                    </span>
                  </div>
                ))}
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center border-2 border-dashed border-gray-400">
                  <span className="text-gray-400 text-lg">+</span>
                </div>
              </div>
            </div>

            {/* Stats Preview - Enhanced */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🎤</span>
                  <div className="text-2xl font-bold">{stats.totalInterviews}</div>
                </div>
                <div className="text-sm text-blue-100">面接の練習</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📊</span>
                  <div className="text-2xl font-bold">
                    {stats.averageScore > 0 ? `${stats.averageScore}` : '準備中'}
                  </div>
                </div>
                <div className="text-sm text-green-100">平均点数</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🏆</span>
                  <div className="text-2xl font-bold">
                    {stats.bestScore > 0 ? `${stats.bestScore}` : '準備中'}
                  </div>
                </div>
                <div className="text-sm text-purple-100">最高点数</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">⏰</span>
                  <div className="text-2xl font-bold">
                    {stats.totalPracticeTime > 0 ? `${stats.totalPracticeTime}m` : '0m'}
                  </div>
                </div>
                <div className="text-sm text-orange-100">学習時間</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 animate-slide-up">
          {/* Dashboard Card - Enhanced */}
          <Link href="/dashboard" className="group">
            <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-3xl shadow-2xl p-8 card-hover cursor-pointer text-white relative overflow-hidden transform hover:rotate-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-green-900">+5</span>
                </div>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h2 className="text-xl font-bold leading-tight">就活力<br />チェック</h2>
                </div>
                <p className="mb-4 opacity-90 text-blue-100 leading-relaxed">
                  AIがあなたの就活力を分析してお見せします
                </p>
                <div className="mb-4">
                  <div className="text-xs text-blue-200 mb-1">進み具合</div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 w-3/4 animate-pulse"></div>
                  </div>
                </div>
                <div className="glass-effect rounded-2xl p-4 text-center group-hover:bg-white/30 transition-all duration-300 group-hover:shadow-lg">
                  <span className="font-bold text-white flex items-center justify-center">
                    結果を見る 
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Interview Practice Card - Enhanced */}
          <Link href="/interview" className="group">
            <div className="glass-effect rounded-3xl shadow-2xl p-8 card-hover cursor-pointer relative overflow-hidden border border-white/30 transform hover:-rotate-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-xs font-bold">LIVE</span>
                </div>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <PlayIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">面接の練習</h2>
                    <div className="text-xs text-red-500 font-semibold">+15 ポイント</div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  AIと一緒に面接の練習をして、本番に備えましょう
                </p>
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">今週の目標</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-full h-2 w-2/3"></div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl p-4 text-center font-bold group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <span className="flex items-center justify-center">
                    練習を始める 
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Assessment Card - Enhanced */}
          <Link href="/assessment" className="group">
            <div className="glass-effect rounded-3xl shadow-2xl p-8 card-hover cursor-pointer relative overflow-hidden border border-white/30 transform hover:rotate-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-900">NEW</span>
                </div>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">適性診断</h2>
                    <div className="text-xs text-green-500 font-semibold">+25 ポイント</div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  あなたに合った仕事や業界をAIが診断します
                </p>
                <div className="mb-4 grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div className="text-xs text-gray-600">性格</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div className="text-xs text-gray-600">能力</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-1 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">?</span>
                    </div>
                    <div className="text-xs text-gray-600">向いてる仕事</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 text-center font-bold group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <span className="flex items-center justify-center">
                    診断を受ける 
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* ES Support Card - Enhanced */}
          <Link href="/es-support" className="group">
            <div className="glass-effect rounded-3xl shadow-2xl p-8 card-hover cursor-pointer relative overflow-hidden border border-white/30 transform hover:-rotate-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">ES作成サポート</h2>
                    <div className="text-xs text-purple-500 font-semibold">+10 ポイント</div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  AIがエントリーシートの作成をお手伝いします
                </p>
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">作成の進み具合</div>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">5社中2社完成</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl p-4 text-center font-bold group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <span className="flex items-center justify-center">
                    ES作成を始める 
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Company Research Card - Enhanced */}
          <Link href="/companies" className="group">
            <div className="glass-effect rounded-3xl shadow-2xl p-8 card-hover cursor-pointer relative overflow-hidden border border-white/30 transform hover:rotate-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">NEW</span>
                </div>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">企業内定率検索</h2>
                    <div className="text-xs text-indigo-500 font-semibold">+5 ポイント</div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  気になる企業の内定率や選考情報を詳しく調べられます
                </p>
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">登録企業数</div>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-indigo-300 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">100社以上登録済み</div>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl p-4 text-center font-bold group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <span className="flex items-center justify-center">
                    企業を検索する 
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Highlight */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* AI Features */}
          <div className="glass-effect rounded-3xl p-8 border border-white/30">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">AI機能の特徵</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-gray-800">即座分析</div>
                  <div className="text-gray-600 text-sm">面接やESをすぐに分析して評価</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-gray-800">あなた専用</div>
                  <div className="text-gray-600 text-sm">あなただけのアドバイスを提供</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-gray-800">いつでもサポート</div>
                  <div className="text-gray-600 text-sm">24時間いつでも練習や相談が可能</div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Tips */}
          <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h2 className="text-2xl font-bold">成功するコツ</h2>
              </div>
              <div className="space-y-4 text-emerald-100">
                <div className="font-semibold text-white">継続が一番大事</div>
                <p className="leading-relaxed">
                  毎日少しずつでも継続することで、確実に上達します。まずは週に1回、面接練習から始めてみましょう！
                </p>
                <div className="bg-white/20 rounded-2xl p-4 mt-4">
                  <div className="font-semibold text-white">おすすめスケジュール</div>
                  <div className="text-sm text-emerald-100 mt-2">
                    月曜日: 面接練習 / 水曜日: ES作成 / 金曜日: 適性診断
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
