import React, { forwardRef } from 'react';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  'aria-describedby'?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'medium',
  loading = false,
  loadingText,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = 'btn';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = `btn-${size}`;
  const fullWidthClass = fullWidth ? 'btn-full-width' : '';
  const loadingClass = loading ? 'btn-loading' : '';
  
  const buttonClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    fullWidthClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;
  const buttonText = loading && loadingText ? loadingText : children;

  // Ensure proper ARIA attributes for loading state
  const ariaProps: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    'aria-disabled'?: boolean;
    'aria-busy'?: boolean;
    'aria-live'?: 'polite' | 'off' | 'assertive';
  } = {
    ...props,
    'aria-disabled': isDisabled,
    'aria-busy': loading,
    ...(loading && { 'aria-live': 'polite' as 'polite' })
  };

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      {...ariaProps}
    >
      {loading && (
        <LoadingSpinner 
          size="small" 
          variant={variant === 'primary' ? 'white' : 'primary'}
        />
      )}
      
      {!loading && leftIcon && (
        <span className="btn-icon btn-icon-left" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      
      <span className="btn-text">
        {buttonText}
      </span>
      
      {!loading && rightIcon && (
        <span className="btn-icon btn-icon-right" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

// IconButton for cases where only an icon is needed
interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string; // Required for icon-only buttons
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  size = 'medium',
  variant = 'ghost',
  className = '',
  ...props
}, ref) => {
  const iconButtonClass = `btn-icon-only ${className}`;
  
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={iconButtonClass}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </Button>
  );
});

IconButton.displayName = 'IconButton';