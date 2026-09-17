import { forwardRef, useId, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = '', children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`min-h-touch rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
            error ? 'border-status-atrasado' : 'border-gray-300'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-status-atrasado">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';
