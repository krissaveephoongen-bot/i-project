import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  planned: number;
  actual: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  planned = 0,
  actual = 0,
  showLabels = true,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`${styles.progressContainer} ${className}`}>
      {showLabels && (
        <div className={`${styles.progressLabel} ${labelSizeClasses[size]}`}>
          <span>Planned: {planned}%</span>
          <span>Actual: {actual}%</span>
        </div>
      )}
      <div className={`${styles.progressBar} ${sizeClasses[size]}`}>
        <div
          className={styles.progressBarPlanned}
          style={{ width: `${planned}%` }}
          title={`Planned: ${planned}%`}
          role="progressbar"
          aria-valuenow={planned}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        <div
          className={styles.progressBarActual}
          style={{ width: `${actual}%` }}
          title={`Actual: ${actual}%`}
          role="progressbar"
          aria-valuenow={actual}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
