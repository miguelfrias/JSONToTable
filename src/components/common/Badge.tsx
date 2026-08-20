import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'slate' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className,
}) => {
  const variantStyles = {
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    indigo: 'bg-indigo-950/60 text-indigo-300 border-indigo-700/60',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-700/60',
    rose: 'bg-rose-950/60 text-rose-300 border-rose-700/60',
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-700/60',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium rounded-md border backdrop-blur-sm transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
