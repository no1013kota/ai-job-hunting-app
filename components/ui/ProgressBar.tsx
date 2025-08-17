import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  maxValue?: number;
  className?: string;
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'yellow' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-emerald-600',
  purple: 'from-purple-500 to-indigo-600',
  orange: 'from-orange-500 to-amber-600',
  yellow: 'from-yellow-400 to-amber-500',
  red: 'from-red-500 to-pink-600',
};

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export function ProgressBar({
  progress,
  maxValue = 100,
  className,
  animated = true,
  showLabel = false,
  label,
  color = 'blue',
  size = 'md'
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const percentage = Math.min((progress / maxValue) * 100, 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayProgress(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(percentage);
    }
  }, [percentage, animated]);

  return (
    <div className={cn('space-y-2', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'rounded-full transition-all duration-1000 ease-out bg-gradient-to-r',
            colorClasses[color],
            animated && 'transform-gpu'
          )}
          style={{ 
            width: `${displayProgress}%`,
            height: '100%'
          }}
        >
          {size === 'lg' && (
            <div className="h-full w-full bg-gradient-to-t from-white/20 to-transparent rounded-full" />
          )}
        </div>
      </div>
      
      {size === 'lg' && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>{progress}</span>
          <span>{maxValue}</span>
        </div>
      )}
    </div>
  );
}