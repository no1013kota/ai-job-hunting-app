'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { getStorage, isStorageSupported } from '@/lib/storage';
import type { UserProfile, NotificationSettings } from '@/lib/profile';
import {
  CogIcon,
  BellIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AppSettings {
  userId: string;
  notifications: NotificationSettings;
  privacy: {
    profileVisibility: 'public' | 'private' | 'recruiters-only';
    allowDataAnalytics: boolean;
    allowMarketingEmails: boolean;
  };
  data: {
    autoSave: boolean;
    backupFrequency: 'never' | 'daily' | 'weekly' | 'monthly';
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: 'ja' | 'en';
  };
  updatedAt: string;
}

function SettingsPage() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user || !isStorageSupported()) {
        setIsLoading(false);
        return;
      }

      try {
        const storage = getStorage();
        let savedSettings = await storage.getSetting(`settings_${user.id}`) as AppSettings | null;
        
        if (!savedSettings) {
          // デフォルト設定を作成
          savedSettings = {
            userId: user.id,
            notifications: {
              emailNotifications: true,
              pushNotifications: true,
              interviewReminders: true,
              applicationDeadlines: true,
              newOpportunities: false,
              weeklyReports: false
            },
            privacy: {
              profileVisibility: 'private',
              allowDataAnalytics: true,
              allowMarketingEmails: false
            },
            data: {
              autoSave: true,
              backupFrequency: 'weekly'
            },
            appearance: {
              theme: 'light',
              language: 'ja'
            },
            updatedAt: new Date().toISOString()
          };
          await storage.setSetting(`settings_${user.id}`, savedSettings);
        }
        
        setSettings(savedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
      
      setIsLoading(false);
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user || !isStorageSupported() || !settings) return;

    setIsSaving(true);
    
    try {
      const updatedSettings = {
        ...settings,
        updatedAt: new Date().toISOString()
      };

      const storage = getStorage();
      await storage.setSetting(`settings_${user.id}`, updatedSettings);
      
      setSettings(updatedSettings);
      toast.success('設定を保存しました');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDataExport = async () => {
    if (!user || !isStorageSupported()) return;

    try {
      const storage = getStorage();
      const profile = await storage.getSetting(`profile_${user.id}`);
      const interviews = await storage.getInterviews(user.id);
      const assessment = await storage.getSetting(`assessment_${user.id}`);
      
      const exportData = {
        profile,
        interviews,
        assessment,
        settings,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-job-hunting-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('データをエクスポートしました');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('エクスポートに失敗しました');
    }
  };

  const handleDataDelete = async () => {
    if (!user || !isStorageSupported()) return;

    try {
      const storage = getStorage();
      await storage.clearAllData();
      logout();
      toast.success('全てのデータを削除しました');
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error('削除に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">設定を読み込み中...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!settings) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <CogIcon className="h-16 w-16 text-gray-400 mx-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">設定の読み込みに失敗しました</h1>
              <p className="text-gray-600">ページを再読み込みしてください</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CogIcon className="h-12 w-12 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">設定</h1>
                <p className="text-gray-600">アプリケーションの設定を管理します</p>
              </div>
            </div>
            <Button onClick={handleSave} loading={isSaving}>
              設定を保存
            </Button>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BellIcon className="h-5 w-5 mr-2" />
              通知設定
            </h2>
            
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => {
                const labels: Record<string, string> = {
                  emailNotifications: 'メール通知',
                  pushNotifications: 'プッシュ通知',
                  interviewReminders: '面接リマインダー',
                  applicationDeadlines: '応募締切通知',
                  newOpportunities: '新着求人情報',
                  weeklyReports: '週間レポート'
                };
                
                return (
                  <label key={key} className="flex items-center justify-between">
                    <span className="text-gray-900">{labels[key]}</span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSettings(prev => ({
                        ...prev!,
                        notifications: {
                          ...prev!.notifications,
                          [key]: e.target.checked
                        }
                      }))}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              プライバシー設定
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">プロフィール公開設定</label>
                <select
                  value={settings.privacy.profileVisibility}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    privacy: {
                      ...prev!.privacy,
                      profileVisibility: e.target.value as any
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="private">非公開（自分のみ）</option>
                  <option value="recruiters-only">人事担当者のみ</option>
                  <option value="public">公開</option>
                </select>
              </div>

              <label className="flex items-center justify-between">
                <div>
                  <span className="text-gray-900">データ分析への協力</span>
                  <p className="text-sm text-gray-600">匿名化されたデータを使ってサービス改善に協力します</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.allowDataAnalytics}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    privacy: {
                      ...prev!.privacy,
                      allowDataAnalytics: e.target.checked
                    }
                  }))}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <span className="text-gray-900">マーケティングメール</span>
                  <p className="text-sm text-gray-600">就活に関する有益な情報をメールでお届けします</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.privacy.allowMarketingEmails}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    privacy: {
                      ...prev!.privacy,
                      allowMarketingEmails: e.target.checked
                    }
                  }))}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </label>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">データ管理</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">自動保存</label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.data.autoSave}
                    onChange={(e) => setSettings(prev => ({
                      ...prev!,
                      data: {
                        ...prev!.data,
                        autoSave: e.target.checked
                      }
                    }))}
                    className="form-checkbox h-4 w-4 text-blue-600 mr-2"
                  />
                  <span className="text-gray-900">変更を自動的に保存する</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">バックアップ頻度</label>
                <select
                  value={settings.data.backupFrequency}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    data: {
                      ...prev!.data,
                      backupFrequency: e.target.value as any
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="never">バックアップしない</option>
                  <option value="daily">毎日</option>
                  <option value="weekly">毎週</option>
                  <option value="monthly">毎月</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={handleDataExport}
                  className="flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>データをエクスポート</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">表示設定</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">テーマ</label>
                <select
                  value={settings.appearance.theme}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    appearance: {
                      ...prev!.appearance,
                      theme: e.target.value as any
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">ライト</option>
                  <option value="dark">ダーク</option>
                  <option value="system">システム設定に従う</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">言語</label>
                <select
                  value={settings.appearance.language}
                  onChange={(e) => setSettings(prev => ({
                    ...prev!,
                    appearance: {
                      ...prev!.appearance,
                      language: e.target.value as any
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-6">危険な操作</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-900">全データ削除</h3>
                  <p className="text-sm text-red-700">
                    プロフィール、面接記録、診断結果など全てのデータが削除されます。この操作は取り消せません。
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>削除</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">データ削除の確認</h3>
                <p className="text-gray-700 mb-6">
                  本当に全てのデータを削除しますか？この操作は取り消すことができません。
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDataDelete}
                    className="flex-1"
                  >
                    削除する
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default SettingsPage;