'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProtectedRoute } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  companies, 
  searchCompanies, 
  industries, 
  companySizes,
  getTopAcceptanceRateCompanies,
  getTopSalaryCompanies 
} from '@/lib/companies';
import type { Company } from '@/lib/companies';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyYenIcon,
  ChartBarIcon,
  FunnelIcon,
  StarIcon
} from '@heroicons/react/24/outline';

function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'acceptanceRate' | 'salary'>('name');
  const [viewMode, setViewMode] = useState<'all' | 'topAcceptance' | 'topSalary'>('all');

  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies;

    // 検索フィルター
    if (searchQuery) {
      filtered = searchCompanies(searchQuery);
    }

    // 業界フィルター
    if (selectedIndustry) {
      filtered = filtered.filter(company => company.industry === selectedIndustry);
    }

    // 規模フィルター
    if (selectedSize) {
      filtered = filtered.filter(company => company.size === selectedSize);
    }

    // ソート
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'acceptanceRate':
          return b.acceptanceRate - a.acceptanceRate;
        case 'salary':
          return (b.averageSalary || 0) - (a.averageSalary || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchQuery, selectedIndustry, selectedSize, sortBy]);

  const displayCompanies = useMemo(() => {
    switch (viewMode) {
      case 'topAcceptance':
        return getTopAcceptanceRateCompanies(10);
      case 'topSalary':
        return getTopSalaryCompanies(10);
      default:
        return filteredAndSortedCompanies;
    }
  }, [viewMode, filteredAndSortedCompanies]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('');
    setSelectedSize('');
    setSortBy('name');
    setViewMode('all');
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">企業内定率検索</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              気になる企業の内定率や選考情報を検索できます。志望企業研究にお役立てください。
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-100 text-sm mb-1">登録企業数</div>
                  <div className="text-2xl font-bold">{companies.length}社</div>
                </div>
                <BuildingOfficeIcon className="h-8 w-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-100 text-sm mb-1">平均内定率</div>
                  <div className="text-2xl font-bold">
                    {(companies.reduce((acc, c) => acc + c.acceptanceRate, 0) / companies.length).toFixed(1)}%
                  </div>
                </div>
                <ChartBarIcon className="h-8 w-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-purple-100 text-sm mb-1">業界カバー数</div>
                  <div className="text-2xl font-bold">{industries.length}業界</div>
                </div>
                <UsersIcon className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={viewMode === 'all' ? 'default' : 'outline'}
              onClick={() => setViewMode('all')}
              size="sm"
            >
              全企業一覧
            </Button>
            <Button
              variant={viewMode === 'topAcceptance' ? 'default' : 'outline'}
              onClick={() => setViewMode('topAcceptance')}
              size="sm"
              className="flex items-center space-x-2"
            >
              <StarIcon className="h-4 w-4" />
              <span>内定率トップ10</span>
            </Button>
            <Button
              variant={viewMode === 'topSalary' ? 'default' : 'outline'}
              onClick={() => setViewMode('topSalary')}
              size="sm"
              className="flex items-center space-x-2"
            >
              <CurrencyYenIcon className="h-4 w-4" />
              <span>年収トップ10</span>
            </Button>
          </div>

          {/* Search and Filters */}
          {viewMode === 'all' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="企業名、業界、地域で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    業界で絞り込み
                  </label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">すべての業界</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    企業規模で絞り込み
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">すべての規模</option>
                    {companySizes.map(size => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    並び順
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">企業名順</option>
                    <option value="acceptanceRate">内定率が高い順</option>
                    <option value="salary">年収が高い順</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {(searchQuery || selectedIndustry || selectedSize || sortBy !== 'name') && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center space-x-2"
                  >
                    <FunnelIcon className="h-4 w-4" />
                    <span>フィルターをクリア</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {viewMode === 'topAcceptance' ? '内定率トップ10' :
                 viewMode === 'topSalary' ? '年収トップ10' :
                 `検索結果: ${displayCompanies.length}社`}
              </h2>
            </div>

            {displayCompanies.length === 0 ? (
              <div className="text-center py-12">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">条件に一致する企業が見つかりませんでした。</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {displayCompanies.map((company, index) => (
                  <CompanyCard key={company.id} company={company} rank={
                    viewMode !== 'all' ? index + 1 : undefined
                  } />
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function CompanyCard({ company, rank }: { company: Company; rank?: number }) {
  const getAcceptanceRateColor = (rate: number) => {
    if (rate >= 20) return 'text-green-600';
    if (rate >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'large': return '大企業';
      case 'medium': return '中企業';
      case 'small': return '小企業';
      default: return size;
    }
  };

  return (
    <Link href={`/companies/${company.id}`}>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {rank && (
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  rank === 1 ? 'bg-yellow-500 text-white' :
                  rank === 2 ? 'bg-gray-400 text-white' :
                  rank === 3 ? 'bg-amber-600 text-white' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {rank}
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="default" size="sm">
                {company.industry}
              </Badge>
              <Badge variant="outline" size="sm">
                {getSizeLabel(company.size)}
              </Badge>
              <Badge variant="outline" size="sm">
                {company.location}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {company.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getAcceptanceRateColor(company.acceptanceRate)}`}>
              {company.acceptanceRate}%
            </div>
            <div className="text-xs text-gray-500">内定率</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {company.applicationCount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">応募者数</div>
          </div>

          {company.averageSalary && (
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(company.averageSalary / 10000).toFixed(0)}万
              </div>
              <div className="text-xs text-gray-500">平均年収</div>
            </div>
          )}

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {company.workLifeBalance.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">WLB評価</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {company.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
          {company.tags.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{company.tags.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            従業員数: {company.employees.toLocaleString()}人
          </div>
          <Button size="sm" className="text-xs">
            詳細を見る →
          </Button>
        </div>
      </div>
    </Link>
  );
}

export default CompaniesPage;