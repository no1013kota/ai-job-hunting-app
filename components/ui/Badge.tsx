import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'achievement' | 'level' | 'streak' | 'new' | 'rare' | 'legendary';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  achievement: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-orange-300 badge-sparkle',
  level: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-300',
  streak: 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-red-300 streak-fire',
  new: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300 animate-pulse',
  rare: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-purple-300',
  legendary: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-black border-amber-300 animate-glow-pulse'
};

const badgeSizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  animated = false,
  className,
  onClick
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold border rounded-full',
        'transition-all duration-200 transform',
        badgeVariants[variant],
        badgeSizes[size],
        animated && 'hover:scale-110 cursor-pointer',
        onClick && 'hover:shadow-lg active:scale-95 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </span>
  );
}