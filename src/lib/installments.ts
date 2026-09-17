import { addMonths } from 'date-fns';
import { parseDateOnly, toISODateOnly } from './dates';

/** Divide um valor em N parcelas iguais, jogando o resto dos centavos na última. */
export function splitInstallments(totalAmount: number, count: number): number[] {
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / count);
  const amounts = Array.from({ length: count }, () => baseCents);
  amounts[count - 1] = totalCents - baseCents * (count - 1);
  return amounts.map((cents) => cents / 100);
}

export interface InstallmentPlanItem {
  amount: number;
  dueDate: string;
}

export interface GenerateInstallmentsParams {
  totalAmount: number;
  count: number;
  firstDueDate: string;
  intervalMonths: number;
}

export function generateInstallments({
  totalAmount,
  count,
  firstDueDate,
  intervalMonths,
}: GenerateInstallmentsParams): InstallmentPlanItem[] {
  const amounts = splitInstallments(totalAmount, count);
  const firstDate = parseDateOnly(firstDueDate);
  return amounts.map((amount, index) => ({
    amount,
    dueDate: toISODateOnly(addMonths(firstDate, index * intervalMonths)),
  }));
}
