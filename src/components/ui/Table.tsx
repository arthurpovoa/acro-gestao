import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

export function Table({ className = '', children, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className={`w-full text-left text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function Th({ className = '', children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ className = '', children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`border-t border-gray-100 px-4 py-3 text-gray-700 dark:border-gray-800 dark:text-gray-200 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
