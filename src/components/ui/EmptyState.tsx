import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 py-12 text-center dark:border-gray-700">
      <Icon size={32} className="text-gray-400" aria-hidden="true" />
      <p className="font-medium text-gray-700 dark:text-gray-200">{title}</p>
      {description && <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
