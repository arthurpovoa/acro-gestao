import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIME_ZONE = 'America/Sao_Paulo';

const isoDateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE });

/** Data de hoje em America/Sao_Paulo, no formato yyyy-MM-dd. */
export function todayISO(): string {
  return isoDateFormatter.format(new Date());
}

/**
 * Colunas `date` do Postgres não têm fuso — interpretamos "yyyy-MM-dd" como
 * data de calendário local, sem conversão de fuso, para não deslocar o dia.
 */
function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number) as [number, number, number];
  return new Date(year, month - 1, day);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return format(parseDateOnly(value), 'dd/MM/yyyy', { locale: ptBR });
}

export function formatMonthYear(value: string | null | undefined): string {
  if (!value) return '—';
  const label = format(parseDateOnly(value), 'MMMM/yyyy', { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
