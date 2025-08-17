'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { interviewQuestions } from '@/lib/questions';
import type { InterviewQuestion } from '@/types';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface QuestionSession {
  selectedQuestions: InterviewQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  startTime: number;
  mode: 'selected' | 'random';
}

function InterviewQuestionsPage() {
  const router = useRouter();
  const [session, setSession] = useState<QuestionSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [canSkipTimer, setCanSkipTimer] = useState(false);

  // Timer for preparation time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsTimerActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeRemaining]);

  const startSession = (mode: 'selected' | 'random', questionIds?: string[]) => {
    let selectedQuestions: InterviewQuestion[];
    
    if (mode === 'random') {
      // ランダムで3-5問を選択
      const shuffled = [...interviewQuestions].sort(() => Math.random() - 0.5);
      const numQuestions = Math.floor(Math.random() * 3) + 3; // 3-5問
      selectedQuestions = shuffled.slice(0, numQuestions);
    } else {
      // 指定された質問を使用
      selectedQuestions = interviewQuestions.filter(q => questionIds?.includes(q.id)) || interviewQuestions;
    }

    setSession({
      selectedQuestions,
      currentQuestionIndex: 0,
      answers: {},
      startTime: Date.now(),
      mode
    });
    setCurrentAnswer('');
    setTimeRemaining(30);
    setIsTimerActive(true);
    setCanSkipTimer(true);
  };

  const skipTimer = () => {
    if (canSkipTimer) {
      setTimeRemaining(0);
      setIsTimerActive(false);
    }
  };

  const saveAnswer = () => {
    if (!session || !currentAnswer.trim()) return;

    const currentQuestion = session.selectedQuestions[session.currentQuestionIndex];
    const updatedAnswers = {
      ...session.answers,
      [currentQuestion.id]: currentAnswer.trim()
    };

    setSession({
      ...session,
      answers: updatedAnswers
    });
  };

  const nextQuestion = () => {
    if (!session) return;

    saveAnswer();

    if (session.currentQuestionIndex < session.selectedQuestions.length - 1) {
      setSession({
        ...session,
        currentQuestionIndex: session.currentQuestionIndex + 1
      });
      setCurrentAnswer('');
      setTimeRemaining(30);
      setIsTimerActive(true);
      setCanSkipTimer(true);
    } else {
      // セッション完了 - 結果ページへ
      const sessionData = {
        ...session,
        answers: {
          ...session.answers,
          [session.selectedQuestions[session.currentQuestionIndex].id]: currentAnswer.trim()
        },
        endTime: Date.now()
      };
      
      localStorage.setItem('interview_session_result', JSON.stringify(sessionData));
      router.push('/interview/results');
    }
  };

  const previousQuestion = () => {
    if (!session || session.currentQuestionIndex === 0) return;

    saveAnswer();
    
    setSession({
      ...session,
      currentQuestionIndex: session.currentQuestionIndex - 1
    });
    
    const prevQuestion = session.selectedQuestions[session.currentQuestionIndex - 1];
    setCurrentAnswer(session.answers[prevQuestion.id] || '');
    setTimeRemaining(0);
    setIsTimerActive(false);
    setCanSkipTimer(false);
  };

  if (!session) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Link href="/interview">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>面接練習に戻る</span>
                </Button>
              </Link>
            </div>

            <div className="text-center space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">面接質問練習</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                複数の面接質問に文章で回答する練習ができます。準備時間付きで本番に近い環境を体験できます。
              </p>
            </div>

            {/* Practice Modes */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Random Mode */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-2xl">🎲</span>
                  </div>
                  <h2 className="text-xl font-bold">ランダム練習</h2>
                </div>
                <p className="text-blue-100 mb-6 leading-relaxed">
                  ランダムに選ばれた3〜5問の質問で練習します。予想外の質問への対応力を鍛えられます。
                </p>
                <div className="mb-4 text-sm text-blue-100">
                  • 問題数: 3〜5問（ランダム）<br />
                  • 準備時間: 各問30秒<br />
                  • 推定時間: 10〜15分
                </div>
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => startSession('random')}
                >
                  ランダム練習を始める
                </Button>
              </div>

              {/* Select Mode */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h2 className="text-xl font-bold">質問選択練習</h2>
                </div>
                <p className="text-green-100 mb-6 leading-relaxed">
                  下の一覧から気になる質問を選んで集中的に練習できます。苦手分野の克服に最適です。
                </p>
                <div className="mb-4 text-sm text-green-100">
                  • 問題数: お好みで選択<br />
                  • 準備時間: 各問30秒<br />
                  • カスタマイズ可能
                </div>
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => {
                    const element = document.getElementById('questions-list');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  質問を選んで練習
                </Button>
              </div>
            </div>

            {/* Questions List */}
            <div id="questions-list" className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">面接質問一覧</h2>
                <p className="text-gray-600">練習したい質問を選択してください</p>
              </div>

              <QuestionsList onStartSession={(questionIds) => startSession('selected', questionIds)} />
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const currentQuestion = session.selectedQuestions[session.currentQuestionIndex];
  const progress = ((session.currentQuestionIndex + 1) / session.selectedQuestions.length) * 100;

  return (
    <ProtectedRoute>
      <Layout showBottomNav={false}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSession(null)}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>練習を終了</span>
            </Button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session.currentQuestionIndex + 1} / {session.selectedQuestions.length}
              </span>
            </div>
          </div>

          {/* Progress */}
          <ProgressBar 
            progress={progress} 
            className="mb-6"
            color="blue"
            showLabel={false}
          />

          {/* Timer Section */}
          {isTimerActive && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold text-amber-800">準備時間</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-amber-600">
                    {timeRemaining}秒
                  </span>
                  {canSkipTimer && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={skipTimer}
                    >
                      スキップ
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm text-amber-700 mt-2">
                質問を読んで、回答を考える時間です。準備ができたらスキップしてください。
              </p>
            </div>
          )}

          {/* Question Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                    質問 {session.currentQuestionIndex + 1}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                    {currentQuestion.category === 'general' ? '一般質問' : '行動面接'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  目安時間: {Math.floor(currentQuestion.timeLimit / 60)}分
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 leading-relaxed">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                あなたの回答を入力してください
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="こちらに回答を入力してください。具体例を交えながら、結論→理由→具体例→まとめの順で構成すると良いでしょう。"
                rows={8}
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isTimerActive}
              />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  {currentAnswer.length} 文字
                </span>
                <span>
                  目安: 200-400文字程度
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={session.currentQuestionIndex === 0}
            >
              前の質問
            </Button>
            
            <Button
              onClick={nextQuestion}
              disabled={isTimerActive || !currentAnswer.trim()}
              className="flex items-center space-x-2"
            >
              <span>
                {session.currentQuestionIndex === session.selectedQuestions.length - 1 
                  ? '練習を完了する' 
                  : '次の質問へ'
                }
              </span>
              {session.currentQuestionIndex === session.selectedQuestions.length - 1 ? (
                <CheckCircleIcon className="h-4 w-4" />
              ) : (
                <span>→</span>
              )}
            </Button>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function QuestionsList({ onStartSession }: { onStartSession: (questionIds: string[]) => void }) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const toggleQuestion = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };

  const selectAll = () => {
    if (selectedQuestions.length === interviewQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(interviewQuestions.map(q => q.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={selectAll}
        >
          {selectedQuestions.length === interviewQuestions.length ? '全て解除' : '全て選択'}
        </Button>
        <Button
          onClick={() => onStartSession(selectedQuestions)}
          disabled={selectedQuestions.length === 0}
          className="flex items-center space-x-2"
        >
          <PlayIcon className="h-4 w-4" />
          <span>選択した質問で練習 ({selectedQuestions.length}問)</span>
        </Button>
      </div>

      <div className="grid gap-4">
        {interviewQuestions.map((question, index) => {
          const isSelected = selectedQuestions.includes(question.id);
          return (
            <div
              key={question.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => toggleQuestion(question.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {isSelected && <CheckCircleIcon className="h-3 w-3 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-semibold text-gray-900">
                      質問 {index + 1}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      question.category === 'general' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {question.category === 'general' ? '一般質問' : '行動面接'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.floor(question.timeLimit / 60)}分
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {question.text}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InterviewQuestionsPage;