'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute, useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { getStorage, isStorageSupported } from '@/lib/storage';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  createDefaultProfile,
  calculateProfileCompleteness,
  validateProfile,
  INDUSTRIES,
  JOB_POSITIONS,
  JOB_HUNTING_STATUS_LABELS,
  type UserProfile
} from '@/lib/profile';
import {
  UserIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CogIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function ProfilePage() {
  const { user } = useAuth();
  const { triggerAchievementNotification } = useNotifications();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !isStorageSupported()) {
        setIsLoading(false);
        return;
      }

      try {
        const storage = getStorage();
        let savedProfile = await storage.getSetting(`profile_${user.id}`) as UserProfile | null;
        
        if (!savedProfile) {
          // プロフィールが存在しない場合はデフォルトを作成
          savedProfile = createDefaultProfile(user.id, user.name, user.email);
          await storage.setSetting(`profile_${user.id}`, savedProfile);
        }
        
        setProfile(savedProfile);
        setEditForm(savedProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
      
      setIsLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user || !isStorageSupported() || !editForm) return;

    // バリデーション
    const validation = validateProfile(editForm);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setIsSaving(true);

    try {
      const updatedProfile: UserProfile = {
        ...editForm as UserProfile,
        updatedAt: new Date().toISOString()
      };

      const storage = getStorage();
      await storage.setSetting(`profile_${user.id}`, updatedProfile);
      
      // Check for profile completion achievement
      const newCompleteness = calculateProfileCompleteness(updatedProfile);
      const oldCompleteness = profile ? calculateProfileCompleteness(profile) : 0;
      
      if (newCompleteness === 100 && oldCompleteness < 100) {
        triggerAchievementNotification('profile_complete', {});
      }
      
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('プロフィールを保存しました');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile || {});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">プロフィールを読み込み中...</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">プロフィールの読み込みに失敗しました</h1>
              <p className="text-gray-600">ページを再読み込みしてください</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const completeness = calculateProfileCompleteness(profile);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <div className="glass-effect rounded-3xl p-8 border border-white/20 shadow-2xl bg-gradient-to-br from-blue-50/80 via-white/90 to-purple-50/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-2xl">
                      <UserIcon className="h-10 w-10 text-white" />
                    </div>
                    {completeness === 100 && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <TrophyIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                      プロフィール
                    </h1>
                    <p className="text-gray-600 text-lg mt-1">あなたの情報を管理します</p>
                    {profile && (
                      <div className="flex items-center space-x-2 mt-2">
                        <SparklesIcon className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-blue-600 font-medium">
                          {completeness === 100 ? '完璧なプロフィールです！' : 
                           completeness >= 80 ? '良好なプロフィールです' :
                           completeness >= 60 ? 'もう少しです' :
                           '基本情報を入力しましょう'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)} 
                      variant="gradient"
                      size="lg"
                      className="flex items-center space-x-2 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                      <PencilIcon className="h-5 w-5" />
                      <span>編集する</span>
                    </Button>
                  ) : (
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        size="lg"
                        className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                      >
                        キャンセル
                      </Button>
                      <Button 
                        onClick={handleSave} 
                        loading={isSaving}
                        variant="gradient"
                        size="lg"
                        className="shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                      >
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        保存する
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Completeness Card */}
          <div className="glass-effect rounded-2xl p-8 border border-white/20 shadow-xl bg-gradient-to-br from-white/80 to-blue-50/60 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <CheckCircleIcon className="h-6 w-6 mr-3 text-blue-600" />
                プロフィール完成度
              </h2>
              <div className="text-right">
                <div className={`text-4xl font-bold ${completeness >= 80 ? 'text-green-600' : completeness >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {completeness}%
                </div>
                {completeness === 100 && (
                  <div className="text-xs text-green-600 font-medium flex items-center justify-end mt-1">
                    <TrophyIcon className="h-3 w-3 mr-1" />
                    完璧！
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress Bar with Gradient */}
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden shadow-inner">
                <div 
                  className={`h-4 rounded-full transition-all duration-1000 ease-out ${
                    completeness >= 90 ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-green-600' :
                    completeness >= 80 ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-green-500' : 
                    completeness >= 60 ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500' : 
                    'bg-gradient-to-r from-red-400 via-pink-500 to-red-500'
                  } shadow-lg`}
                  style={{ width: `${completeness}%` }}
                >
                  <div className="h-full bg-gradient-to-r from-white/30 to-transparent rounded-full animate-pulse-slow"></div>
                </div>
              </div>
              
              {/* Progress Labels */}
              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            
            <div className={`text-center p-4 rounded-xl ${
              completeness >= 80 ? 'bg-green-100 border border-green-200' :
              completeness >= 60 ? 'bg-yellow-100 border border-yellow-200' :
              'bg-red-100 border border-red-200'
            }`}>
              <p className={`font-medium ${
                completeness >= 80 ? 'text-green-800' :
                completeness >= 60 ? 'text-yellow-800' :
                'text-red-800'
              }`}>
                {completeness === 100 ? '🎉 プロフィールが完璧に仕上がりました！' :
                 completeness >= 80 ? '✨ プロフィールがしっかり記入されています' :
                 completeness >= 60 ? '📝 もう少し情報を追加しましょう' :
                 '👋 基本情報を入力して始めましょう'}
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="glass-effect rounded-2xl p-8 border border-white/20 shadow-xl bg-gradient-to-br from-white/90 to-gray-50/80 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              基本情報
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">氏名 *</label>
                {isEditing ? (
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="氏名を入力"
                  />
                ) : (
                  <p className="text-gray-900">{profile.name || '未設定'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス *</label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="メールアドレスを入力"
                  />
                ) : (
                  <p className="text-gray-900">{profile.email || '未設定'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                {isEditing ? (
                  <Input
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="090-1234-5678"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone || '未設定'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">生年月日</label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editForm.birthDate || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, birthDate: e.target.value }))}
                  />
                ) : (
                  <p className="text-gray-900">
                    {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('ja-JP') : '未設定'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="glass-effect rounded-2xl p-8 border border-white/20 shadow-xl bg-gradient-to-br from-white/90 to-purple-50/60 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <AcademicCapIcon className="h-5 w-5 text-white" />
              </div>
              学歴情報
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">大学名 *</label>
                {isEditing ? (
                  <Input
                    value={editForm.university || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, university: e.target.value }))}
                    placeholder="○○大学"
                  />
                ) : (
                  <p className="text-gray-900">{profile.university || '未設定'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">学部 *</label>
                {isEditing ? (
                  <Input
                    value={editForm.faculty || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, faculty: e.target.value }))}
                    placeholder="○○学部"
                  />
                ) : (
                  <p className="text-gray-900">{profile.faculty || '未設定'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">学科・専攻</label>
                {isEditing ? (
                  <Input
                    value={editForm.department || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="○○学科・○○専攻"
                  />
                ) : (
                  <p className="text-gray-900">{profile.department || '未設定'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">卒業年度 *</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editForm.graduationYear || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, graduationYear: parseInt(e.target.value) }))}
                    placeholder="2025"
                    min="2020"
                    max="2030"
                  />
                ) : (
                  <p className="text-gray-900">{profile.graduationYear ? `${profile.graduationYear}年卒業予定` : '未設定'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GPA (4.0満点)</label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    value={editForm.gpa || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, gpa: parseFloat(e.target.value) }))}
                    placeholder="3.50"
                  />
                ) : (
                  <p className="text-gray-900">{profile.gpa ? `${profile.gpa.toFixed(2)}` : '未設定'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Career Information */}
          <div className="glass-effect rounded-2xl p-8 border border-white/20 shadow-xl bg-gradient-to-br from-white/90 to-green-50/60 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <BriefcaseIcon className="h-5 w-5 text-white" />
              </div>
              就活情報
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">就活ステータス</label>
                {isEditing ? (
                  <select
                    value={editForm.jobHuntingStatus || 'preparing'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, jobHuntingStatus: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(JOB_HUNTING_STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {JOB_HUNTING_STATUS_LABELS[profile.jobHuntingStatus] || '未設定'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">志望業界</label>
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {INDUSTRIES.map(industry => (
                      <label key={industry} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editForm.targetIndustries?.includes(industry) || false}
                          onChange={(e) => {
                            const current = editForm.targetIndustries || [];
                            if (e.target.checked) {
                              setEditForm(prev => ({ ...prev, targetIndustries: [...current, industry] }));
                            } else {
                              setEditForm(prev => ({ ...prev, targetIndustries: current.filter(i => i !== industry) }));
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="text-sm">{industry}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.targetIndustries?.length ? 
                      profile.targetIndustries.map(industry => (
                        <span key={industry} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {industry}
                        </span>
                      )) : 
                      <span className="text-gray-500">未設定</span>
                    }
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">希望職種</label>
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {JOB_POSITIONS.map(position => (
                      <label key={position} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editForm.targetPositions?.includes(position) || false}
                          onChange={(e) => {
                            const current = editForm.targetPositions || [];
                            if (e.target.checked) {
                              setEditForm(prev => ({ ...prev, targetPositions: [...current, position] }));
                            } else {
                              setEditForm(prev => ({ ...prev, targetPositions: current.filter(p => p !== position) }));
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="text-sm">{position}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.targetPositions?.length ? 
                      profile.targetPositions.map(position => (
                        <span key={position} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {position}
                        </span>
                      )) : 
                      <span className="text-gray-500">未設定</span>
                    }
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Self PR & Activities */}
          <div className="glass-effect rounded-2xl p-8 border border-white/20 shadow-xl bg-gradient-to-br from-white/90 to-yellow-50/60 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              自己PR・ガクチカ
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">自己PR</label>
                {isEditing ? (
                  <textarea
                    value={editForm.selfPR || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, selfPR: e.target.value }))}
                    placeholder="あなたの強みや特徴をアピールしてください"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-md p-3 min-h-[100px]">
                    <p className="text-gray-900 whitespace-pre-wrap">{profile.selfPR || '未設定'}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">学生時代に力を入れたこと（ガクチカ）</label>
                {isEditing ? (
                  <textarea
                    value={editForm.studentActivities || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, studentActivities: e.target.value }))}
                    placeholder="学生時代に最も力を入れて取り組んだことを具体的に記述してください"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-md p-3 min-h-[100px]">
                    <p className="text-gray-900 whitespace-pre-wrap">{profile.studentActivities || '未設定'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings Preview */}
          <div className="glass-effect rounded-2xl p-8 border border-white/20 shadow-xl bg-gradient-to-br from-white/90 to-indigo-50/60 animate-slide-up" style={{animationDelay: '0.5s'}}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                    <CogIcon className="h-5 w-5 text-white" />
                  </div>
                  設定
                </h2>
                <p className="text-gray-600 mt-2">
                  詳細な設定は設定ページで管理できます
                </p>
              </div>
              <Link href="/settings">
                <Button variant="gradient" size="lg" className="shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  設定ページへ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default ProfilePage;