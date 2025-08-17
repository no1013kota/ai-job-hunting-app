// 通知・リマインダー機能

export interface Notification {
  id: string;
  userId: string;
  type: 'interview_reminder' | 'application_deadline' | 'practice_reminder' | 'weekly_report' | 'achievement';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  scheduledFor?: string; // リマインダーの場合の予定日時
  actionUrl?: string; // クリック時の遷移先
  priority: 'low' | 'medium' | 'high';
}

export interface Reminder {
  id: string;
  userId: string;
  type: 'interview_practice' | 'application_deadline' | 'weekly_goals' | 'skill_improvement';
  title: string;
  description: string;
  scheduledDateTime: string;
  isCompleted: boolean;
  repeatType?: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  completedAt?: string;
}

// 通知作成ヘルパー関数
export const createNotification = (
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  priority: Notification['priority'] = 'medium',
  actionUrl?: string
): Notification => {
  return {
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    title,
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
    actionUrl,
    priority
  };
};

// リマインダー作成ヘルパー関数
export const createReminder = (
  userId: string,
  type: Reminder['type'],
  title: string,
  description: string,
  scheduledDateTime: string,
  repeatType?: Reminder['repeatType']
): Reminder => {
  return {
    id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    title,
    description,
    scheduledDateTime,
    isCompleted: false,
    repeatType: repeatType || 'none',
    createdAt: new Date().toISOString()
  };
};

// 面接練習リマインダーの自動生成
export const generatePracticeReminders = (userId: string): Reminder[] => {
  const now = new Date();
  const reminders: Reminder[] = [];

  // 週3回の面接練習リマインダー（月、水、金の19時）
  const practiceWeek = ['月', '水', '金'];
  practiceWeek.forEach((day, index) => {
    const scheduledDate = new Date(now);
    scheduledDate.setDate(now.getDate() + (1 + index * 2)); // 翌日から2日おき
    scheduledDate.setHours(19, 0, 0, 0);

    reminders.push(createReminder(
      userId,
      'interview_practice',
      `${day}曜日の面接練習`,
      '今日は面接練習の日です。15分間の練習で就活スキルを向上させましょう。',
      scheduledDate.toISOString(),
      'weekly'
    ));
  });

  // 毎日の目標確認リマインダー（朝10時）
  const goalReminderDate = new Date(now);
  goalReminderDate.setDate(now.getDate() + 1);
  goalReminderDate.setHours(10, 0, 0, 0);

  reminders.push(createReminder(
    userId,
    'weekly_goals',
    '今日の就活目標を確認',
    '今日の就活活動を始める前に、目標を確認して効率的に進めましょう。',
    goalReminderDate.toISOString(),
    'daily'
  ));

  return reminders;
};

// 通知の種類別メッセージテンプレート
export const getNotificationTemplate = (
  type: Notification['type'],
  data?: Record<string, any>
): { title: string; message: string } => {
  const templates = {
    interview_reminder: {
      title: '面接練習のリマインダー',
      message: '今日は面接練習の予定日です。15分間の練習で自信をつけましょう！'
    },
    application_deadline: {
      title: '応募締切が近づいています',
      message: `${data?.companyName || '企業'}への応募締切が${data?.daysLeft || 'まもなく'}です。応募準備を確認してください。`
    },
    practice_reminder: {
      title: 'スキル向上の時間です',
      message: '継続的な練習が成功の鍵です。今日も少しずつ前進していきましょう。'
    },
    weekly_report: {
      title: '週間レポートが完成しました',
      message: `今週の活動レポートをご確認ください。面接練習${data?.practiceCount || 0}回、応募${data?.applicationCount || 0}件でした。`
    },
    achievement: {
      title: '素晴らしい成果です！🎉',
      message: data?.message || '新しい目標を達成しました。この調子で頑張りましょう！'
    }
  };

  return templates[type] || { title: '通知', message: 'お知らせがあります。' };
};

// 通知の優先度判定
export const determineNotificationPriority = (
  type: Notification['type'],
  data?: Record<string, any>
): Notification['priority'] => {
  switch (type) {
    case 'application_deadline':
      const daysLeft = data?.daysLeft || 0;
      if (daysLeft <= 1) return 'high';
      if (daysLeft <= 3) return 'medium';
      return 'low';
    
    case 'interview_reminder':
      return 'medium';
    
    case 'achievement':
      return 'high';
    
    case 'weekly_report':
      return 'low';
    
    default:
      return 'medium';
  }
};

// ブラウザ通知の表示
export const showBrowserNotification = async (notification: Notification): Promise<boolean> => {
  // ブラウザ通知の許可確認
  if (!('Notification' in window)) {
    console.log('このブラウザは通知をサポートしていません');
    return false;
  }

  let permission = Notification.permission;
  
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission === 'granted') {
    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192x192.png', // PWAのアイコンを使用
      badge: '/icon-192x192.png',
      tag: notification.id,
      requireInteraction: notification.priority === 'high',
      actions: notification.actionUrl ? [
        { action: 'view', title: '確認する', icon: '/icon-192x192.png' }
      ] : []
    });

    browserNotification.onclick = () => {
      window.focus();
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
      browserNotification.close();
    };

    // 自動的に閉じる（低優先度の場合）
    if (notification.priority === 'low') {
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }

    return true;
  } else {
    console.log('通知の許可が得られませんでした');
    return false;
  }
};

// 定期的な通知チェック（Service Workerなしのシンプル版）
export const scheduleNotificationCheck = (
  userId: string,
  onNotification: (notification: Notification) => void
) => {
  // 1分ごとにチェック
  setInterval(async () => {
    const now = new Date();
    
    // 面接練習のリマインダーチェック（毎日19時）
    if (now.getHours() === 19 && now.getMinutes() === 0) {
      const template = getNotificationTemplate('interview_reminder');
      const notification = createNotification(
        userId,
        'interview_reminder',
        template.title,
        template.message,
        'medium',
        '/interview/practice'
      );
      onNotification(notification);
    }

    // 週間レポートチェック（日曜日の10時）
    if (now.getDay() === 0 && now.getHours() === 10 && now.getMinutes() === 0) {
      const template = getNotificationTemplate('weekly_report', {
        practiceCount: Math.floor(Math.random() * 5) + 1,
        applicationCount: Math.floor(Math.random() * 3)
      });
      const notification = createNotification(
        userId,
        'weekly_report',
        template.title,
        template.message,
        'low',
        '/dashboard'
      );
      onNotification(notification);
    }
  }, 60000); // 1分間隔
};

// 成果通知の生成
export const generateAchievementNotification = (
  userId: string,
  achievementType: string,
  data: Record<string, any>
): Notification => {
  let message = '';
  
  switch (achievementType) {
    case 'first_interview':
      message = '初めての面接練習を完了しました！継続して力をつけていきましょう。';
      break;
    case 'practice_streak':
      message = `${data.days}日連続で面接練習を実施しました。素晴らしい継続力です！`;
      break;
    case 'high_score':
      message = `面接スコア${data.score}点を達成！過去最高記録です。`;
      break;
    case 'assessment_complete':
      message = 'AI適性診断を完了しました。結果を確認して今後の方針を立てましょう。';
      break;
    case 'profile_complete':
      message = 'プロフィールを100%完成させました。企業からの注目度が向上します。';
      break;
    default:
      message = '新しい目標を達成しました。この調子で頑張りましょう！';
  }

  const template = getNotificationTemplate('achievement', { message });
  return createNotification(
    userId,
    'achievement',
    template.title,
    template.message,
    'high'
  );
};