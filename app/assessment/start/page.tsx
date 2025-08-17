'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import {
  ASSESSMENT_QUESTIONS,
  calculateAssessmentScores,
  generateCareerSuggestions,
  generateAssessmentSummary,
  type AssessmentResponse,
  type AssessmentResult
} from '@/lib/assessment';
import { getStorage, isStorageSupported } from '@/lib/storage';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function AssessmentStartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1;
  const progress = Math.round(((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100);

  // 現在の質問の回答を取得
  const getCurrentResponse = (): AssessmentResponse | undefined => {
    return responses.find(r => r.questionId === currentQuestion.id);
  };

  // 回答を保存
  const handleAnswer = (answer: string | number | string[]) => {
    const newResponse: AssessmentResponse = {
      questionId: currentQuestion.id,
      answer
    };

    setResponses(prev => {
      const existing = prev.findIndex(r => r.questionId === currentQuestion.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newResponse;
        return updated;
      } else {
        return [...prev, newResponse];
      }
    });
  };

  // 次の質問へ
  const handleNext = () => {
    if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // 前の質問へ
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // 診断完了
  const handleComplete = async () => {
    if (!user) return;

    setIsCompleting(true);
    
    try {
      // スコア計算
      const scores = calculateAssessmentScores(responses);
      const careerSuggestions = generateCareerSuggestions(scores);
      const summary = generateAssessmentSummary(scores);

      // 結果をまとめる
      const result: AssessmentResult = {
        id: `assessment_${Date.now()}`,
        userId: user.id,
        completedAt: new Date().toISOString(),
        responses,
        scores,
        careerSuggestions,
        summary
      };

      // IndexedDBに保存
      if (isStorageSupported()) {
        const storage = getStorage();
        await storage.setSetting('latest_assessment', result);
        await storage.setSetting(`assessment_${user.id}`, result);
      }

      toast.success('診断が完了しました！');
      router.push('/assessment/result');
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast.error('診断結果の保存に失敗しました');
    } finally {
      setIsCompleting(false);
    }
  };

  const currentResponse = getCurrentResponse();
  const hasAnswered = currentResponse !== undefined;

  return (
    <ProtectedRoute>
      <Layout showBottomNav={false}>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/assessment')}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>戻る</span>
            </Button>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                質問 {currentQuestionIndex + 1} / {ASSESSMENT_QUESTIONS.length}
              </div>
              <div className="text-xs text-gray-500">
                進捗: {progress}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {currentQuestion.category === 'action' && '行動力'}
                  {currentQuestion.category === 'thinking' && '思考力'}
                  {currentQuestion.category === 'interest' && '興味・関心'}
                  {currentQuestion.category === 'personality' && '性格・特性'}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-4">
              {currentQuestion.type === 'scale' && currentQuestion.scaleRange && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>{currentQuestion.scaleRange.minLabel}</span>
                    <span>{currentQuestion.scaleRange.maxLabel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    {Array.from({ length: currentQuestion.scaleRange.max }, (_, i) => i + 1).map(value => (
                      <label key={value} className="flex flex-col items-center cursor-pointer">
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={value}
                          checked={currentResponse?.answer === value}
                          onChange={(e) => handleAnswer(parseInt(e.target.value))}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-600 mt-1">{value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {currentQuestion.type === 'single' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={option}
                        checked={currentResponse?.answer === option}
                        onChange={(e) => handleAnswer(e.target.value)}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'multiple' && currentQuestion.options && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-3">複数選択可能です（最大3つまで）</p>
                  {currentQuestion.options.map((option, index) => {
                    const selectedOptions = Array.isArray(currentResponse?.answer) ? currentResponse.answer : [];
                    const isSelected = selectedOptions.includes(option);
                    const canSelect = selectedOptions.length < 3 || isSelected;
                    
                    return (
                      <label key={index} className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-colors ${
                        canSelect ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                      }`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={!canSelect}
                          onChange={(e) => {
                            const currentSelected = Array.isArray(currentResponse?.answer) ? currentResponse.answer : [];
                            if (e.target.checked) {
                              handleAnswer([...currentSelected, option]);
                            } else {
                              handleAnswer(currentSelected.filter(item => item !== option));
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-800">{option}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>前の質問</span>
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleComplete}
                disabled={!hasAnswered || isCompleting}
                className="flex items-center space-x-2"
                size="lg"
              >
                {isCompleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>診断中...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>診断完了</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!hasAnswered}
                className="flex items-center space-x-2"
              >
                <span>次の質問</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Help */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>回答のコツ:</strong> 正解はありません。直感的に、普段のあなたに最も近い選択肢を選んでください。
            </p>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default AssessmentStartPage;