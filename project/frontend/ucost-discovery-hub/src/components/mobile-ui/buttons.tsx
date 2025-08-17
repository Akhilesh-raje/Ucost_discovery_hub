import React from 'react';
import { useCapacitor } from '../../hooks/useCapacitor';
import { cn } from '../../lib/utils';
import { LabelLarge } from './typography';

// Apple-style button variants
const buttonVariants = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95',
  secondary: 'bg-secondary text-secondary-foreground border border-input hover:bg-secondary/80 active:bg-secondary/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/90',
  ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95',
  success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800',
  info: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
} as const;

// Apple-style button sizes with proper touch targets
const buttonSizes = {
  // Extra large - for primary CTAs
  xl: 'h-16 px-8 py-4 text-lg rounded-2xl',
  // Large - for important actions
  lg: 'h-14 px-6 py-3 text-base rounded-xl',
  // Default - standard buttons
  default: 'h-12 px-4 py-3 text-sm rounded-lg',
  // Small - for secondary actions
  sm: 'h-10 px-3 py-2 text-sm rounded-lg',
  // Extra small - for compact spaces
  xs: 'h-8 px-2 py-1 text-xs rounded-md',
  // Icon only - square buttons
  icon: 'h-12 w-12 p-0 rounded-xl',
  // Icon small - compact icon buttons
  'icon-sm': 'h-10 w-10 p-0 rounded-lg',
} as const;

type ButtonVariant = keyof typeof buttonVariants;
type ButtonSize = keyof typeof buttonSizes;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'default',
  children,
  className,
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  ...props
}) => {
  const { isNative, triggerHaptic } = useCapacitor();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isNative && !disabled && !loading) {
      await triggerHaptic('light');
    }
    props.onClick?.(e);
  };

  const baseClasses = cn(
    // Base button styles
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98] active:transition-transform',
    
    // Variant and size
    buttonVariants[variant],
    buttonSizes[size],
    
    // Layout
    fullWidth && 'w-full',
    iconOnly && 'aspect-square',
    
    // Mobile optimizations
    isNative && 'touch-manipulation select-none',
    
    className
  );

  const content = (
    <>
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {!iconOnly && children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  );

  return (
    <button
      {...props}
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {content}
    </button>
  );
};

// Specialized button components for common use cases
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props} />
);

export const DestructiveButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="destructive" {...props} />
);

export const SuccessButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="success" {...props} />
);

export const WarningButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="warning" {...props} />
);

export const InfoButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="info" {...props} />
);

// Icon button component
export const IconButton: React.FC<Omit<ButtonProps, 'size' | 'iconOnly'> & { size?: 'default' | 'small' }> = ({
  size = 'default',
  ...props
}) => (
  <Button
    {...props}
    size={size === 'default' ? 'icon' : 'icon-sm'}
    iconOnly
  />
);

// Floating action button
export const FloatingActionButton: React.FC<Omit<ButtonProps, 'size' | 'className'> & { 
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' 
}> = ({ position = 'bottom-right', className, ...props }) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <Button
      {...props}
      size="xl"
      className={cn(
        'fixed z-50 shadow-2xl',
        positionClasses[position],
        className
      )}
    />
  );
};

// Button group component
export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: ButtonSize;
}> = ({ children, className, orientation = 'horizontal', size = 'default' }) => {
  return (
    <div
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        className
      )}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            size,
            className: cn(
              child.props.className,
              // Remove rounded corners from middle buttons
              orientation === 'horizontal' && index > 0 && 'rounded-l-none',
              orientation === 'horizontal' && index < React.Children.count(children) - 1 && 'rounded-r-none',
              orientation === 'vertical' && index > 0 && 'rounded-t-none',
              orientation === 'vertical' && index < React.Children.count(children) - 1 && 'rounded-b-none',
              // Add borders between buttons
              orientation === 'horizontal' && index > 0 && 'border-l-0',
              orientation === 'vertical' && index > 0 && 'border-t-0'
            ),
          });
        }
        return child;
      })}
    </div>
  );
}; 