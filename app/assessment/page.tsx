'use client';

import { useState } from 'react';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  ClipboardDocumentListIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

function AssessmentPage() {
  const { user } = useAuth();
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <ClipboardDocumentListIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI適性診断</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              多軸評価であなたの適性と最適なキャリアパスを発見しましょう
            </p>
          </div>

          {!hasCompletedAssessment ? (
            <>
              {/* 診断の特徴 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">AI適性診断の特徴</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">多軸評価</h3>
                    <p className="text-sm text-gray-600">
                      行動力×思考力×興味分野を掛け合わせた7軸での精密診断
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">AI分析</h3>
                    <p className="text-sm text-gray-600">
                      AIが回答パターンを分析し、隠れた適性も発見
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="font-bold">3</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">具体的提案</h3>
                    <p className="text-sm text-gray-600">
                      職種・業界・年収レンジまで具体的にレコメンド
                    </p>
                  </div>
                </div>
              </div>

              {/* 評価軸の説明 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">評価される7つの軸</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-3">働き方スタイル</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span><strong>行動力</strong>: 積極性・実行力・チャレンジ精神</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span><strong>思考力</strong>: 分析力・論理性・戦略思考</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span><strong>能動性</strong>: 自主性・主体性・変化適応力</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-3">興味・関心領域</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span><strong>人</strong>: コミュニケーション・チームワーク・サポート</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span><strong>モノ</strong>: 技術・開発・クリエイティブ・研究</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span><strong>仕組み</strong>: 戦略・企画・マネジメント・改善</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 診断情報 */}
              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <ClockIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">診断について</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• 所要時間: 約10-15分</li>
                      <li>• 質問数: 全13問</li>
                      <li>• 診断は途中保存できます</li>
                      <li>• 回答に正解・不正解はありません</li>
                      <li>• 直感的に答えることで、より精度の高い結果が得られます</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 開始ボタン */}
              <div className="text-center">
                <Link href="/assessment/start">
                  <Button size="lg" className="px-8 py-4 text-lg">
                    <span className="flex items-center space-x-2">
                      <span>適性診断を開始する</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </span>
                  </Button>
                </Link>
                <p className="text-xs text-gray-500 mt-3">
                  診断結果は面接スコアと統合され、内定力スコアに反映されます
                </p>
              </div>
            </>
          ) : (
            /* 診断完了後の表示 */
            <div className="text-center space-y-6">
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">診断完了済み</h2>
                <p className="text-gray-600">
                  あなたの適性診断は既に完了しています
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/assessment/result">
                  <Button variant="outline" size="lg">
                    診断結果を確認
                  </Button>
                </Link>
                <Link href="/assessment/start">
                  <Button size="lg">
                    再診断を実行
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 注意事項 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">📋 診断結果の活用方法</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-medium mb-2">✅ おすすめの活用法</h4>
                <ul className="space-y-1">
                  <li>• 職種選択の参考として活用</li>
                  <li>• 自己PRの根拠として利用</li>
                  <li>• 面接での回答内容の改善</li>
                  <li>• キャリアプランの見直し</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">⚠️ 注意点</h4>
                <ul className="space-y-1">
                  <li>• 診断結果は絶対的なものではありません</li>
                  <li>• 最終的な判断はあなた自身で行ってください</li>
                  <li>• 継続的な自己分析も大切です</li>
                  <li>• 結果は内定を保証するものではありません</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default AssessmentPage;