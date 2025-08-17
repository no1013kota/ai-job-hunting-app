import { cn } from '@/lib/utils';

interface LevelCardProps {
  level: number;
  xp: number;
  xpToNext: number;
  title: string;
  className?: string;
}

export function LevelCard({ level, xp, xpToNext, title, className }: LevelCardProps) {
  const progress = (xp / xpToNext) * 100;

  return (
    <div className={cn(
      'bg-gradient-level rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden level-card',
      'transform transition-all duration-300 hover:scale-105',
      className
    )}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-3">
              <span className="text-2xl">⭐</span>
            </div>
            <div>
              <div className="text-2xl font-bold">レベル {level}</div>
              <div className="text-yellow-100 text-sm opacity-90">{title}</div>
            </div>
          </div>
          
          {/* Level achievement indicator */}
          <div className="text-right">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg">🏆</span>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-yellow-100">経験値</span>
            <span className="text-sm text-yellow-100 font-medium">
              {xp.toLocaleString()}/{xpToNext.toLocaleString()} XP
            </span>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-1000 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
          
          <div className="text-xs text-yellow-100 opacity-75">
            次のレベルまであと {(xpToNext - xp).toLocaleString()} ポイント
          </div>
        </div>

        {/* Next level preview */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-yellow-100">次のレベルでもらえるもの</span>
            <div className="flex space-x-1">
              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs">🎁</span>
              </div>
              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}