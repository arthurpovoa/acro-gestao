import { parseDateOnly, todayDateOnly } from './dates';

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
