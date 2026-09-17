import { formatNumber } from '@/lib/format';
import { fillTemplate } from '@/lib/whatsapp';
import type { Settings } from '@/features/settings/api';
import type { ContractDetail } from './api';

export function buildContractWhatsAppMessage(contract: ContractDetail, settings: Settings): string {
  return fillTemplate(settings.msg_mensalidade, {
    nome: contract.contact_name ?? '',
    meses: String(contract.meses_em_aberto ?? 0),
    servico: contract.service || 'mensalidade',
    valor: formatNumber(contract.valor_em_aberto),
  });
}
