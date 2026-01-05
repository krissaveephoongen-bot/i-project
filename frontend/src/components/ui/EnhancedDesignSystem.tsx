import React from 'react';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/constants';
import { APP_CONFIG } from '../../config/constants';

// Enhanced Design System Components - Focused on new, non-conflicting components
export const EnhancedButton: React.FC<{
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  children,
  className = '',
  onClick
}) => {
  // Variant styles
  const variantStyles = {
    primary: `bg-[${COLORS.PRIMARY.DEFAULT}] text-white hover:bg-[${COLORS.PRIMARY[600]}] active:bg-[${COLORS.PRIMARY[700]}]`,
    secondary: `bg-[${COLORS.SECONDARY.DEFAULT}] text-white hover:bg-[${COLORS.SECONDARY[600]}] active:bg-[${COLORS.SECONDARY[700]}]`,
    success: `bg-[${COLORS.SUCCESS.DEFAULT}] text-white hover:bg-[${COLORS.SUCCESS[600]}] active:bg-[${COLORS.SUCCESS[700]}]`,
    warning: `bg-[${COLORS.WARNING.DEFAULT}] text-white hover:bg-[${COLORS.WARNING[600]}] active:bg-[${COLORS.WARNING[700]}]`,
    danger: `bg-[${COLORS.DANGER.DEFAULT}] text-white hover:bg-[${COLORS.DANGER[600]}] active:bg-[${COLORS.DANGER[700]}]`,
    ghost: `bg-transparent text-[${COLORS.PRIMARY.DEFAULT}] hover:bg-[${COLORS.PRIMARY[50]}] active:bg-[${COLORS.PRIMARY[100]}]`,
    outline: `border border-[${COLORS.PRIMARY.DEFAULT}] text-[${COLORS.PRIMARY.DEFAULT}] hover:bg-[${COLORS.PRIMARY[50]}] active:bg-[${COLORS.PRIMARY[100]}]`
  };

  // Size styles
  const sizeStyles = {
    sm: `px-[${SPACING['2']}] py-[${SPACING['1']}] text-[${TYPOGRAPHY.FONT_SIZES.SM}]`,
    md: `px-[${SPACING['3']}] py-[${SPACING['2']}] text-[${TYPOGRAPHY.FONT_SIZES.BASE}]`,
    lg: `px-[${SPACING['4']}] py-[${SPACING['2.5']}] text-[${TYPOGRAPHY.FONT_SIZES.LG}]`,
    xl: `px-[${SPACING['5']}] py-[${SPACING['3']}] text-[${TYPOGRAPHY.FONT_SIZES.XL}]`
  };

  // Base button classes
  const baseClasses = `
    inline-flex items-center justify-center
    font-[${TYPOGRAPHY.FONT_WEIGHTS.MEDIUM}]
    rounded-[${BORDER_RADIUS.DEFAULT}]
    transition-all duration-[${APP_CONFIG.ANIMATION_DURATIONS.NORMAL}]
    focus:outline-none focus:ring-2 focus:ring-[${COLORS.PRIMARY[300]}] focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${className}
  `;

  return (
    <button
      className={baseClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <span className="mr-2">
            <EnhancedSpinner size="sm" />
          </span>
          Processing...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={`mr-${size === 'sm' ? '1' : '2'}`}>
              {icon}
            </span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className={`ml-${size === 'sm' ? '1' : '2'}`}>
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

// Enhanced Spinner Component
export const EnhancedSpinner: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}> = ({
  size = 'md',
  color = COLORS.PRIMARY.DEFAULT,
  className = ''
}) => {
  // Size styles
  const sizeStyles = {
    xs: `w-[${SPACING['3']}] h-[${SPACING['3']}]`,
    sm: `w-[${SPACING['4']}] h-[${SPACING['4']}]`,
    md: `w-[${SPACING['5']}] h-[${SPACING['5']}]`,
    lg: `w-[${SPACING['6']}] h-[${SPACING['6']}]`,
    xl: `w-[${SPACING['8']}] h-[${SPACING['8']}]`
  };

  const baseClasses = `
    animate-spin
    rounded-[${BORDER_RADIUS.FULL}]
    border-2 border-t-2 border-[${color}] border-t-transparent
    ${sizeStyles[size]}
    ${className}
  `;

  return <div className={baseClasses} />;
};

// Enhanced Skeleton Loader
export const EnhancedSkeleton: React.FC<{
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}> = ({
  width = '100%',
  height = SPACING['10'],
  radius = BORDER_RADIUS.DEFAULT,
  className = ''
}) => {
  const baseClasses = `
    animate-pulse
    bg-[${COLORS.GRAY[200]}]
    rounded-[${radius}]
    ${className}
  `;

  return (
    <div
      className={baseClasses}
      style={{ width, height }}
    />
  );
};

// Enhanced Empty State Component
export const EnhancedEmptyState: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({
  title,
  description,
  icon,
  action,
  className = ''
}) => {
  const baseClasses = `
    text-center
    py-[${SPACING['12']}]
    px-[${SPACING['4']}]
    ${className}
  `;

  return (
    <div className={baseClasses}>
      {icon && (
        <div className="mb-[${SPACING['4']}] text-[${COLORS.GRAY[400]}]">
          {icon}
        </div>
      )}
      <h3 className="text-[${TYPOGRAPHY.FONT_SIZES.XL}] font-[${TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD}] text-[${COLORS.GRAY[700]}] mb-[${SPACING['2']}]">
        {title}
      </h3>
      <p className="text-[${TYPOGRAPHY.FONT_SIZES.BASE}] text-[${COLORS.GRAY[500]}] mb-[${SPACING['4']}]">
        {description}
      </p>
      {action && action}
    </div>
  );
};

// Enhanced Progress Bar
export const EnhancedProgressBar: React.FC<{
  value: number;
  max?: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
  className?: string;
}> = ({
  value,
  max = 100,
  color = COLORS.PRIMARY.DEFAULT,
  height = SPACING['1'],
  showLabel = false,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const baseClasses = `
    w-full
    bg-[${COLORS.GRAY[200]}]
    rounded-[${BORDER_RADIUS.FULL}]
    overflow-hidden
    ${className}
  `;

  const fillClasses = `
    h-[${height}]
    bg-[${color}]
    rounded-[${BORDER_RADIUS.FULL}]
    transition-all
    duration-[${APP_CONFIG.ANIMATION_DURATIONS.SLOW}]
    ease-out
  `;

  return (
    <div className={baseClasses}>
      <div
        className={fillClasses}
        style={{ width: `${percentage}%` }}
      />
      {showLabel && (
        <div className="mt-[${SPACING['1']}] text-[${TYPOGRAPHY.FONT_SIZES.XS}] text-[${COLORS.GRAY[600]}]">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

// Enhanced Card Component
export const EnhancedCard: React.FC<{
  variant?: 'default' | 'elevated' | 'bordered' | 'interactive';
  hoverEffect?: boolean;
  clickable?: boolean;
  shadow?: 'none' | 'sm' | 'default' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({
  variant = 'default',
  hoverEffect = false,
  clickable = false,
  shadow = 'default',
  children,
  className = '',
  onClick
}) => {
  // Variant styles
  const variantStyles = {
    default: 'bg-white',
    elevated: 'bg-white',
    bordered: 'bg-white border border-gray-200',
    interactive: 'bg-white hover:bg-gray-50 transition-colors'
  };

  // Shadow styles
  const shadowStyles = {
    none: 'shadow-none',
    sm: `shadow-[${SHADOWS.SM}]`,
    default: `shadow-[${SHADOWS.DEFAULT}]`,
    md: `shadow-[${SHADOWS.MD}]`,
    lg: `shadow-[${SHADOWS.LG}]`,
    xl: `shadow-[${SHADOWS.XL}]`
  };

  // Hover effects
  const hoverEffects = hoverEffect
    ? 'hover:shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300'
    : '';

  // Clickable effects
  const clickableEffects = clickable
    ? 'cursor-pointer active:translate-y-0.5 transition-all'
    : '';

  const baseClasses = `
    rounded-[${BORDER_RADIUS.LG}]
    p-[${SPACING['4']}]
    ${variantStyles[variant]}
    ${shadowStyles[shadow]}
    ${hoverEffects}
    ${clickableEffects}
    ${className}
  `;

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
};

// Enhanced Badge Component
export const EnhancedBadge: React.FC<{
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  outline?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({
  variant = 'neutral',
  size = 'md',
  pill = false,
  outline = false,
  children,
  className = ''
}) => {
  // Variant styles
  const variantStyles = {
    primary: outline
      ? `text-[${COLORS.PRIMARY.DEFAULT}] border border-[${COLORS.PRIMARY.DEFAULT}]`
      : `bg-[${COLORS.PRIMARY[100]}] text-[${COLORS.PRIMARY[800]}]`,
    secondary: outline
      ? `text-[${COLORS.SECONDARY.DEFAULT}] border border-[${COLORS.SECONDARY.DEFAULT}]`
      : `bg-[${COLORS.SECONDARY[100]}] text-[${COLORS.SECONDARY[800]}]`,
    success: outline
      ? `text-[${COLORS.SUCCESS.DEFAULT}] border border-[${COLORS.SUCCESS.DEFAULT}]`
      : `bg-[${COLORS.SUCCESS[100]}] text-[${COLORS.SUCCESS[800]}]`,
    warning: outline
      ? `text-[${COLORS.WARNING.DEFAULT}] border border-[${COLORS.WARNING.DEFAULT}]`
      : `bg-[${COLORS.WARNING[100]}] text-[${COLORS.WARNING[800]}]`,
    danger: outline
      ? `text-[${COLORS.DANGER.DEFAULT}] border border-[${COLORS.DANGER.DEFAULT}]`
      : `bg-[${COLORS.DANGER[100]}] text-[${COLORS.DANGER[800]}]`,
    info: outline
      ? `text-[${COLORS.INFO.DEFAULT}] border border-[${COLORS.INFO.DEFAULT}]`
      : `bg-[${COLORS.INFO[100]}] text-[${COLORS.INFO[800]}]`,
    neutral: outline
      ? `text-[${COLORS.GRAY[700]}] border border-[${COLORS.GRAY[300]}]`
      : `bg-[${COLORS.GRAY[100]}] text-[${COLORS.GRAY[700]}]`
  };

  // Size styles
  const sizeStyles = {
    sm: `px-[${SPACING['2']}] py-[${SPACING['0.5']}] text-[${TYPOGRAPHY.FONT_SIZES.XS}]`,
    md: `px-[${SPACING['2.5']}] py-[${SPACING['1']}] text-[${TYPOGRAPHY.FONT_SIZES.SM}]`,
    lg: `px-[${SPACING['3']}] py-[${SPACING['1.5']}] text-[${TYPOGRAPHY.FONT_SIZES.BASE}]`
  };

  const baseClasses = `
    inline-flex items-center
    font-[${TYPOGRAPHY.FONT_WEIGHTS.MEDIUM}]
    ${pill ? `rounded-[${BORDER_RADIUS.FULL}]` : `rounded-[${BORDER_RADIUS.DEFAULT}]`}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `;

  return (
    <span className={baseClasses}>
      {children}
    </span>
  );
};

// Export all enhanced components
export {
  EnhancedButton,
  EnhancedSpinner,
  EnhancedSkeleton,
  EnhancedEmptyState,
  EnhancedProgressBar,
  EnhancedCard,
  EnhancedBadge
};