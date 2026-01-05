import React from 'react';
import { STATUS_CONFIG } from '@/constants/designSystem';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  variant = 'solid',
  className = '',
}) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.todo;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const baseClasses = `
    inline-flex
    items-center
    gap-1.5
    rounded-md
    font-medium
    transition-all
    duration-200
    ${sizeClasses[size]}
    ${className}
  `;

  const styleClasses = variant === 'outline'
    ? `border border-current text-[${config.textColor}] bg-transparent`
    : `border border-current text-[${config.textColor}] bg-[${config.backgroundColor}]`;

  return (
    <span
      className={baseClasses}
      style={{
        backgroundColor: variant === 'solid' ? config.backgroundColor : 'transparent',
        color: config.textColor,
        borderColor: config.borderColor,
        border: `1px solid ${config.borderColor}`,
      }}
      title={config.label}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
