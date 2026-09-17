import type { ReactNode } from 'react';
import { CheckCircle2, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/format';
import { formatDate } from '@/lib/dates';
import { chargeStatusLabels, chargeStatusTone, type ChargeStatus } from '@/lib/status';
import type { ChargeListItem } from '../api';

export function IconButton({
  label,
  tone = 'default',
  onClick,
  children,
}: {
  label: string;
  tone?: 'default' | 'danger';
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex min-h-touch min-w-touch items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
        tone === 'danger' ? 'text-status-atrasado' : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      {children}
    </button>
  );
}

export function ChargeCard({
  charge,
  onEdit,
  onDelete,
  onPay,
  onWhatsApp,
}: {
  charge: ChargeListItem;
  onEdit: () => void;
  onDelete: () => void;
  onPay: () => void;
  onWhatsApp: () => void;
}) {
  const chargeStatus = charge.status as ChargeStatus;
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-gray-900 dark:text-gray-100">{charge.description || charge.project_name}</p>
        <Badge tone={chargeStatusTone[chargeStatus]}>{chargeStatusLabels[chargeStatus]}</Badge>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {charge.client_name} · Vencimento {formatDate(charge.due_date)}
        {chargeStatus === 'atrasado' && charge.dias_atraso != null ? ` (${charge.dias_atraso}d)` : ''}
      </p>
      <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(charge.amount)}</p>
      <div className="flex items-center gap-1 pt-1">
        {!charge.paid_at && (
          <IconButton label="Marcar como pago" onClick={onPay}>
            <CheckCircle2 size={16} />
          </IconButton>
        )}
        {!charge.paid_at && (
          <IconButton label="Cobrar no WhatsApp" onClick={onWhatsApp}>
            <MessageCircle size={16} />
          </IconButton>
        )}
        <IconButton label="Editar cobrança" onClick={onEdit}>
          <Pencil size={16} />
        </IconButton>
        <IconButton label="Excluir cobrança" tone="danger" onClick={onDelete}>
          <Trash2 size={16} />
        </IconButton>
      </div>
    </div>
  );
}
