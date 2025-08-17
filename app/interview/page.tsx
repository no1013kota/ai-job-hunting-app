'use client';

import { ProtectedRoute } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { 
  VideoCameraIcon,
  MicrophoneIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

function InterviewStartPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <VideoCameraIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI面接練習
          </h1>
          <p className="text-gray-600">
            AIが面接官となってリアルな面接体験を提供します。<br />
            質問形式で気軽に練習するか、動画で本格的に練習するか選べます。
          </p>
        </div>

        {/* Preparation Checklist */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            面接前の準備チェック
          </h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <VideoCameraIcon className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">カメラの確認</p>
                <p className="text-sm text-gray-600">
                  明るい場所で、顔がはっきり見えることを確認してください
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MicrophoneIcon className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">マイクの確認</p>
                <p className="text-sm text-gray-600">
                  静かな環境で、声がクリアに録音されることを確認してください
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">時間の確保</p>
                <p className="text-sm text-gray-600">
                  面接練習には約10-15分かかります
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            練習モードの特徵
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">📝 質問形式練習</h3>
              <ul className="space-y-1 text-blue-800 text-sm">
                <li>• 複数の質問に文章で回答</li>
                <li>• 30秒の準備時間（スキップ可能）</li>
                <li>• ランダムまたは選択式</li>
                <li>• 10-15分で完了</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">🎥 動画練習</h3>
              <ul className="space-y-1 text-blue-800 text-sm">
                <li>• カメラで動画録画</li>
                <li>• 本格的な面接体験</li>
                <li>• AIが詳細分析</li>
                <li>• 1問あたり5-10分</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                注意事項
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                本サービスは練習用です。実際の面接結果を保証するものではありません。
                録画されたデータは分析後に削除されます。
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/interview/questions">
            <Button size="lg" className="w-full h-auto py-4">
              <div className="text-center">
                <div className="text-lg font-bold mb-1">📝 質問形式練習</div>
                <div className="text-sm opacity-90">複数の質問に文章で回答</div>
              </div>
            </Button>
          </Link>
          <Link href="/interview/practice">
            <Button size="lg" variant="outline" className="w-full h-auto py-4">
              <div className="text-center">
                <div className="text-lg font-bold mb-1">🎥 動画練習</div>
                <div className="text-sm opacity-90">動画で面接練習</div>
              </div>
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col space-y-3">
          <Link href="/interview/history">
            <Button variant="ghost" size="lg" className="w-full">
              過去の面接結果を見る
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            あなたの面接練習統計
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">練習回数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">-</div>
              <div className="text-sm text-gray-600">平均スコア</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">-</div>
              <div className="text-sm text-gray-600">最高スコア</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function InterviewPage() {
  return (
    <ProtectedRoute>
      <InterviewStartPage />
    </ProtectedRoute>
  );
}