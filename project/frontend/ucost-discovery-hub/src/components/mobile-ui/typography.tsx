import React from 'react';
import { cn } from '../../lib/utils';

// Apple-style typography scale
const typographyVariants = {
  // Display styles (large, prominent text)
  'display-large': 'text-4xl font-bold leading-tight tracking-tight',
  'display-medium': 'text-3xl font-bold leading-tight tracking-tight',
  'display-small': 'text-2xl font-bold leading-tight tracking-tight',
  
  // Headline styles (section headers)
  'headline-large': 'text-2xl font-semibold leading-tight tracking-tight',
  'headline-medium': 'text-xl font-semibold leading-tight tracking-tight',
  'headline-small': 'text-lg font-semibold leading-tight tracking-tight',
  
  // Title styles (card headers, important text)
  'title-large': 'text-lg font-medium leading-tight tracking-tight',
  'title-medium': 'text-base font-medium leading-tight tracking-tight',
  'title-small': 'text-sm font-medium leading-tight tracking-tight',
  
  // Body styles (main content)
  'body-large': 'text-lg leading-relaxed tracking-normal',
  'body-medium': 'text-base leading-relaxed tracking-normal',
  'body-small': 'text-sm leading-relaxed tracking-normal',
  
  // Label styles (buttons, form labels)
  'label-large': 'text-sm font-medium leading-tight tracking-wide',
  'label-medium': 'text-xs font-medium leading-tight tracking-wide',
  'label-small': 'text-xs font-medium leading-tight tracking-wide',
  
  // Caption styles (small text, metadata)
  'caption-large': 'text-sm leading-normal tracking-normal',
  'caption-medium': 'text-xs leading-normal tracking-normal',
  'caption-small': 'text-xs leading-normal tracking-normal',
} as const;

type TypographyVariant = keyof typeof typographyVariants;

interface TypographyProps {
  variant?: TypographyVariant;
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  lineClamp?: number;
}

const colorClasses = {
  primary: 'text-foreground',
  secondary: 'text-muted-foreground',
  tertiary: 'text-muted-foreground/70',
  error: 'text-destructive',
  success: 'text-green-600',
  warning: 'text-yellow-600',
};

const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body-medium',
  children,
  className,
  as: Component = 'p',
  color = 'primary',
  weight,
  align = 'left',
  truncate = false,
  lineClamp,
}) => {
  const baseClasses = typographyVariants[variant];
  const colorClass = colorClasses[color];
  const weightClass = weight ? weightClasses[weight] : '';
  const alignClass = alignClasses[align];
  
  const classes = cn(
    baseClasses,
    colorClass,
    weightClass,
    alignClass,
    truncate && 'truncate',
    lineClamp && `line-clamp-${lineClamp}`,
    className
  );

  return <Component className={classes}>{children}</Component>;
};

// Specialized typography components for common use cases
export const DisplayLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display-large" as="h1" {...props} />
);

export const DisplayMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display-medium" as="h1" {...props} />
);

export const DisplaySmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display-small" as="h2" {...props} />
);

export const HeadlineLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="headline-large" as="h2" {...props} />
);

export const HeadlineMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="headline-medium" as="h3" {...props} />
);

export const HeadlineSmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="headline-small" as="h4" {...props} />
);

export const TitleLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="title-large" as="h5" {...props} />
);

export const TitleMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="title-medium" as="h6" {...props} />
);

export const TitleSmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="title-small" as="span" {...props} />
);

export const BodyLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-large" as="p" {...props} />
);

export const BodyMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-medium" as="p" {...props} />
);

export const BodySmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-small" as="p" {...props} />
);

export const LabelLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="label-large" as="span" {...props} />
);

export const LabelMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="label-medium" as="span" {...props} />
);

export const LabelSmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="label-small" as="span" {...props} />
);

export const CaptionLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption-large" as="span" {...props} />
);

export const CaptionMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption-medium" as="span" {...props} />
);

export const CaptionSmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption-small" as="span" {...props} />
); 