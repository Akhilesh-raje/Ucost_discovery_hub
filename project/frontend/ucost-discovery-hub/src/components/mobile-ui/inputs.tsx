import React, { forwardRef } from 'react';
import { useCapacitor } from '../../hooks/useCapacitor';
import { cn } from '../../lib/utils';
import { LabelMedium } from './typography';

// Apple-style input variants
const inputVariants = {
  default: 'border-input bg-background text-foreground placeholder:text-muted-foreground',
  filled: 'border-transparent bg-muted/50 text-foreground placeholder:text-muted-foreground',
  outlined: 'border-2 border-input bg-transparent text-foreground placeholder:text-muted-foreground',
  ghost: 'border-transparent bg-transparent text-foreground placeholder:text-muted-foreground',
} as const;

// Apple-style input sizes
const inputSizes = {
  sm: 'h-8 px-3 py-1 text-sm rounded-md',
  default: 'h-10 px-3 py-2 text-sm rounded-lg',
  lg: 'h-12 px-4 py-3 text-base rounded-xl',
  xl: 'h-14 px-4 py-4 text-lg rounded-2xl',
} as const;

type InputVariant = keyof typeof inputVariants;
type InputSize = keyof typeof inputSizes;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  description?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'default',
  label,
  description,
  error,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  ...props
}, ref) => {
  const { isNative } = useCapacitor();

  const baseClasses = cn(
    // Base input styles
    'flex w-full transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    
    // Variant and size
    inputVariants[variant],
    inputSizes[size],
    
    // Layout
    fullWidth && 'w-full',
    leftIcon && 'pl-10',
    rightIcon && 'pr-10',
    
    // Mobile optimizations
    isNative && 'touch-manipulation select-none text-base',
    
    // Error state
    error && 'border-destructive focus-visible:ring-destructive',
    
    className
  );

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full')}>
      {label && (
        <LabelMedium className="text-foreground">
          {label}
        </LabelMedium>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={baseClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
      
      {description && !error && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  description?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
  rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  variant = 'default',
  size = 'default',
  label,
  description,
  error,
  fullWidth = false,
  className,
  rows = 3,
  ...props
}, ref) => {
  const { isNative } = useCapacitor();

  const baseClasses = cn(
    // Base textarea styles
    'flex w-full resize-none transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    
    // Variant and size
    inputVariants[variant],
    inputSizes[size],
    
    // Layout
    fullWidth && 'w-full',
    
    // Mobile optimizations
    isNative && 'touch-manipulation select-none text-base',
    
    // Error state
    error && 'border-destructive focus-visible:ring-destructive',
    
    className
  );

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full')}>
      {label && (
        <LabelMedium className="text-foreground">
          {label}
        </LabelMedium>
      )}
      
      <textarea
        ref={ref}
        className={baseClasses}
        rows={rows}
        {...props}
      />
      
      {description && !error && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  description?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  variant = 'default',
  size = 'default',
  label,
  description,
  error,
  fullWidth = false,
  className,
  options,
  ...props
}, ref) => {
  const { isNative } = useCapacitor();

  const baseClasses = cn(
    // Base select styles
    'flex w-full transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    
    // Variant and size
    inputVariants[variant],
    inputSizes[size],
    
    // Layout
    fullWidth && 'w-full',
    
    // Mobile optimizations
    isNative && 'touch-manipulation select-none text-base',
    
    // Error state
    error && 'border-destructive focus-visible:ring-destructive',
    
    className
  );

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full')}>
      {label && (
        <LabelMedium className="text-foreground">
          {label}
        </LabelMedium>
      )}
      
      <select
        ref={ref}
        className={baseClasses}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {description && !error && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Search input component
interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onSearch?: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  placeholder = 'Search...',
  loading = false,
  ...props
}) => {
  const [query, setQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <Input
        {...props}
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        leftIcon={
          loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )
        }
        rightIcon={
          query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )
        }
      />
    </form>
  );
};

// Form field wrapper component
interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  description,
  error,
  required = false,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <LabelMedium className="text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </LabelMedium>
      )}
      
      {children}
      
      {description && !error && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}; 