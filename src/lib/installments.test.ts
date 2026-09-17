import { describe, expect, it } from 'vitest';
import { generateInstallments, splitInstallments } from './installments';

describe('splitInstallments', () => {
  it('divide igualmente quando o valor é exato', () => {
    expect(splitInstallments(1500, 2)).toEqual([750, 750]);
  });

  it('joga o resto dos centavos na última parcela', () => {
    const result = splitInstallments(1000, 3);
    expect(result).toEqual([333.33, 333.33, 333.34]);
    expect(result.reduce((sum, v) => sum + v, 0)).toBeCloseTo(1000, 2);
  });

  it('funciona com uma única parcela', () => {
    expect(splitInstallments(999.9, 1)).toEqual([999.9]);
  });
});

describe('generateInstallments', () => {
  it('gera datas espaçadas pelo intervalo em meses', () => {
    const plan = generateInstallments({
      totalAmount: 1500,
      count: 2,
      firstDueDate: '2026-01-15',
      intervalMonths: 1,
    });
    expect(plan).toEqual([
      { amount: 750, dueDate: '2026-01-15' },
      { amount: 750, dueDate: '2026-02-15' },
    ]);
  });

  it('respeita intervalos maiores que 1 mês', () => {
    const plan = generateInstallments({
      totalAmount: 300,
      count: 3,
      firstDueDate: '2026-01-31',
      intervalMonths: 2,
    });
    expect(plan.map((p) => p.dueDate)).toEqual(['2026-01-31', '2026-03-31', '2026-05-31']);
  });
});
