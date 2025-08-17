'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getStorage, isStorageSupported } from '@/lib/storage';
import {
  type Notification,
  type Reminder,
  createNotification,
  createReminder,
  generatePracticeReminders,
  getNotificationTemplate,
  determineNotificationPriority,
  showBrowserNotification,
  scheduleNotificationCheck,
  generateAchievementNotification
} from '@/lib/notifications';
import toast from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  reminders: Reminder[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  addReminder: (reminder: Reminder) => void;
  completeReminder: (reminderId: string) => void;
  deleteReminder: (reminderId: string) => void;
  initializePracticeReminders: () => void;
  triggerAchievementNotification: (type: string, data: Record<string, any>) => void;
  requestNotificationPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // 未読通知数を計算
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // データの読み込み
  useEffect(() => {
    const loadNotificationData = async () => {
      if (!user || !isStorageSupported()) return;

      try {
        const storage = getStorage();
        
        // 通知の読み込み
        const savedNotifications = await storage.getSetting(`notifications_${user.id}`) as Notification[] || [];
        setNotifications(savedNotifications);

        // リマインダーの読み込み
        const savedReminders = await storage.getSetting(`reminders_${user.id}`) as Reminder[] || [];
        setReminders(savedReminders);

        console.log('Notification data loaded');
      } catch (error) {
        console.error('Error loading notification data:', error);
      }
    };

    loadNotificationData();
  }, [user]);

  // データの保存
  const saveNotifications = async (newNotifications: Notification[]) => {
    if (!user || !isStorageSupported()) return;

    try {
      const storage = getStorage();
      await storage.setSetting(`notifications_${user.id}`, newNotifications);
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const saveReminders = async (newReminders: Reminder[]) => {
    if (!user || !isStorageSupported()) return;

    try {
      const storage = getStorage();
      await storage.setSetting(`reminders_${user.id}`, newReminders);
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  };

  // 通知の追加
  const addNotification = async (notification: Notification) => {
    const newNotifications = [notification, ...notifications];
    setNotifications(newNotifications);
    await saveNotifications(newNotifications);

    // ブラウザ通知を表示
    await showBrowserNotification(notification);

    // トースト通知を表示
    toast(notification.title, {
      icon: notification.priority === 'high' ? '🎉' : '📢',
      duration: notification.priority === 'high' ? 6000 : 4000
    });
  };

  // 通知を既読にする
  const markAsRead = async (notificationId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  // 全ての通知を既読にする
  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  // 通知を削除
  const deleteNotification = async (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  // リマインダーの追加
  const addReminder = async (reminder: Reminder) => {
    const newReminders = [reminder, ...reminders];
    setReminders(newReminders);
    await saveReminders(newReminders);

    // リマインダー追加の通知
    const notification = createNotification(
      user!.id,
      'practice_reminder',
      'リマインダーを追加しました',
      `${reminder.title} - ${new Date(reminder.scheduledDateTime).toLocaleString('ja-JP')}`,
      'low'
    );
    await addNotification(notification);
  };

  // リマインダーを完了する
  const completeReminder = async (reminderId: string) => {
    const updatedReminders = reminders.map(r =>
      r.id === reminderId ? { 
        ...r, 
        isCompleted: true, 
        completedAt: new Date().toISOString() 
      } : r
    );
    setReminders(updatedReminders);
    await saveReminders(updatedReminders);

    toast.success('リマインダーを完了しました！');
  };

  // リマインダーを削除
  const deleteReminder = async (reminderId: string) => {
    const updatedReminders = reminders.filter(r => r.id !== reminderId);
    setReminders(updatedReminders);
    await saveReminders(updatedReminders);
  };

  // 面接練習リマインダーの初期化
  const initializePracticeReminders = async () => {
    if (!user) return;

    const practiceReminders = generatePracticeReminders(user.id);
    const newReminders = [...reminders, ...practiceReminders];
    setReminders(newReminders);
    await saveReminders(newReminders);

    // 初期化完了の通知
    const notification = createNotification(
      user.id,
      'practice_reminder',
      '面接練習スケジュールを設定しました',
      '週3回の練習リマインダーを設定しました。継続して練習していきましょう！',
      'medium'
    );
    await addNotification(notification);
  };

  // 成果通知のトリガー
  const triggerAchievementNotification = async (type: string, data: Record<string, any>) => {
    if (!user) return;

    const notification = generateAchievementNotification(user.id, type, data);
    await addNotification(notification);
  };

  // ブラウザ通知許可の要求
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('このブラウザは通知をサポートしていません');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('通知を許可しました');
        return true;
      }
    }

    toast.error('通知の許可が必要です');
    return false;
  };

  // 定期的な通知チェックの開始
  useEffect(() => {
    if (!user) return;

    const cleanup = scheduleNotificationCheck(user.id, async (notification) => {
      await addNotification(notification);
    });

    // クリーンアップ（実際のクリーンアップは簡単な実装のため省略）
    return () => {};
  }, [user]);

  const value: NotificationContextType = {
    notifications,
    reminders,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addReminder,
    completeReminder,
    deleteReminder,
    initializePracticeReminders,
    triggerAchievementNotification,
    requestNotificationPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}