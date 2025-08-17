# 🤖 AI就活アシスタント

AIを活用した就職活動サポートアプリケーション。面接練習、企業研究、適性診断、ES作成支援など、就活に必要な機能を統合的に提供します。

## ✨ 主な機能

### 🎤 面接練習
- **質問形式練習**: 複数の面接質問に文章で回答
- **動画練習**: カメラを使用した本格的な面接シミュレーション
- **ランダム出題**: 予想外の質問への対応力を鍛える
- **30秒準備時間**: スキップ可能な考える時間

### 🏢 企業内定率検索
- **詳細な企業データ**: 内定率、年収、ワークライフバランス等
- **検索・フィルタリング**: 業界、規模、地域での絞り込み
- **ランキング表示**: 内定率・年収トップ10
- **選考プロセス**: ステップバイステップの選考情報

### 📊 AI適性診断
- 7軸評価システムによる適性分析
- あなたに最適な職種・業界の提案
- パーソナライズされたキャリアアドバイス

### 📝 ES作成サポート
- AI による文章分析・添削
- 企業別最適化アドバイス
- リアルタイムフィードバック

### 🎮 ゲーミフィケーション
- **レベルシステム**: 学習進度を可視化
- **バッジ・アチーブメント**: 達成感を提供
- **連続学習ストリーク**: Duolingo風継続モチベーション
- **デイリーミッション**: 毎日の学習目標

## 🚀 技術スタック

- **フレームワーク**: Next.js 15
- **言語**: TypeScript
- **UI ライブラリ**: Tailwind CSS 4
- **アイコン**: Heroicons
- **状態管理**: React hooks + Context API
- **ストレージ**: IndexedDB（ローカル）
- **PWA対応**: Service Worker + Manifest

## 📦 セットアップ

### 前提条件
- Node.js 18.0 以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/ai-job-hunting-app.git
cd ai-job-hunting-app

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集して必要な値を設定

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

## 🌐 デプロイ

### Vercel（推奨）

1. Vercel アカウントを作成
2. GitHub リポジトリと連携
3. プロジェクトをインポート
4. 環境変数を設定（必要に応じて）
5. デプロイ実行

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### その他のプラットフォーム

```bash
# ビルド
npm run build

# 本番サーバー起動
npm start
```

## 📱 PWA機能

- オフライン対応
- インストール可能
- プッシュ通知（予定）
- バックグラウンド同期（予定）

## 🔧 環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `NEXT_PUBLIC_APP_NAME` | アプリケーション名 | AI就活アシスタント |
| `NEXT_PUBLIC_APP_URL` | アプリケーションURL | http://localhost:3000 |
| `DATABASE_URL` | データベースURL（オプション） | - |
| `OPENAI_API_KEY` | OpenAI APIキー（オプション） | - |

## 📁 プロジェクト構造

```
ai-job-hunting/
├── app/                      # Next.js App Router
│   ├── companies/           # 企業検索機能
│   ├── interview/           # 面接練習機能
│   ├── assessment/          # 適性診断機能
│   ├── es-support/          # ES作成支援
│   ├── dashboard/           # ダッシュボード
│   └── auth/               # 認証機能
├── components/              # 再利用可能コンポーネント
│   ├── ui/                 # UI基本コンポーネント
│   └── gamification/       # ゲーミフィケーション
├── lib/                    # ユーティリティ・データ
├── hooks/                  # カスタムフック
├── contexts/               # React Context
├── types/                  # TypeScript型定義
└── public/                 # 静的ファイル
```

## 🎯 今後の予定機能

- [ ] 実際のAI面接官（GPT-4統合）
- [ ] 企業データの自動更新
- [ ] ユーザー同士の情報共有機能
- [ ] 選考スケジュール管理
- [ ] メール/SMS通知
- [ ] データ分析・レポート機能

## 🤝 コントリビュート

プルリクエストやイシューはいつでも歓迎します。

1. プロジェクトをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 📞 サポート

質問や提案がありましたら、[Issues](https://github.com/your-username/ai-job-hunting-app/issues) でお知らせください。

## 🙏 謝辞

- [Next.js](https://nextjs.org/) - 素晴らしいReactフレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - 効率的なCSS設計
- [Heroicons](https://heroicons.com/) - 美しいアイコンセット

---

**Made with ❤️ for job seekers in Japan**
