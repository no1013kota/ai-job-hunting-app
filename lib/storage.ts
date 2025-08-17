// IndexedDB utility for offline data storage

const DB_NAME = 'AIJobHuntingDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  INTERVIEWS: 'interviews',
  USERS: 'users',
  SETTINGS: 'settings'
} as const;

interface DBStores {
  [STORES.INTERVIEWS]: {
    id: string;
    userId: string;
    questionId: string;
    question: string;
    category: string;
    duration: number;
    timestamp: string;
    analysisResult?: {
      overallScore: number;
      categories: {
        clarity: { score: number; feedback: string };
        content: { score: number; feedback: string };
        confidence: { score: number; feedback: string };
        structure: { score: number; feedback: string };
      };
      strengths: string[];
      improvements: string[];
      nextSteps: string[];
    };
  };
  [STORES.USERS]: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    stats?: {
      totalInterviews: number;
      averageScore: number;
      bestScore: number;
      totalPracticeTime: number;
    };
  };
  [STORES.SETTINGS]: {
    key: string;
    value: unknown;
  };
}

class StorageManager {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create interviews store
        if (!db.objectStoreNames.contains(STORES.INTERVIEWS)) {
          const interviewStore = db.createObjectStore(STORES.INTERVIEWS, { keyPath: 'id' });
          interviewStore.createIndex('userId', 'userId', { unique: false });
          interviewStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create users store
        if (!db.objectStoreNames.contains(STORES.USERS)) {
          db.createObjectStore(STORES.USERS, { keyPath: 'id' });
        }

        // Create settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
      };
    });
  }

  async saveInterview(interview: DBStores[typeof STORES.INTERVIEWS]): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction([STORES.INTERVIEWS], 'readwrite');
    const store = transaction.objectStore(STORES.INTERVIEWS);
    await store.put(interview);
  }

  async getInterviews(userId: string): Promise<DBStores[typeof STORES.INTERVIEWS][]> {
    const db = await this.dbPromise;
    const transaction = db.transaction([STORES.INTERVIEWS], 'readonly');
    const store = transaction.objectStore(STORES.INTERVIEWS);
    const index = store.index('userId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const interviews = request.result.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        resolve(interviews);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getInterviewById(id: string): Promise<DBStores[typeof STORES.INTERVIEWS] | null> {
    const db = await this.dbPromise;
    const transaction = db.transaction([STORES.INTERVIEWS], 'readonly');
    const store = transaction.objectStore(STORES.INTERVIEWS);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUserStats(userId: string, stats: DBStores[typeof STORES.USERS]['stats']): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction([STORES.USERS], 'readwrite');
    const store = transaction.objectStore(STORES.USERS);
    
    // Get existing user data
    const user = await new Promise<DBStores[typeof STORES.USERS] | null>((resolve, reject) => {
      const request = store.get(userId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });

    if (user) {
      user.stats = stats;
      await store.put(user);
    }
  }

  async getUserStats(userId: string): Promise<DBStores[typeof STORES.USERS]['stats'] | null> {
    const db = await this.dbPromise;
    const transaction = db.transaction([STORES.USERS], 'readonly');
    const store = transaction.objectStore(STORES.USERS);
    
    return new Promise((resolve, reject) => {
      const request = store.get(userId);
      request.onsuccess = () => {
        const user = request.result;
        resolve(user ? user.stats || null : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveUser(user: DBStores[typeof STORES.USERS]): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction([STORES.USERS], 'readwrite');
    const store = transaction.objectStore(STORES.USERS);
    await store.put(user);
  }

  async getSetting(key: string): Promise<unknown> {
    const db = await this.dbPromise;
    const transaction = db.transaction([STORES.SETTINGS], 'readonly');
    const store = transaction.objectStore(STORES.SETTINGS);
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async setSetting(key: string, value: unknown): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction([STORES.SETTINGS], 'readwrite');
    const store = transaction.objectStore(STORES.SETTINGS);
    await store.put({ key, value });
  }

  async clearAllData(): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction([STORES.INTERVIEWS, STORES.USERS, STORES.SETTINGS], 'readwrite');
    
    await Promise.all([
      transaction.objectStore(STORES.INTERVIEWS).clear(),
      transaction.objectStore(STORES.USERS).clear(),
      transaction.objectStore(STORES.SETTINGS).clear()
    ]);
  }
}

// Export singleton instance (lazy initialization for SSR compatibility)
let storageInstance: StorageManager | null = null;
export const getStorage = (): StorageManager => {
  if (!storageInstance && typeof window !== 'undefined') {
    storageInstance = new StorageManager();
  }
  return storageInstance!;
};

export const storage = typeof window !== 'undefined' ? new StorageManager() : null as any;

// Export types for external use
export type InterviewRecord = DBStores[typeof STORES.INTERVIEWS];
export type UserRecord = DBStores[typeof STORES.USERS];
export type SettingRecord = DBStores[typeof STORES.SETTINGS];

// Helper functions for statistics calculation
export const calculateUserStats = (interviews: InterviewRecord[]) => {
  const completedInterviews = interviews.filter(i => i.analysisResult);
  
  if (completedInterviews.length === 0) {
    return {
      totalInterviews: interviews.length,
      averageScore: 0,
      bestScore: 0,
      totalPracticeTime: Math.round(interviews.reduce((acc, i) => acc + i.duration, 0) / 60)
    };
  }

  const scores = completedInterviews.map(i => i.analysisResult!.overallScore);
  const averageScore = Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length);
  const bestScore = Math.max(...scores);
  const totalPracticeTime = Math.round(interviews.reduce((acc, i) => acc + i.duration, 0) / 60);

  return {
    totalInterviews: interviews.length,
    averageScore,
    bestScore,
    totalPracticeTime
  };
};

// Utility to check IndexedDB support
export const isStorageSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'indexedDB' in window;
};