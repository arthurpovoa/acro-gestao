import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-700 disabled:bg-primary-300',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
  danger: 'bg-status-atrasado text-white hover:bg-red-700 disabled:bg-red-300',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex min-h-touch min-w-touch items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isLoading ? 'Carregando...' : children}
      </button>
    );
  },
);
Button.displayName = 'Button';
