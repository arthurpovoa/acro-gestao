import { formatDate } from '@/lib/dates';
import { formatNumber } from '@/lib/format';
import { fillTemplate } from '@/lib/whatsapp';
import { getChargeStatus } from '@/lib/status';
import type { Settings } from '@/features/settings/api';
import type { ChargeListItem } from './api';

export function buildChargeWhatsAppMessage(charge: ChargeListItem, settings: Settings): string {
  const status = getChargeStatus({ paid_at: charge.paid_at, due_date: charge.due_date });
  const template = status === 'atrasado' ? settings.msg_avulso_atrasado : settings.msg_avulso_a_vencer;

  return fillTemplate(template, {
    nome: charge.contact_name ?? '',
    valor: formatNumber(charge.amount),
    descricao: charge.description || charge.project_name || 'seu projeto',
    vencimento: formatDate(charge.due_date),
  });
}
