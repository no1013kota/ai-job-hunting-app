'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.email && formData.password.length >= 6) {
        await login(formData.email, formData.password);
        toast.success('ログインしました');
        router.push('/');
      } else {
        toast.error('メールアドレスとパスワードを正しく入力してください');
      }
    } catch {
      toast.error('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ログイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            アカウントをお持ちでない方は{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              新規登録
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="メールアドレス"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="example@email.com"
            />
            
            <Input
              label="パスワード"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="パスワード（6文字以上）"
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              size="lg"
            >
              ログイン
            </Button>
          </div>

          <div className="text-center">
            <Link href="/auth/register" className="text-sm text-blue-600 hover:text-blue-500">
              アカウントをお持ちでない方はこちら
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}