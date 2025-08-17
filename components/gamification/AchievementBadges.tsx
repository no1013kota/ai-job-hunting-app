import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  maxDisplay?: number;
  className?: string;
  showProgress?: boolean;
}

const rarityConfig = {
  common: {
    variant: 'default' as const,
    bgColor: 'from-gray-400 to-gray-500',
    borderColor: 'border-gray-300'
  },
  rare: {
    variant: 'rare' as const,
    bgColor: 'from-blue-400 to-blue-500',
    borderColor: 'border-blue-300'
  },
  epic: {
    variant: 'achievement' as const,
    bgColor: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-300'
  },
  legendary: {
    variant: 'legendary' as const,
    bgColor: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-300'
  }
};

export function AchievementBadges({ 
  achievements, 
  maxDisplay = 6,
  className,
  showProgress = false 
}: AchievementBadgesProps) {
  const displayedAchievements = achievements.slice(0, maxDisplay);
  const remainingCount = Math.max(0, achievements.length - maxDisplay);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xl mr-2">🏆</span>
          <span className="font-bold text-gray-800">がんばった証</span>
        </div>
        {achievements.length > 0 && (
          <span className="text-sm text-gray-500">
            {achievements.filter(a => a.unlockedAt).length}/{achievements.length}
          </span>
        )}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-6 gap-3">
        {displayedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="group relative"
          >
            {/* Achievement Badge */}
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center shadow-lg',
              'transform transition-all duration-200 cursor-pointer',
              'group-hover:scale-110 group-hover:rotate-6',
              achievement.unlockedAt 
                ? `bg-gradient-to-br ${rarityConfig[achievement.rarity].bgColor} text-white`
                : 'bg-gray-200 text-gray-400 grayscale'
            )}>
              <span className="text-lg">
                {achievement.icon}
              </span>
              
              {/* Rarity glow effect */}
              {achievement.unlockedAt && achievement.rarity !== 'common' && (
                <div className={cn(
                  'absolute inset-0 rounded-full opacity-0 group-hover:opacity-100',
                  'transition-opacity duration-300 blur-md -z-10',
                  `bg-gradient-to-br ${rarityConfig[achievement.rarity].bgColor}`
                )} />
              )}

              {/* Progress indicator for locked achievements */}
              {!achievement.unlockedAt && achievement.progress && achievement.maxProgress && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {Math.round((achievement.progress / achievement.maxProgress) * 100)}
                  </span>
                </div>
              )}

              {/* New achievement indicator */}
              {achievement.unlockedAt && 
                new Date(achievement.unlockedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              <div className="bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg min-w-max">
                <div className="font-semibold">{achievement.name}</div>
                <div className="text-gray-300 text-xs">{achievement.description}</div>
                {achievement.unlockedAt ? (
                  <div className="text-green-300 text-xs mt-1">
                    🎉 もうもらえたよ
                  </div>
                ) : showProgress && achievement.progress && achievement.maxProgress ? (
                  <div className="text-blue-300 text-xs mt-1">
                    進み具合: {achievement.progress}/{achievement.maxProgress}
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs mt-1">
                    まだもらえてない
                  </div>
                )}
                
                {/* Rarity indicator */}
                <Badge 
                  variant={rarityConfig[achievement.rarity].variant}
                  size="sm"
                  className="mt-1 text-xs"
                >
                  {achievement.rarity.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        ))}

        {/* Show more indicator */}
        {remainingCount > 0 && (
          <div className="w-12 h-12 bg-gray-200 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-sm font-bold">
              +{remainingCount}
            </span>
          </div>
        )}

        {/* Empty slots for visual consistency */}
        {displayedAchievements.length < maxDisplay && (
          <>
            {Array.from({ length: maxDisplay - displayedAchievements.length - (remainingCount > 0 ? 1 : 0) })
              .map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="w-12 h-12 bg-gray-100 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center"
                >
                  <span className="text-gray-300 text-lg">?</span>
                </div>
              ))
            }
          </>
        )}
      </div>

      {/* Quick stats */}
      {achievements.length > 0 && (
        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
          <span>
            レア: {achievements.filter(a => a.rarity === 'rare' && a.unlockedAt).length}
          </span>
          <span>
            エピック: {achievements.filter(a => a.rarity === 'epic' && a.unlockedAt).length}
          </span>
          <span>
            レジェンダリー: {achievements.filter(a => a.rarity === 'legendary' && a.unlockedAt).length}
          </span>
        </div>
      )}
    </div>
  );
}