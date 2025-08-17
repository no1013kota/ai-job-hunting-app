'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ProtectedRoute } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { getRandomQuestion, questions } from '@/lib/questions';
import type { InterviewQuestion } from '@/types';
import { useRouter } from 'next/navigation';
import {
  StopIcon,
  PlayIcon,
  ArrowLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface RecordingState {
  isRecording: boolean;
  isPreparing: boolean;
  isCompleted: boolean;
  currentTime: number;
  preparationTime: number;
}

interface AppState {
  showQuestionSelection: boolean;
  selectedQuestion: InterviewQuestion | null;
}

function InterviewPracticePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const [appState, setAppState] = useState<AppState>({
    showQuestionSelection: true,
    selectedQuestion: null
  });
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPreparing: false,
    isCompleted: false,
    currentTime: 0,
    preparationTime: 30,
  });
  const [error, setError] = useState<string>('');
  const [mediaSupported, setMediaSupported] = useState(false);

  // Initialize camera when question is selected
  useEffect(() => {
    if (!appState.selectedQuestion) return;

    const initializeCamera = async () => {
      try {
        // Check media support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('お使いのブラウザはカメラ機能をサポートしていません。');
          return;
        }

        // Get camera stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setMediaSupported(true);
      } catch (err) {
        console.error('Error initializing camera:', err);
        let errorMessage = 'カメラまたはマイクへのアクセスに問題があります。';
        
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            errorMessage = 'カメラとマイクへのアクセスが拒否されました。ブラウザの設定で許可してください。';
          } else if (err.name === 'NotFoundError') {
            errorMessage = 'カメラまたはマイクが見つかりません。デバイスが正しく接続されているか確認してください。';
          } else if (err.name === 'NotSupportedError') {
            errorMessage = 'お使いのブラウザは録画機能に対応していません。Chrome、Firefox、Safari等の最新版をお使いください。';
          }
        }
        
        setError(errorMessage);
      }
    };

    initializeCamera();

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [appState.selectedQuestion]);

  // Timer for preparation and recording
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (recordingState.isPreparing && recordingState.preparationTime > 0) {
      interval = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          preparationTime: prev.preparationTime - 1
        }));
      }, 1000);
    } else if (recordingState.isRecording) {
      interval = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          currentTime: prev.currentTime + 1
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recordingState.isPreparing, recordingState.isRecording, recordingState.preparationTime]);

  // Auto-start recording after preparation
  useEffect(() => {
    if (recordingState.isPreparing && recordingState.preparationTime === 0) {
      startRecording();
    }
  }, [recordingState.preparationTime]);

  const startPreparation = useCallback(() => {
    setRecordingState(prev => ({
      ...prev,
      isPreparing: true,
      preparationTime: 30
    }));
  }, []);

  const startRecording = useCallback(async () => {
    if (!streamRef.current || !appState.selectedQuestion) return;

    try {
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm'
        });
        
        // Store recording data for analysis
        const recordingData = {
          questionId: appState.selectedQuestion.id,
          question: appState.selectedQuestion.text,
          recordingBlob: blob,
          duration: recordingState.currentTime,
          timestamp: new Date().toISOString()
        };
        
        // Navigate to results page with recording data
        localStorage.setItem('latest_recording', JSON.stringify({
          ...recordingData,
          recordingBlob: null // Cannot serialize Blob
        }));
        
        router.push('/interview/results');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setRecordingState(prev => ({
        ...prev,
        isPreparing: false,
        isRecording: true,
        currentTime: 0
      }));
    } catch (err) {
      console.error('Error starting recording:', err);
      let errorMessage = '録画の開始に失敗しました。';
      
      if (err instanceof Error) {
        if (err.name === 'NotSupportedError') {
          errorMessage = 'お使いのブラウザは録画機能に対応していません。Chrome、Firefox、Safari等をお試しください。';
        } else if (err.name === 'InvalidStateError') {
          errorMessage = '録画デバイスの状態に問題があります。ページを再読み込みしてお試しください。';
        }
      }
      
      setError(errorMessage);
    }
  }, [appState.selectedQuestion, router, recordingState.currentTime]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        isCompleted: true
      }));
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeLimit = appState.selectedQuestion?.timeLimit || 120;
  const isTimeUp = recordingState.currentTime >= timeLimit;

  // Auto-stop recording when time is up
  useEffect(() => {
    if (isTimeUp && recordingState.isRecording) {
      stopRecording();
    }
  }, [isTimeUp, recordingState.isRecording, stopRecording]);

  // Question selection functions
  const selectQuestion = useCallback((selectedQuestion: InterviewQuestion) => {
    setAppState({
      showQuestionSelection: false,
      selectedQuestion
    });
  }, []);

  const selectRandomQuestion = useCallback(() => {
    const randomQuestion = getRandomQuestion();
    selectQuestion(randomQuestion);
  }, [selectQuestion]);

  const skipPreparationTime = useCallback(() => {
    setRecordingState(prev => ({
      ...prev,
      preparationTime: 0
    }));
  }, []);

  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">エラーが発生しました</h1>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => router.push('/interview')}>
              面接ページに戻る
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Show question selection screen
  if (appState.showQuestionSelection) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => router.push('/interview')}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>戻る</span>
              </Button>
            </div>

            {/* Question Selection */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">面接質問を選択してください</h1>
              
              {/* Random Question Button */}
              <div className="mb-6">
                <Button
                  size="lg"
                  onClick={selectRandomQuestion}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <span>🎲</span>
                  <span>ランダム質問で練習</span>
                </Button>
              </div>

              <div className="text-center text-gray-500 mb-6">または</div>

              {/* Question List */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">質問一覧から選択</h2>
                <div className="grid gap-3">
                  {questions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => selectQuestion(q)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-blue-600 font-medium">
                          {q.category === 'general' ? '一般質問' : '行動面接'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.floor((q.timeLimit || 120) / 60)}分{((q.timeLimit || 120) % 60)}秒
                        </span>
                      </div>
                      <p className="text-gray-800">{q.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!appState.selectedQuestion) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">面接の準備中...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout showBottomNav={false}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/interview')}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>戻る</span>
            </Button>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                制限時間: {formatTime(timeLimit)}
              </span>
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative aspect-video md:aspect-video aspect-[4/3] bg-gray-900">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Recording Indicator */}
              {recordingState.isRecording && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">REC</span>
                </div>
              )}

              {/* Timer */}
              {(recordingState.isRecording || recordingState.isPreparing) && (
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                  {recordingState.isPreparing ? (
                    <span className="text-sm">準備: {recordingState.preparationTime}秒</span>
                  ) : (
                    <span className={`text-sm ${isTimeUp ? 'text-red-400' : ''}`}>
                      {formatTime(recordingState.currentTime)} / {formatTime(timeLimit)}
                    </span>
                  )}
                </div>
              )}

              {/* Preparation Overlay */}
              {recordingState.isPreparing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl font-bold mb-2">
                      {recordingState.preparationTime}
                    </div>
                    <div className="text-lg">秒後に録画開始</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Question Section */}
          <div className="bg-blue-50 rounded-lg p-4 md:p-6">
            <div className="flex justify-between items-start mb-2 md:mb-3">
              <h2 className="text-base md:text-lg font-semibold text-blue-900">
                質問 ({appState.selectedQuestion.category === 'general' ? '一般' : '行動面接'})
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAppState({ showQuestionSelection: true, selectedQuestion: null })}
                className="text-blue-600 hover:text-blue-800"
              >
                質問を変更
              </Button>
            </div>
            <p className="text-blue-800 text-sm md:text-lg leading-relaxed">
              {appState.selectedQuestion.text}
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!recordingState.isPreparing && !recordingState.isRecording && !recordingState.isCompleted && (
              <Button
                size="lg"
                onClick={startPreparation}
                className="flex items-center space-x-2"
                disabled={!mediaSupported}
              >
                <PlayIcon className="h-5 w-5" />
                <span>録画開始</span>
              </Button>
            )}

            {recordingState.isRecording && (
              <Button
                size="lg"
                variant="destructive"
                onClick={stopRecording}
                className="flex items-center space-x-2"
              >
                <StopIcon className="h-5 w-5" />
                <span>録画終了</span>
              </Button>
            )}

            {recordingState.isPreparing && (
              <div className="text-center space-y-3">
                <div className="text-gray-600">
                  質問を確認し、準備してください
                </div>
                <div className="text-sm text-gray-500">
                  {recordingState.preparationTime}秒後に自動的に録画が開始されます
                </div>
                <Button
                  variant="outline"
                  onClick={skipPreparationTime}
                  className="flex items-center space-x-2"
                >
                  <span>準備時間をスキップ</span>
                </Button>
              </div>
            )}
          </div>

          {/* Instructions */}
          {!recordingState.isRecording && !recordingState.isPreparing && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">💡 録画のコツ</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• <strong>姿勢</strong>: カメラをまっすぐ見て、背筋を伸ばしてください</li>
                <li>• <strong>環境</strong>: 明るく静かな場所で録画してください</li>
                <li>• <strong>話し方</strong>: はっきりと話し、適切な声量を保ってください</li>
                <li>• <strong>構成</strong>: 結論→理由→具体例→まとめの順で話してください</li>
                <li>• <strong>時間</strong>: 制限時間は{Math.floor((appState.selectedQuestion?.timeLimit || 120) / 60)}分{((appState.selectedQuestion?.timeLimit || 120) % 60)}秒です</li>
              </ul>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default InterviewPracticePage;