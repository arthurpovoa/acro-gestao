import { forwardRef, useId, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`min-h-touch rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
            error ? 'border-status-atrasado' : 'border-gray-300'
          } ${className}`}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-status-atrasado">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
