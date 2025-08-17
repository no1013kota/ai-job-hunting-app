import { cn } from '@/lib/utils';

interface StreakCounterProps {
  streak: number;
  maxStreak?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakCounter({ 
  streak, 
  maxStreak, 
  className,
  size = 'md'
}: StreakCounterProps) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const containerSizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const getStreakEmoji = (count: number) => {
    if (count >= 30) return '🔥🔥🔥';
    if (count >= 14) return '🔥🔥';
    if (count >= 7) return '🔥';
    if (count >= 3) return '💪';
    if (count >= 1) return '✨';
    return '💤';
  };

  const getStreakMessage = (count: number) => {
    if (count >= 30) return 'すごい継続力！';
    if (count >= 14) return 'とてもいいペース！';
    if (count >= 7) return 'いい感じ！';
    if (count >= 3) return '順調です！';
    if (count >= 1) return 'スタート！';
    return '今日から始めよう';
  };

  const getStreakColor = (count: number) => {
    if (count >= 14) return 'from-red-500 to-orange-500';
    if (count >= 7) return 'from-orange-500 to-yellow-500';
    if (count >= 3) return 'from-yellow-500 to-amber-500';
    if (count >= 1) return 'from-green-500 to-emerald-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className={cn(
      'bg-gradient-to-br text-white rounded-2xl shadow-lg relative overflow-hidden',
      `bg-gradient-to-br ${getStreakColor(streak)}`,
      containerSizeClasses[size],
      'transform transition-all duration-300 hover:scale-105',
      streak >= 7 && 'animate-glow-pulse',
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className={cn('mr-2', sizeClasses[size])}>
              {getStreakEmoji(streak)}
            </span>
            <div>
              <div className={cn('font-bold', sizeClasses[size])}>
                {streak}日連続
              </div>
              <div className="text-xs opacity-80">
                {getStreakMessage(streak)}
              </div>
            </div>
          </div>
          
          {maxStreak && maxStreak > streak && (
            <div className="text-right">
              <div className="text-xs opacity-70">最高記録</div>
              <div className="text-sm font-semibold">{maxStreak}日</div>
            </div>
          )}
        </div>

        {/* Streak motivation */}
        {streak > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="text-xs opacity-80">
              {streak < 7 ? `あと${7 - streak}日で🔥をゲット！` :
               streak < 14 ? `あと${14 - streak}日で🔥🔥をゲット！` :
               streak < 30 ? `あと${30 - streak}日で🔥🔥🔥をゲット！` :
               'あなたは継続の達人です！🏆'}
            </div>
          </div>
        )}

        {/* Weekly streak indicator */}
        {size !== 'sm' && (
          <div className="mt-3 flex space-x-1">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <div
                key={day}
                className={cn(
                  'w-2 h-2 rounded-full',
                  day < (streak % 7) ? 'bg-white' : 'bg-white/30'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}