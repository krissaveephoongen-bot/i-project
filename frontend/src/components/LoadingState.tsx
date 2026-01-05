import React from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  fullHeight?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  fullHeight = false,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${fullHeight ? 'min-h-screen' : 'py-12'} px-4`}>
      <LoadingSpinner />
      <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
};

export default LoadingState;
