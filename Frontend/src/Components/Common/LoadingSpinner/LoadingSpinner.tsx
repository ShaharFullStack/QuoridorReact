import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'white';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  variant = 'primary',
  text,
  fullScreen = false,
  className = ''
}) => {
  const containerClass = `loading-spinner-container ${fullScreen ? 'fullscreen' : ''} ${className}`;
  const spinnerClass = `loading-spinner ${size} ${variant}`;

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className={spinnerClass}>
        <div className="spinner-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      {text && (
        <p className="loading-text" aria-label={text}>
          {text}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Skeleton loading component for content placeholders
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  variant = 'text',
  animation = 'pulse',
  className = ''
}) => {
  const skeletonClass = `skeleton ${variant} ${animation} ${className}`;
  
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      className={skeletonClass} 
      style={style}
      role="presentation"
      aria-hidden="true"
    />
  );
};

// Loading card component for page/section loading
interface LoadingCardProps {
  title?: string;
  subtitle?: string;
  showAvatar?: boolean;
  lines?: number;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = 'Loading content...',
  subtitle,
  showAvatar = false,
  lines = 3
}) => {
  return (
    <div className="loading-card card" role="status" aria-live="polite">
      <div className="loading-card-header">
        {showAvatar && <Skeleton variant="circular" width={48} height={48} />}
        <div className="loading-card-text">
          <Skeleton width="60%" height="1.5rem" />
          {subtitle && <Skeleton width="40%" height="1rem" />}
        </div>
      </div>
      
      <div className="loading-card-content">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton 
            key={i}
            width={i === lines - 1 ? '70%' : '100%'} 
            height="1rem" 
          />
        ))}
      </div>
      
      <span className="sr-only">{title}</span>
    </div>
  );
};