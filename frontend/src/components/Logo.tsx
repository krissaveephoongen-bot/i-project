import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto'
  };

  return (
    <img 
      src="/i-project-logo.png" 
      alt="i Project Logo"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo;
