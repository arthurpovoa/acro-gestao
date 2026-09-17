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
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number) as [number, number, number];
  return new Date(year, month - 1, day);
}

/** Formata uma Date de calendário local de volta para "yyyy-MM-dd". */
export function toISODateOnly(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Data de hoje como calendário local "yyyy-MM-dd" (sem hora), para comparações de status. */
export function todayDateOnly(): Date {
  return parseDateOnly(todayISO());
}

/**
 * Data de vencimento de um mês/ano para um due_day — espelha
 * public.f_month_due_date do SQL. Se o mês não tiver esse dia
 * (ex.: due_day 31 em fevereiro), usa o último dia do mês.
 */
export function getMonthDueDate(year: number, month: number, dueDay: number): string {
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const day = Math.min(dueDay, lastDayOfMonth);
  return toISODateOnly(new Date(year, month - 1, day));
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

export const monthNamesShort = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];
