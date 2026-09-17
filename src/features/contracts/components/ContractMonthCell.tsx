import type { ContractMonthStatus } from '@/lib/status';
import { formatCurrency } from '@/lib/format';
import { monthNamesShort } from '../contractStatus';

const cellClasses: Record<ContractMonthStatus, string> = {
  fora_do_contrato: 'bg-gray-100 text-gray-400 dark:bg-gray-800/60 dark:text-gray-600',
  pago: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  parcial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  vencido: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  futuro: 'bg-white text-gray-500 border border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700',
};

interface ContractMonthCellProps {
  month: number;
  status: ContractMonthStatus;
  valorPago: number;
  showLabel?: boolean;
  onClick: () => void;
}

export function ContractMonthCell({ month, status, valorPago, showLabel, onClick }: ContractMonthCellProps) {
  const disabled = status === 'fora_do_contrato';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={`${monthNamesShort[month - 1]}: ${formatCurrency(valorPago)}`}
      className={`flex min-h-touch min-w-touch flex-col items-center justify-center rounded-lg text-xs font-medium transition-opacity disabled:cursor-default ${cellClasses[status]} ${
        disabled ? '' : 'hover:opacity-80'
      }`}
    >
      {showLabel && <span className="text-[10px] opacity-70">{monthNamesShort[month - 1]}</span>}
      <span>{valorPago > 0 ? formatCurrency(valorPago).replace('R$', '').trim() : '—'}</span>
    </button>
  );
}
