import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-2xl text-lg font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-card/50 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        kids: "bg-kids text-kids-foreground hover:bg-kids/90 hover:shadow-lg hover:shadow-kids/25 hover:scale-105",
        students: "bg-students text-students-foreground hover:bg-students/90 hover:shadow-lg hover:shadow-students/25 hover:scale-105",
        families: "bg-families text-families-foreground hover:bg-families/90 hover:shadow-lg hover:shadow-families/25 hover:scale-105",
        researchers: "bg-researchers text-researchers-foreground hover:bg-researchers/90 hover:shadow-lg hover:shadow-researchers/25 hover:scale-105",
        cosmic: "bg-gradient-cosmic text-foreground hover:shadow-lg hover:shadow-primary/30 hover:scale-105 animate-glow-pulse",
        explore: "bg-gradient-aurora text-foreground hover:shadow-lg hover:shadow-accent/30 hover:scale-105",
      },
      size: {
        default: "h-14 px-8 py-4",
        sm: "h-10 rounded-xl px-4 text-base",
        lg: "h-20 rounded-3xl px-12 text-xl",
        xl: "h-24 rounded-3xl px-16 text-2xl",
        icon: "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
