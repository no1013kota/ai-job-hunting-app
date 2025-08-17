'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getCompanyById } from '@/lib/companies';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyYenIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface CompanyDetailPageProps {
  params: Promise<{ id: string }>;
}

function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const company = getCompanyById(id);

  if (!company) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">企業が見つかりませんでした</h1>
            <p className="text-gray-600">指定された企業は存在しないか、削除された可能性があります。</p>
            <Link href="/companies">
              <Button>企業一覧に戻る</Button>
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const getAcceptanceRateColor = (rate: number) => {
    if (rate >= 20) return 'green';
    if (rate >= 10) return 'yellow';
    return 'red';
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'large': return '大企業（1000人以上）';
      case 'medium': return '中企業（300-1000人）';
      case 'small': return '小企業（300人未満）';
      default: return size;
    }
  };

  const getWorkLifeBalanceLabel = (score: number) => {
    if (score >= 4.5) return 'とても良い';
    if (score >= 4.0) return '良い';
    if (score >= 3.5) return '普通';
    if (score >= 3.0) return 'やや難しい';
    return '難しい';
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Link href="/companies">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ArrowLeftIcon className="h-4 w-4" />
                <span>企業一覧に戻る</span>
              </Button>
            </Link>
          </div>

          {/* Company Header */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="ghost" className="bg-white/20 text-white border-white/30">
                    {company.industry}
                  </Badge>
                  <Badge variant="ghost" className="bg-white/20 text-white border-white/30">
                    {getSizeLabel(company.size)}
                  </Badge>
                  <div className="flex items-center text-blue-100">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">{company.location}</span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">{company.establishedYear}年設立</span>
                  </div>
                </div>
                <p className="text-blue-100 leading-relaxed max-w-2xl">
                  {company.description}
                </p>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {company.acceptanceRate}%
                </div>
                <div className="text-blue-200 text-sm">内定率</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {company.employees.toLocaleString()}
                </div>
                <div className="text-blue-200 text-sm">従業員数</div>
              </div>

              {company.averageSalary && (
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {(company.averageSalary / 10000).toFixed(0)}万
                  </div>
                  <div className="text-blue-200 text-sm">平均年収</div>
                </div>
              )}

              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {company.workLifeBalance.toFixed(1)}
                </div>
                <div className="text-blue-200 text-sm">WLB評価</div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Selection Process */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                選考プロセス
              </h2>
              <div className="space-y-3">
                {company.selectionProcess.map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">選考データ</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">応募者数</span>
                    <span className="font-semibold">{company.applicationCount.toLocaleString()}人</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">内定者数</span>
                    <span className="font-semibold">{company.acceptedCount.toLocaleString()}人</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">内定率</span>
                    <span className={`font-bold ${getAcceptanceRateColor(company.acceptanceRate) === 'green' ? 'text-green-600' : getAcceptanceRateColor(company.acceptanceRate) === 'yellow' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {company.acceptanceRate}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <ProgressBar
                    progress={company.acceptanceRate}
                    maxValue={100}
                    color={getAcceptanceRateColor(company.acceptanceRate) as any}
                    size="sm"
                    showLabel={false}
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                応募要件
              </h2>
              <div className="space-y-3">
                {company.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Benefits and Work Environment */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Benefits */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <StarIcon className="h-5 w-5 mr-2 text-purple-600" />
                福利厚生・待遇
              </h2>
              <div className="space-y-3">
                {company.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <StarIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Life Balance */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-orange-600" />
                ワークライフバランス
              </h2>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">評価スコア</span>
                  <span className="font-bold text-lg">{company.workLifeBalance.toFixed(1)} / 5.0</span>
                </div>
                <ProgressBar
                  progress={company.workLifeBalance}
                  maxValue={5}
                  color="orange"
                  size="md"
                  showLabel={false}
                />
                <div className="mt-2 text-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {getWorkLifeBalanceLabel(company.workLifeBalance)}
                  </span>
                </div>
              </div>

              {company.averageSalary && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm text-orange-800 mb-1">年収情報</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {company.averageSalary.toLocaleString()}円
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    平均年収（推定）
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags and Links */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">企業タグ</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {company.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {company.website && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-gray-600">
                  <GlobeAltIcon className="h-5 w-5 mr-2" />
                  <span>公式サイト</span>
                </div>
                <Button
                  as="a"
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  variant="outline"
                >
                  サイトを見る →
                </Button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/interview/questions">
              <Button size="lg" className="w-full sm:w-auto">
                この企業向けの面接練習
              </Button>
            </Link>
            <Link href="/es-support">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                この企業向けのES作成
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default CompanyDetailPage;