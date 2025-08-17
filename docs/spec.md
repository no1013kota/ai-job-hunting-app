# Phase 1 開発仕様書 - PWA基盤構築

## 📋 プロジェクト概要

**目標**: MVP版PWAアプリケーションの完成とベータテスト  
**技術スタック**: React + Next.js + PWA + TypeScript

---

## 🎯 Phase 1 対象機能

### ✅ 実装対象
1. **ユーザー認証・登録**
2. **基本プロフィール管理**  
3. **AI面接練習機能（簡易版）**
4. **適性診断機能**
5. **内定力スコア表示**
6. **PWA機能（オフライン基本対応）**
7. **レスポンシブUI/UX**

### ❌ Phase 1 対象外
- Capacitorネイティブ機能
- 高度なAI分析機能
- 企業推薦システム
- カレンダー連携
- プッシュ通知
- 決済機能

---

## 🛠️ 開発環境セットアップ

### 1. 必要なツール

```bash
# Node.js (推奨: v18.17.0 以上)
node --version

# Package Manager
npm --version
# または
yarn --version

# Git
git --version

# エディタ (推奨: VS Code)
code --version
```

### 2. プロジェクト初期化

```bash
# 1. プロジェクト作成
npx create-next-app@latest ai-job-hunting-pwa --typescript --tailwind --eslint
cd ai-job-hunting-pwa

# 2. 追加パッケージのインストール
npm install @types/react @types/node
npm install next-pwa workbox-webpack-plugin
npm install @headlessui/react @heroicons/react
npm install framer-motion
npm install axios swr
npm install react-hook-form @hookform/resolvers
npm install zod
npm install js-cookie @types/js-cookie
npm install idb
npm install react-hot-toast

# 3. 開発用パッケージ
npm install -D @types/jest jest jest-environment-jsdom
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D prettier eslint-config-prettier
npm install -D @playwright/test

# 4. 開発サーバー起動確認
npm run dev
```

### 3. プロジェクト構成

```
ai-job-hunting-pwa/
├── public/
│   ├── icons/              # PWAアイコン
│   ├── manifest.json       # Web App Manifest
│   └── sw.js              # Service Worker
├── src/
│   ├── components/        # UIコンポーネント
│   │   ├── ui/           # 基本UIコンポーネント
│   │   ├── auth/         # 認証関連
│   │   ├── interview/    # 面接機能
│   │   └── layout/       # レイアウト
│   ├── pages/            # Next.js pages
│   │   ├── api/          # API routes
│   │   ├── auth/         # 認証ページ
│   │   ├── interview/    # 面接ページ
│   │   └── profile/      # プロフィールページ
│   ├── lib/              # ユーティリティ
│   │   ├── db.ts         # IndexedDB操作
│   │   ├── api.ts        # API client
│   │   └── utils.ts      # 共通関数
│   ├── hooks/            # カスタムHooks
│   ├── types/            # TypeScript型定義
│   └── store/            # 状態管理
├── tests/                # テスト
└── docs/                 # ドキュメント
```

---

## 📱 PWA設定

### 1. next.config.js

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:js|css|woff2?)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: ({ url }) => {
        const isSameOrigin = self.origin === url.origin;
        if (!isSameOrigin) return false;
        const pathname = url.pathname;
        if (pathname.startsWith('/api/')) return false;
        return true;
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [375, 414, 768, 1024, 1280]
  }
};

module.exports = withPWA(nextConfig);
```

### 2. Web App Manifest（public/manifest.json）

```json
{
  "name": "AI就活アシスタント",
  "short_name": "AI就活",
  "description": "AIを活用した就職活動支援アプリ",
  "theme_color": "#1e40af",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/narrow.png",
      "type": "image/png",
      "sizes": "375x667",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/wide.png", 
      "type": "image/png",
      "sizes": "1024x768",
      "form_factor": "wide"
    }
  ]
}
```

---

## 🎨 UI/UXコンポーネント設計

### 1. 基本UIコンポーネント

```typescript
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-blue-600'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        xl: 'h-12 px-6 rounded-lg text-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export { Button, buttonVariants };
```

```typescript
// src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
export { Input };
```

### 2. レイアウトコンポーネント

```typescript
// src/components/layout/Layout.tsx
import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';

interface LayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const Layout = ({ children, showBottomNav = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-md">
        {children}
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};
```

```typescript
// src/components/layout/Header.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-lg hidden sm:block">
              AI就活アシスタント
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/interview"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                router.pathname.startsWith('/interview')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              面接練習
            </Link>
            <Link
              href="/assessment"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                router.pathname.startsWith('/assessment')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              適性診断
            </Link>
            <Link
              href="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                router.pathname.startsWith('/profile')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              プロフィール
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4">
            <div className="space-y-2">
              <Link
                href="/interview"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                面接練習
              </Link>
              <Link
                href="/assessment"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                適性診断
              </Link>
              <Link
                href="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                プロフィール
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
```

---

## 🗄️ データ管理

### 1. IndexedDB セットアップ

```typescript
// src/lib/db.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface AppDB extends DBSchema {
  users: {
    key: string;
    value: {
      id: string;
      email: string;
      profile: UserProfile;
      createdAt: string;
      updatedAt: string;
    };
  };
  videos: {
    key: string;
    value: {
      id: string;
      userId: string;
      blob: Blob;
      metadata: {
        duration: number;
        size: number;
        quality: string;
        recordedAt: string;
      };
      uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
      syncedAt?: string;
    };
    indexes: { 'by-status': string; 'by-date': string };
  };
  assessments: {
    key: string;
    value: {
      id: string;
      userId: string;
      responses: Record<string, any>;
      results: AssessmentResult;
      completedAt: string;
    };
    indexes: { 'by-user': string };
  };
}

class DatabaseManager {
  private db: IDBPDatabase<AppDB> | null = null;

  async init(): Promise<IDBPDatabase<AppDB>> {
    if (this.db) return this.db;

    this.db = await openDB<AppDB>('AIJobHuntingApp', 1, {
      upgrade(db) {
        // Users store
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }

        // Videos store
        if (!db.objectStoreNames.contains('videos')) {
          const videoStore = db.createObjectStore('videos', { keyPath: 'id' });
          videoStore.createIndex('by-status', 'uploadStatus');
          videoStore.createIndex('by-date', 'metadata.recordedAt');
        }

        // Assessments store
        if (!db.objectStoreNames.contains('assessments')) {
          const assessmentStore = db.createObjectStore('assessments', {
            keyPath: 'id'
          });
          assessmentStore.createIndex('by-user', 'userId');
        }
      }
    });

    return this.db;
  }

  async saveVideo(videoData: AppDB['videos']['value']): Promise<void> {
    const db = await this.init();
    await db.add('videos', videoData);
  }

  async getPendingVideos(): Promise<AppDB['videos']['value'][]> {
    const db = await this.init();
    return db.getAllFromIndex('videos', 'by-status', 'pending');
  }

  async updateVideoStatus(
    id: string,
    status: AppDB['videos']['value']['uploadStatus']
  ): Promise<void> {
    const db = await this.init();
    const video = await db.get('videos', id);
    if (video) {
      video.uploadStatus = status;
      if (status === 'completed') {
        video.syncedAt = new Date().toISOString();
      }
      await db.put('videos', video);
    }
  }

  async saveAssessment(
    assessment: AppDB['assessments']['value']
  ): Promise<void> {
    const db = await this.init();
    await db.put('assessments', assessment);
  }

  async getUserAssessments(userId: string): Promise<AppDB['assessments']['value'][]> {
    const db = await this.init();
    return db.getAllFromIndex('assessments', 'by-user', userId);
  }
}

export const dbManager = new DatabaseManager();
```

### 2. 型定義

```typescript
// src/types/index.ts
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  skills?: string[];
  experiences?: Experience[];
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  category: 'internship' | 'parttime' | 'volunteer' | 'project' | 'other';
  startDate: string;
  endDate?: string;
  skills: string[];
}

export interface VideoMetadata {
  duration: number; // seconds
  size: number; // bytes
  quality: '480p' | '720p';
  recordedAt: string;
  questionId?: string;
  questionText?: string;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  category: 'general' | 'technical' | 'behavioral';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // seconds
  tips?: string[];
}

export interface InterviewScore {
  overall: number; // 0-100
  breakdown: {
    content: number;
    structure: number;
    clarity: number;
    confidence: number;
  };
  feedback: string;
  improvements: string[];
  strengths: string[];
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'scale';
  options?: string[];
  category: 'personality' | 'skills' | 'interests';
}

export interface AssessmentResult {
  scores: {
    action: number; // 行動力
    thinking: number; // 思考力
    people: number; // 人への関心
    things: number; // モノへの関心
    systems: number; // 仕組みへの関心
  };
  recommendedJobs: string[];
  summary: string;
}

export interface InternalScore {
  score: number; // 0-100
  breakdown: {
    interview: number;
    assessment: number;
    profile: number;
  };
  rank: 'beginner' | 'intermediate' | 'advanced';
  nextMilestone: number;
  improvementTasks: string[];
}
```

### 3. API Client

```typescript
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me')
};

// Video API
export const videoAPI = {
  upload: (file: Blob, metadata: VideoMetadata) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('metadata', JSON.stringify(metadata));
    return api.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getScore: (videoId: string) => api.get(`/videos/${videoId}/score`)
};

// Assessment API
export const assessmentAPI = {
  getQuestions: () => api.get('/assessments/questions'),
  submit: (responses: Record<string, any>) =>
    api.post('/assessments/submit', { responses }),
  getResult: (assessmentId: string) =>
    api.get(`/assessments/${assessmentId}/result`)
};

export default api;
```

---

## 📹 AI面接機能実装

### 1. 動画録画コンポーネント

```typescript
// src/components/interview/VideoRecorder.tsx
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { PlayIcon, StopIcon, VideoCameraIcon } from '@heroicons/react/24/solid';

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob, metadata: VideoMetadata) => void;
  maxDuration?: number; // seconds
}

export const VideoRecorder = ({ 
  onRecordingComplete, 
  maxDuration = 180 
}: VideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 24, max: 30 }
        },
        audio: {
          sampleRate: 44100,
          channelCount: 1
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (error) {
      console.error('Permission denied:', error);
      setHasPermission(false);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 1000000 // 1Mbps
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const metadata: VideoMetadata = {
        duration: recordingTime,
        size: blob.size,
        quality: '720p',
        recordedAt: new Date().toISOString()
      };
      onRecordingComplete(blob, metadata);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000); // Collect data every second
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer
    intervalRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        const newTime = prev + 1;
        if (newTime >= maxDuration) {
          stopRecording();
          return maxDuration;
        }
        return newTime;
      });
    }, 1000);
  }, [recordingTime, maxDuration, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  }, [isRecording, isPaused]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === null) {
    return (
      <div className="text-center py-8">
        <VideoCameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">
          カメラとマイクへのアクセスが必要です
        </p>
        <Button onClick={requestPermission}>
          許可を取得
        </Button>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          カメラまたはマイクへのアクセスが拒否されました
        </div>
        <Button onClick={requestPermission}>
          再試行
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Preview */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white font-mono text-sm">
              REC {formatTime(recordingTime)}
            </span>
          </div>
        )}

        {/* Time Limit Warning */}
        {recordingTime > maxDuration - 30 && isRecording && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-sm">
            残り{formatTime(maxDuration - recordingTime)}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            size="lg"
            className="flex items-center space-x-2"
          >
            <PlayIcon className="h-5 w-5" />
            <span>録画開始</span>
          </Button>
        ) : (
          <>
            <Button
              onClick={pauseRecording}
              variant="secondary"
              size="lg"
            >
              {isPaused ? '再開' : '一時停止'}
            </Button>
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="lg"
              className="flex items-center space-x-2"
            >
              <StopIcon className="h-5 w-5" />
              <span>停止</span>
            </Button>
          </>
        )}
      </div>

      {/* Recording Info */}
      <div className="text-center text-sm text-gray-600">
        録画時間上限: {formatTime(maxDuration)}
      </div>
    </div>
  );
};
```

### 2. 面接質問コンポーネント

```typescript
// src/components/interview/InterviewQuestion.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ClockIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface InterviewQuestionProps {
  question: InterviewQuestion;
  onNext: () => void;
  onSkip: () => void;
}

export const InterviewQuestion = ({ 
  question, 
  onNext, 
  onSkip 
}: InterviewQuestionProps) => {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 30) return 'text-red-600';
    if (timeLeft <= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
          {question.category} - {question.difficulty}
        </div>
        
        {/* Timer */}
        <div className={`flex items-center justify-center space-x-2 text-lg font-mono ${getTimeColor()}`}>
          <ClockIcon className="h-5 w-5" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Question Text */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 leading-relaxed">
          {question.text}
        </h2>
      </div>

      {/* Tips Section */}
      {question.tips && question.tips.length > 0 && (
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTips(!showTips)}
            className="flex items-center space-x-2 text-blue-600"
          >
            <LightBulbIcon className="h-4 w-4" />
            <span>回答のヒント</span>
          </Button>
          
          {showTips && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="space-y-2 text-sm text-blue-800">
                {question.tips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={onSkip}
          className="flex-1"
        >
          スキップ
        </Button>
        <Button
          onClick={onNext}
          className="flex-1"
          disabled={timeLeft === 0}
        >
          回答開始
        </Button>
      </div>
    </div>
  );
};
```

---

## 📊 適性診断機能

```typescript
// src/components/assessment/AssessmentForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { AssessmentQuestion } from '@/types';

interface AssessmentFormProps {
  questions: AssessmentQuestion[];
  onSubmit: (responses: Record<string, any>) => void;
}

export const AssessmentForm = ({ questions, onSubmit }: AssessmentFormProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const getCurrentQuestions = () => {
    const start = currentPage * questionsPerPage;
    const end = start + questionsPerPage;
    return questions.slice(start, end);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const onFormSubmit = (data: Record<string, any>) => {
    onSubmit(data);
  };

  const watchedValues = watch();
  const currentQuestions = getCurrentQuestions();
  
  // Check if current page is completed
  const isCurrentPageCompleted = currentQuestions.every(q => 
    watchedValues[q.id] !== undefined && watchedValues[q.id] !== ''
  );

  const renderQuestion = (question: AssessmentQuestion) => {
    switch (question.type) {
      case 'single':
        return (
          <div key={question.id} className="space-y-3">
            <h3 className="font-medium text-gray-900">{question.text}</h3>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    value={option}
                    {...register(question.id, { required: true })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {errors[question.id] && (
              <p className="text-red-600 text-sm">この質問にお答えください</p>
            )}
          </div>
        );

      case 'scale':
        return (
          <div key={question.id} className="space-y-3">
            <h3 className="font-medium text-gray-900">{question.text}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>全く当てはまらない</span>
                <span>非常に当てはまる</span>
              </div>
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5].map((value) => (
                  <label key={value} className="flex flex-col items-center space-y-2 cursor-pointer">
                    <input
                      type="radio"
                      value={value}
                      {...register(question.id, { required: true })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">{value}</span>
                  </label>
                ))}
              </div>
            </div>
            {errors[question.id] && (
              <p className="text-red-600 text-sm">この質問にお答えください</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>進捗</span>
          <span>{currentPage + 1} / {totalPages}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {currentQuestions.map(renderQuestion)}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentPage === 0}
        >
          前へ
        </Button>
        
        {currentPage === totalPages - 1 ? (
          <Button
            type="submit"
            disabled={!isCurrentPageCompleted}
          >
            診断を完了
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentPageCompleted}
          >
            次へ
          </Button>
        )}
      </div>
    </form>
  );
};
```

---

## 🧪 テスト設定

### 1. Jest設定

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './'
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};

module.exports = createJestConfig(customJestConfig);
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom';

// Mock MediaRecorder
global.MediaRecorder = class MockMediaRecorder {
  constructor() {
    this.state = 'inactive';
  }
  
  start() {
    this.state = 'recording';
  }
  
  stop() {
    this.state = 'inactive';
  }
  
  addEventListener() {}
};

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => []
    })
  }
});

// Mock IndexedDB
require('fake-indexeddb/auto');
```

### 2. コンポーネントテスト例

```typescript
// src/components/__tests__/VideoRecorder.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoRecorder } from '../interview/VideoRecorder';

describe('VideoRecorder', () => {
  const mockOnRecordingComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should request permission on mount', async () => {
    render(<VideoRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    expect(screen.getByText('カメラとマイクへのアクセスが必要です')).toBeInTheDocument();
    expect(screen.getByText('許可を取得')).toBeInTheDocument();
  });

  it('should show recording controls after permission granted', async () => {
    const mockGetUserMedia = jest.fn().mockResolvedValue({
      getTracks: () => []
    });
    
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: { getUserMedia: mockGetUserMedia }
    });

    render(<VideoRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    fireEvent.click(screen.getByText('許可を取得'));
    
    await waitFor(() => {
      expect(screen.getByText('録画開始')).toBeInTheDocument();
    });
  });

  it('should start and stop recording', async () => {
    // Setup mocks
    const mockGetUserMedia = jest.fn().mockResolvedValue({
      getTracks: () => []
    });
    
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: { getUserMedia: mockGetUserMedia }
    });

    render(<VideoRecorder onRecordingComplete={mockOnRecordingComplete} />);
    
    // Grant permission
    fireEvent.click(screen.getByText('許可を取得'));
    
    await waitFor(() => {
      expect(screen.getByText('録画開始')).toBeInTheDocument();
    });

    // Start recording
    fireEvent.click(screen.getByText('録画開始'));
    
    await waitFor(() => {
      expect(screen.getByText('停止')).toBeInTheDocument();
    });

    // Stop recording
    fireEvent.click(screen.getByText('停止'));
    
    await waitFor(() => {
      expect(mockOnRecordingComplete).toHaveBeenCalled();
    });
  });
});
```

---

## 📦 ビルド・デプロイ設定

### 1. package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "analyze": "ANALYZE=true npm run build",
    "build:analyze": "cross-env ANALYZE=true npm run build"
  }
}
```

### 2. GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: build-files
        path: |
          .next
          public
```

---

## 📋 Phase 1 開発チェックリスト

### Week 1-2: 環境構築
- [ ] プロジェクト初期化
- [ ] PWA設定完了
- [ ] 基本UIコンポーネント作成
- [ ] TypeScript設定
- [ ] テスト環境設定
- [ ] CI/CD パイプライン構築

### Week 3-4: 認証機能
- [ ] ユーザー登録・ログイン画面
- [ ] JWT認証実装
- [ ] プロフィール管理画面
- [ ] IndexedDB統合

### Week 5-8: 動画録画機能
- [ ] カメラ・マイク権限取得
- [ ] 動画録画コンポーネント
- [ ] 録画品質最適化
- [ ] ローカル保存機能

### Week 9-12: AI面接機能
- [ ] 面接質問管理
- [ ] 録画→アップロード→採点フロー
- [ ] フィードバック表示画面
- [ ] 採点結果保存

### Week 13-16: 適性診断
- [ ] 診断質問フォーム
- [ ] 回答データ処理
- [ ] 診断結果表示
- [ ] 結果データ永続化

### Week 17-20: スコア・ダッシュボード
- [ ] 内定力スコア計算
- [ ] 進捗ダッシュボード
- [ ] データ可視化
- [ ] 履歴表示機能

### Week 21-24: 最適化・テスト
- [ ] パフォーマンス最適化
- [ ] E2Eテスト作成
- [ ] ベータテスト実施
- [ ] バグ修正・改善

---

**Phase 1 完了条件**:
✅ PWAとして動作（オフライン基本対応）  
✅ 動画録画・アップロード機能完成  
✅ AI面接採点・フィードバック表示  
✅ 適性診断・結果表示  
✅ 内定力スコア計算・表示  
✅ レスポンシブUI完成  
✅ 50名でのベータテスト完了  

---

**文書バージョン**: 1.0 (Phase 1 開発用)  
**作成日**: 2025-08-17  
**対象期間**: 6ヶ月間  
**想定工数**: フロントエンド2名 + バックエンド1名 + デザイナー1名  
**次回レビュー**: 開発開始1ヶ月後