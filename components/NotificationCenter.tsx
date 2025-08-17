'use client';

import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/Button';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const {
    notifications,
    reminders,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    completeReminder,
    deleteReminder
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'notifications' | 'reminders'>('notifications');

  if (!isOpen) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
      case 'interview_reminder':
      case 'practice_reminder':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'application_deadline':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const upcomingReminders = reminders
    .filter(r => !r.isCompleted && new Date(r.scheduledDateTime) > new Date())
    .sort((a, b) => new Date(a.scheduledDateTime).getTime() - new Date(b.scheduledDateTime).getTime());

  const completedReminders = reminders
    .filter(r => r.isCompleted)
    .sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())
    .slice(0, 10);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-6 w-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">通知センター</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            通知 ({notifications.filter(n => !n.isRead).length})
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'reminders'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            リマインダー ({upcomingReminders.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BellIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>通知はありません</p>
                </div>
              ) : (
                <>
                  {/* Actions */}
                  {notifications.some(n => !n.isRead) && (
                    <div className="flex justify-end mb-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        すべて既読にする
                      </Button>
                    </div>
                  )}

                  {/* Notifications List */}
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-l-4 p-4 rounded-r-lg transition-all cursor-pointer hover:bg-gray-50 ${
                        getPriorityColor(notification.priority)
                      } ${notification.isRead ? 'opacity-75' : ''}`}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <h3 className={`font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                              {notification.title}
                            </h3>
                            <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatDateTime(notification.createdAt)}
                              </span>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="space-y-6">
              {/* Upcoming Reminders */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">予定のリマインダー</h3>
                {upcomingReminders.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <ClockIcon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p>予定のリマインダーはありません</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-blue-600 font-medium">
                                {formatDateTime(reminder.scheduledDateTime)}
                              </span>
                              {reminder.repeatType !== 'none' && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {reminder.repeatType === 'daily' && '毎日'}
                                  {reminder.repeatType === 'weekly' && '毎週'}
                                  {reminder.repeatType === 'monthly' && '毎月'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => completeReminder(reminder.id)}
                              className="text-xs"
                            >
                              <CheckIcon className="h-3 w-3" />
                            </Button>
                            <button
                              onClick={() => deleteReminder(reminder.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Reminders */}
              {completedReminders.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">完了済み（最近10件）</h3>
                  <div className="space-y-2">
                    {completedReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="bg-green-50 border border-green-200 rounded-lg p-3 opacity-75"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckIcon className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">{reminder.title}</span>
                          </div>
                          <span className="text-xs text-green-600">
                            {reminder.completedAt && formatDateTime(reminder.completedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
}