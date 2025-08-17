import React from 'react';
import { useCapacitor } from '../../hooks/useCapacitor';
import { cn } from '../../lib/utils';

// Apple-style card variants
const cardVariants = {
  default: 'bg-card border border-border shadow-sm',
  elevated: 'bg-card border border-border shadow-md',
  outlined: 'bg-card border-2 border-border',
  filled: 'bg-muted/50 border border-border',
  ghost: 'bg-transparent border-none shadow-none',
} as const;

// Apple-style card sizes
const cardSizes = {
  sm: 'p-3 rounded-lg',
  default: 'p-4 rounded-xl',
  lg: 'p-6 rounded-2xl',
  xl: 'p-8 rounded-3xl',
} as const;

type CardVariant = keyof typeof cardVariants;
type CardSize = keyof typeof cardSizes;

interface CardProps {
  variant?: CardVariant;
  size?: CardSize;
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  padding?: 'none' | 'sm' | 'default' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'default' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'default' | 'lg' | 'xl' | '2xl';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'default',
  children,
  className,
  interactive = false,
  onClick,
  disabled = false,
  loading = false,
  padding,
  rounded,
  shadow,
}) => {
  const { isNative, triggerHaptic } = useCapacitor();

  const handleClick = async () => {
    if (isNative && !disabled && !loading) {
      await triggerHaptic('light');
    }
    onClick?.();
  };

  // Custom padding classes
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Custom rounded classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-md',
    default: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  };

  // Custom shadow classes
  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    default: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };

  const baseClasses = cn(
    // Base card styles
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    
    // Variant, size, and custom properties
    cardVariants[variant],
    !padding && cardSizes[size],
    padding && paddingClasses[padding],
    !rounded && cardSizes[size].split(' ')[1], // Extract rounded from size
    rounded && roundedClasses[rounded],
    !shadow && 'shadow-sm',
    shadow && shadowClasses[shadow],
    
    // Interactive states
    interactive && !disabled && !loading && [
      'cursor-pointer',
      'hover:shadow-md hover:-translate-y-0.5',
      'active:shadow-sm active:translate-y-0',
      'focus:shadow-md focus:-translate-y-0.5',
    ],
    
    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed',
    
    // Loading state
    loading && 'opacity-75 cursor-wait',
    
    // Mobile optimizations
    isNative && 'touch-manipulation select-none',
    
    className
  );

  return (
    <div
      className={baseClasses}
      onClick={interactive && !disabled && !loading ? handleClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
};

// Card header component
export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'default' | 'lg';
}> = ({ children, className, padding = 'default' }) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'px-3 py-2',
    default: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  return (
    <div className={cn('flex flex-col space-y-1.5', paddingClasses[padding], className)}>
      {children}
    </div>
  );
};

// Card title component
export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}> = ({ children, className, as: Component = 'h3' }) => {
  return (
    <Component className={cn('font-semibold leading-none tracking-tight', className)}>
      {children}
    </Component>
  );
};

// Card description component
export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
};

// Card content component
export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'default' | 'lg';
}> = ({ children, className, padding = 'default' }) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'px-3 py-2',
    default: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  return (
    <div className={cn(paddingClasses[padding], className)}>
      {children}
    </div>
  );
};

// Card footer component
export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'default' | 'lg';
}> = ({ children, className, padding = 'default' }) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'px-3 py-2',
    default: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  return (
    <div className={cn('flex items-center', paddingClasses[padding], className)}>
      {children}
    </div>
  );
};

// Specialized card components
export const InteractiveCard: React.FC<Omit<CardProps, 'interactive'>> = (props) => (
  <Card {...props} interactive />
);

export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="elevated" />
);

export const OutlinedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="outlined" />
);

export const FilledCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="filled" />
);

export const GhostCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="ghost" />
);

// Feature card component for highlighting features
export const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  onClick?: () => void;
}> = ({ icon, title, description, className, onClick }) => {
  return (
    <InteractiveCard
      className={cn('text-center hover:bg-accent/50', className)}
      onClick={onClick}
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </div>
      </div>
    </InteractiveCard>
  );
};

// Stats card component for displaying metrics
export const StatsCard: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}> = ({ icon, value, label, trend, className }) => {
  return (
    <Card className={cn('text-center', className)}>
      <div className="flex flex-col items-center space-y-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
          {trend && (
            <div className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.isPositive ? '↗' : '↘'} {trend.value}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}; 