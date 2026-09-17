import { getMonthDueDate, parseDateOnly, todayDateOnly } from './dates';

export type ChargeStatus = 'pago' | 'sem_vencimento' | 'atrasado' | 'vence_em_7_dias' | 'a_vencer';

export interface ChargeStatusInput {
  paid_at: string | null;
  due_date: string | null;
}

/**
 * Espelha a regra em SQL de v_charges (supabase/migrations/..._views_functions.sql).
 * As duas versões precisam concordar — mudou uma, muda a outra.
 */
export function getChargeStatus(charge: ChargeStatusInput, today: Date = todayDateOnly()): ChargeStatus {
  if (charge.paid_at) return 'pago';
  if (!charge.due_date) return 'sem_vencimento';

  const dueDate = parseDateOnly(charge.due_date);
  if (dueDate < today) return 'atrasado';

  const in7Days = new Date(today);
  in7Days.setDate(in7Days.getDate() + 7);
  if (dueDate <= in7Days) return 'vence_em_7_dias';

  return 'a_vencer';
}

export function getDaysLate(charge: ChargeStatusInput, today: Date = todayDateOnly()): number | null {
  if (getChargeStatus(charge, today) !== 'atrasado' || !charge.due_date) return null;
  const dueDate = parseDateOnly(charge.due_date);
  const diffMs = today.getTime() - dueDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export const chargeStatusLabels: Record<ChargeStatus, string> = {
  pago: 'Pago',
  sem_vencimento: 'Sem vencimento',
  atrasado: 'Atrasado',
  vence_em_7_dias: 'Vence em 7 dias',
  a_vencer: 'A vencer',
};

export const chargeStatusTone: Record<ChargeStatus, 'pago' | 'atencao' | 'atrasado' | 'inativo'> = {
  pago: 'pago',
  sem_vencimento: 'inativo',
  atrasado: 'atrasado',
  vence_em_7_dias: 'atencao',
  a_vencer: 'inativo',
};

// ============ Contratos recorrentes (mensalidades) ============

export type ContractMonthStatus = 'fora_do_contrato' | 'pago' | 'parcial' | 'vencido' | 'futuro';

export interface ContractMonthStatusInput {
  startDate: string;
  endDate: string | null;
  monthlyAmount: number;
  valorPago: number;
  dueDate: string;
}

function monthKey(dateISO: string): string {
  return dateISO.slice(0, 7);
}

/**
 * Espelha public.f_contract_month_status do SQL. As duas versões precisam
 * concordar — mudou uma, muda a outra.
 */
export function getContractMonthStatus(
  input: ContractMonthStatusInput,
  today: Date = todayDateOnly(),
): ContractMonthStatus {
  const dueMonth = monthKey(input.dueDate);
  const startMonth = monthKey(input.startDate);
  if (dueMonth < startMonth) return 'fora_do_contrato';
  if (input.endDate && dueMonth > monthKey(input.endDate)) return 'fora_do_contrato';

  if (input.valorPago >= input.monthlyAmount) return 'pago';
  if (input.valorPago > 0) return 'parcial';
  if (parseDateOnly(input.dueDate) < today) return 'vencido';
  return 'futuro';
}

export const contractMonthStatusLabels: Record<ContractMonthStatus, string> = {
  fora_do_contrato: 'Fora do contrato',
  pago: 'Pago',
  parcial: 'Parcial',
  vencido: 'Vencido',
  futuro: 'Futuro',
};

export interface ContractPaymentInput {
  referenceMonth: string;
  amount: number;
}

export interface ContractOpenSummaryInput {
  startDate: string;
  endDate: string | null;
  monthlyAmount: number;
  dueDay: number;
  payments: ContractPaymentInput[];
}

export interface ContractOpenSummary {
  mesesEmAberto: number;
  valorEmAberto: number;
}

/**
 * Espelha public.f_contract_aberto do SQL: percorre todos os meses desde o
 * início do contrato até hoje (ou até o fim, se já encerrado), sem limite de
 * período, somando os meses vencidos com saldo devedor.
 */
export function getContractOpenSummary(
  input: ContractOpenSummaryInput,
  today: Date = todayDateOnly(),
): ContractOpenSummary {
  const start = parseDateOnly(input.startDate);
  const end = input.endDate ? parseDateOnly(input.endDate) : today;
  const limit = end < today ? end : today;

  const paidByMonth = new Map<string, number>();
  for (const payment of input.payments) {
    const key = monthKey(payment.referenceMonth);
    paidByMonth.set(key, (paidByMonth.get(key) ?? 0) + payment.amount);
  }

  let mesesEmAberto = 0;
  let valorEmAberto = 0;

  let year = start.getFullYear();
  let month = start.getMonth() + 1;
  const limitYear = limit.getFullYear();
  const limitMonth = limit.getMonth() + 1;

  while (year < limitYear || (year === limitYear && month <= limitMonth)) {
    const dueDate = getMonthDueDate(year, month, input.dueDay);
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const valorPago = paidByMonth.get(key) ?? 0;

    if (parseDateOnly(dueDate) < today && valorPago < input.monthlyAmount) {
      mesesEmAberto += 1;
      valorEmAberto += input.monthlyAmount - valorPago;
    }

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return { mesesEmAberto, valorEmAberto: Math.round(valorEmAberto * 100) / 100 };
}
