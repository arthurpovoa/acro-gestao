import { MessageCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { buildChargeWhatsAppMessage } from '@/features/charges/message';
import { buildContractWhatsAppMessage } from '@/features/contracts/message';
import { useSettings } from '@/features/settings/hooks';
import { useToast } from '@/components/ui/Toast';
import type { ChargeListItem } from '@/features/charges/api';
import type { ContractDetail } from '@/features/contracts/api';

interface CollectNowListProps {
  charges: ChargeListItem[];
  contracts: ContractDetail[];
}

export function CollectNowList({ charges, contracts }: CollectNowListProps) {
  const { data: settings } = useSettings();
  const { showToast } = useToast();

  if (charges.length === 0 && contracts.length === 0) {
    return (
      <EmptyState icon={CheckCircle2} title="Tudo em dia" description="Nenhuma cobrança ou mensalidade pendente." />
    );
  }

  function handleWhatsApp(whatsapp: string | null, message: string | undefined) {
    const link = buildWhatsAppLink(whatsapp, message);
    if (!link) {
      showToast('Cliente sem WhatsApp cadastrado.');
      return;
    }
    window.open(link, '_blank', 'noopener');
  }

  return (
    <ul className="flex flex-col gap-2">
      {charges.map((charge) => (
        <li
          key={`charge-${charge.id}`}
          className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900 dark:text-gray-100">
              {charge.description || charge.project_name}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {charge.client_name} · {charge.dias_atraso} dia(s) de atraso · {formatCurrency(charge.amount)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleWhatsApp(charge.whatsapp, settings ? buildChargeWhatsAppMessage(charge, settings) : undefined)}
            aria-label={`Cobrar ${charge.client_name} no WhatsApp`}
            className="flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-lg text-status-pago hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <MessageCircle size={18} />
          </button>
        </li>
      ))}
      {contracts.map((contract) => (
        <li
          key={`contract-${contract.id}`}
          className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900 dark:text-gray-100">
              {contract.service || 'Mensalidade'}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {contract.client_name} · {contract.meses_em_aberto} mês(es) em aberto ·{' '}
              {formatCurrency(contract.valor_em_aberto)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleWhatsApp(contract.whatsapp, settings ? buildContractWhatsAppMessage(contract, settings) : undefined)}
            aria-label={`Cobrar ${contract.client_name} no WhatsApp`}
            className="flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-lg text-status-pago hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <MessageCircle size={18} />
          </button>
        </li>
      ))}
    </ul>
  );
}
