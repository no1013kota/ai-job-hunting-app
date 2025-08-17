'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/Button';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  VideoCameraIcon, 
  ChartBarIcon, 
  UserIcon,
  DocumentTextIcon,
  BellIcon,
  CogIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationCenter } from '@/components/NotificationCenter';

interface LayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const Layout = ({ children, showBottomNav = true }: LayoutProps) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const navigationItems = [
    { name: 'ホーム', href: '/', icon: HomeIcon, color: 'text-blue-600', gradient: 'from-blue-500 to-purple-600' },
    { name: '面接練習', href: '/interview', icon: VideoCameraIcon, color: 'text-red-600', gradient: 'from-red-500 to-pink-600' },
    { name: '企業検索', href: '/companies', icon: BuildingOfficeIcon, color: 'text-indigo-600', gradient: 'from-indigo-500 to-blue-600' },
    { name: '適性診断', href: '/assessment', icon: ChartBarIcon, color: 'text-green-600', gradient: 'from-green-500 to-emerald-600' },
    { name: 'ES支援', href: '/es-support', icon: DocumentTextIcon, color: 'text-purple-600', gradient: 'from-purple-500 to-indigo-600' },
    { name: 'プロフィール', href: '/profile', icon: UserIcon, color: 'text-teal-600', gradient: 'from-teal-500 to-cyan-600' },
  ];

  const headerActionItems = [
    { name: '設定', href: '/settings', icon: CogIcon, color: 'text-gray-600' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="glass-effect shadow-xl border-b border-white/20 sticky top-0 z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">🤖</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent hidden sm:block">
                  AI就活アシスタント
                </span>
                <span className="text-xs text-gray-500 hidden sm:block">
                  あなたの就活を全力サポート
                </span>
                <span className="font-bold text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent sm:hidden">
                  AI就活
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-2">
                {navigationItems.map(item => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative group ${
                        isActive
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                      }`}
                    >
                      <span className={`${isActive ? 'text-white' : ''}`}>{item.name}</span>
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl animate-pulse-slow" />
                      )}
                    </Link>
                  );
                })}
                
                {/* Header Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {/* Notification Button */}
                  <button
                    onClick={() => setIsNotificationOpen(true)}
                    className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/80 transition-all duration-300"
                  >
                    <BellIcon className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Settings Link */}
                  <Link
                    href="/settings"
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      pathname === '/settings'
                        ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                    }`}
                  >
                    <CogIcon className="h-5 w-5" />
                  </Link>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl font-medium transition-all duration-300"
                >
                  ログアウト
                </Button>
              </nav>
            )}

            {/* Mobile Actions */}
            {isAuthenticated && (
              <div className="flex items-center space-x-2 md:hidden">
                {/* Mobile Notification Button */}
                <button
                  onClick={() => setIsNotificationOpen(true)}
                  className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/80 transition-all duration-300"
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          {isAuthenticated && isMenuOpen && (
            <nav className="md:hidden pb-4 animate-slide-up">
              <div className="space-y-2 bg-white/50 backdrop-blur-lg rounded-2xl p-4 m-2 border border-white/20">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                          : 'text-gray-700 hover:bg-white/80 hover:shadow-md'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
                
                {/* Mobile Settings Link */}
                <Link
                  href="/settings"
                  className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    pathname === '/settings'
                      ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/80 hover:shadow-md'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <CogIcon className="h-5 w-5 mr-3" />
                  設定
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 hover:shadow-md transition-all duration-300"
                >
                  <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  ログアウト
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
        <div className="min-h-[calc(100vh-12rem)]">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      {showBottomNav && isAuthenticated && (
        <nav className="md:hidden glass-effect border-t border-white/20 safe-area-pb sticky bottom-0">
          <div className={`grid h-16 ${navigationItems.length === 6 ? 'grid-cols-6' : navigationItems.length === 5 ? 'grid-cols-5' : navigationItems.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-center transition-all duration-300 relative group ${
                    isActive ? item.color : 'text-gray-500'
                  }`}
                >
                  <div className="text-center relative">
                    {isActive && (
                      <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r ${item.gradient} rounded-full`} />
                    )}
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : 'group-hover:bg-white/10'
                    }`}>
                      <Icon className={`h-5 w-5 mx-auto mb-1 transition-transform duration-300 ${
                        isActive ? 'scale-110' : 'group-hover:scale-105'
                      }`} />
                    </div>
                    <div className={`text-xs font-medium transition-all duration-300 ${
                      isActive ? 'text-gray-800' : 'text-gray-600'
                    }`}>
                      {item.name}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </div>
  );
};