import React from 'react';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../config/constants';
import { APP_CONFIG } from '../../config/constants';

// Enhanced Design System Components - Non-conflicting versions
export const DSButton: React.FC<{
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
            <DSSpinner size="sm" />
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

// Enhanced Card Component with hover effects
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'interactive';
  hoverEffect?: boolean;
  clickable?: boolean;
  shadow?: 'none' | 'sm' | 'default' | 'md' | 'lg' | 'xl';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hoverEffect = false,
  clickable = false,
  shadow = 'default',
  children,
  className = '',
  ...props
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
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

// Enhanced Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  outline?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  pill = false,
  outline = false,
  children,
  className = '',
  ...props
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
    <span className={baseClasses} {...props}>
      {children}
    </span>
  );
};

// Enhanced Loading Spinner with animations
interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
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

// Enhanced Progress Bar with smooth transitions
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
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

// Enhanced Skeleton Loader with pulse animation
interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
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

// Enhanced Toast Notification with animations
interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 5000,
  onClose
}) => {
  // Type styles
  const typeStyles = {
    success: `bg-[${COLORS.SUCCESS[50]}] border-l-4 border-[${COLORS.SUCCESS.DEFAULT}] text-[${COLORS.SUCCESS[800]}]`,
    error: `bg-[${COLORS.DANGER[50]}] border-l-4 border-[${COLORS.DANGER.DEFAULT}] text-[${COLORS.DANGER[800]}]`,
    info: `bg-[${COLORS.INFO[50]}] border-l-4 border-[${COLORS.INFO.DEFAULT}] text-[${COLORS.INFO[800]}]`,
    warning: `bg-[${COLORS.WARNING[50]}] border-l-4 border-[${COLORS.WARNING.DEFAULT}] text-[${COLORS.WARNING[800]}]`
  };

  const baseClasses = `
    fixed
    right-[${SPACING['4']}]
    top-[${SPACING['4']}]
    p-[${SPACING['3']}]
    rounded-[${BORDER_RADIUS.MD}]
    shadow-[${SHADOWS.LG}]
    animate-slideIn
    ${typeStyles[type]}
  `;

  return (
    <div className={baseClasses}>
      <div className="flex items-center">
        <div className="flex-1">
          <p className="font-[${TYPOGRAPHY.FONT_WEIGHTS.MEDIUM}]">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-[${SPACING['3']}] text-[${COLORS.GRAY[500]}] hover:text-[${COLORS.GRAY[700]}]"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Enhanced Empty State Component
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
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

// Enhanced Error Boundary with better UX
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-[${SPACING['6']}] text-center">
          <div className="mb-[${SPACING['4']}]">
            <svg
              className="mx-auto h-[${SPACING['12']}] w-[${SPACING['12']}] text-[${COLORS.DANGER.DEFAULT}]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-[${TYPOGRAPHY.FONT_SIZES.XL}] font-[${TYPOGRAPHY.FONT_WEIGHTS.BOLD}] text-[${COLORS.DANGER.DEFAULT}] mb-[${SPACING['2']}]">
            Something went wrong
          </h3>
          <p className="text-[${TYPOGRAPHY.FONT_SIZES.BASE}] text-[${COLORS.GRAY[600]}] mb-[${SPACING['4']}]">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <DSButton variant="primary" onClick={this.resetError}>
            Try Again
          </DSButton>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced Modal Component with animations
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = ''
}) => {
  if (!isOpen) return null;

  // Size styles
  const sizeStyles = {
    sm: `max-w-[${SPACING['48']}]`,
    md: `max-w-[${SPACING['64']}]`,
    lg: `max-w-[${SPACING['80']}]`,
    xl: `max-w-[${SPACING['96']}]`,
    full: `max-w-[90vw]`
  };

  const baseClasses = `
    fixed inset-0 z-50 overflow-y-auto
    flex items-center justify-center
    p-[${SPACING['4']}]
  `;

  const backdropClasses = `
    fixed inset-0
    bg-[${COLORS.GRAY[900]}]
    bg-opacity-50
    transition-opacity
  `;

  const contentClasses = `
    bg-white
    rounded-[${BORDER_RADIUS.XL}]
    shadow-[${SHADOWS['2XL']}]
    w-full
    ${sizeStyles[size]}
    animate-scaleIn
    ${className}
  `;

  return (
    <div className={baseClasses}>
      <div className={backdropClasses} onClick={onClose} />
      <div className={contentClasses}>
        <div className="p-[${SPACING['6']}]">
          {title && (
            <div className="flex justify-between items-center mb-[${SPACING['4']}]">
              <h3 className="text-[${TYPOGRAPHY.FONT_SIZES.XL}] font-[${TYPOGRAPHY.FONT_WEIGHTS.BOLD}] text-[${COLORS.GRAY[900]}]">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-[${COLORS.GRAY[500]}] hover:text-[${COLORS.GRAY[700]}] transition-colors"
              >
                <svg
                  className="w-[${SPACING['5']}] h-[${SPACING['5']}]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

// Enhanced Tooltip Component
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Position styles
  const positionStyles = {
    top: `bottom-full left-1/2 transform -translate-x-1/2 mb-[${SPACING['2']}]`,
    bottom: `top-full left-1/2 transform -translate-x-1/2 mt-[${SPACING['2']}]`,
    left: `right-full top-1/2 transform -translate-y-1/2 mr-[${SPACING['2']}]`,
    right: `left-full top-1/2 transform -translate-y-1/2 ml-[${SPACING['2']}]`
  };

  const tooltipClasses = `
    absolute z-50
    px-[${SPACING['2']}]
    py-[${SPACING['1']}]
    text-[${TYPOGRAPHY.FONT_SIZES.XS}]
    text-white
    bg-[${COLORS.GRAY[900]}]
    rounded-[${BORDER_RADIUS.DEFAULT}]
    shadow-[${SHADOWS.LG}]
    whitespace-nowrap
    animate-fadeIn
    ${positionStyles[position]}
  `;

  return (
    <div className="relative inline-block" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      {isVisible && (
        <div className={tooltipClasses}>
          {content}
          <div className={`absolute w-[${SPACING['2']}] h-[${SPACING['2']}] bg-[${COLORS.GRAY[900]}] transform rotate-45`} />
        </div>
      )}
    </div>
  );
};

// Export all design system components
export {
  DSButton as Button,
  Card,
  Badge,
  LoadingSpinner,
  ProgressBar,
  Skeleton,
  Toast,
  EmptyState,
  ErrorBoundary,
  Modal,
  Tooltip
};

// Add DSSpinner as an alias to LoadingSpinner
export const DSSpinner = LoadingSpinner;