import { describe, expect, it } from 'vitest';
import { getMonthDueDate } from './dates';
import { getChargeStatus, getContractMonthStatus, getContractOpenSummary, getDaysLate } from './status';

const today = new Date(2026, 8, 17); // 17/09/2026

describe('getChargeStatus', () => {
  it('paga quando tem paid_at, mesmo se vencida', () => {
    expect(getChargeStatus({ paid_at: '2026-09-01', due_date: '2026-08-01' }, today)).toBe('pago');
  });

  it('sem vencimento quando due_date é nulo e não está paga', () => {
    expect(getChargeStatus({ paid_at: null, due_date: null }, today)).toBe('sem_vencimento');
  });

  it('atrasada quando due_date é anterior a hoje', () => {
    expect(getChargeStatus({ paid_at: null, due_date: '2026-09-10' }, today)).toBe('atrasado');
  });

  it('vence em 7 dias quando due_date está entre hoje e hoje+7', () => {
    expect(getChargeStatus({ paid_at: null, due_date: '2026-09-20' }, today)).toBe('vence_em_7_dias');
    expect(getChargeStatus({ paid_at: null, due_date: '2026-09-24' }, today)).toBe('vence_em_7_dias');
  });

  it('a vencer quando due_date é mais de 7 dias no futuro', () => {
    expect(getChargeStatus({ paid_at: null, due_date: '2026-09-25' }, today)).toBe('a_vencer');
  });
});

describe('getDaysLate', () => {
  it('retorna null quando não está atrasada', () => {
    expect(getDaysLate({ paid_at: null, due_date: '2026-09-25' }, today)).toBeNull();
    expect(getDaysLate({ paid_at: '2026-09-01', due_date: '2026-08-01' }, today)).toBeNull();
  });

  it('retorna a quantidade de dias de atraso', () => {
    expect(getDaysLate({ paid_at: null, due_date: '2026-09-10' }, today)).toBe(7);
  });
});

describe('getMonthDueDate', () => {
  it('usa o último dia do mês quando due_day não existe (31 em fevereiro)', () => {
    expect(getMonthDueDate(2026, 2, 31)).toBe('2026-02-28');
  });

  it('usa o due_day normalmente quando o mês tem esse dia', () => {
    expect(getMonthDueDate(2026, 9, 15)).toBe('2026-09-15');
  });
});

describe('getContractMonthStatus', () => {
  it('fora do contrato quando o mês é anterior ao início (início no meio do mês)', () => {
    const status = getContractMonthStatus(
      { startDate: '2026-09-15', endDate: null, monthlyAmount: 300, valorPago: 0, dueDate: '2026-08-10' },
      today,
    );
    expect(status).toBe('fora_do_contrato');
  });

  it('não fica fora do contrato no próprio mês de início, mesmo começando no meio do mês', () => {
    const status = getContractMonthStatus(
      { startDate: '2026-09-15', endDate: null, monthlyAmount: 300, valorPago: 0, dueDate: '2026-09-20' },
      today,
    );
    expect(status).toBe('futuro');
  });

  it('fora do contrato quando o mês é posterior ao cancelamento (end_date)', () => {
    const status = getContractMonthStatus(
      { startDate: '2026-01-10', endDate: '2026-06-30', monthlyAmount: 300, valorPago: 0, dueDate: '2026-07-10' },
      today,
    );
    expect(status).toBe('fora_do_contrato');
  });

  it('parcial quando pagou algo mas menos que o valor mensal, mesmo com vencimento futuro', () => {
    const status = getContractMonthStatus(
      { startDate: '2026-01-10', endDate: null, monthlyAmount: 300, valorPago: 100, dueDate: '2026-09-30' },
      today,
    );
    expect(status).toBe('parcial');
  });

  it('vencido quando não pagou e o vencimento já passou', () => {
    const status = getContractMonthStatus(
      { startDate: '2026-01-10', endDate: null, monthlyAmount: 300, valorPago: 0, dueDate: '2026-09-10' },
      today,
    );
    expect(status).toBe('vencido');
  });

  it('respeita o due_day 31 ajustado para fevereiro (mês curto)', () => {
    const dueDate = getMonthDueDate(2026, 2, 31);
    const status = getContractMonthStatus(
      { startDate: '2026-01-01', endDate: null, monthlyAmount: 300, valorPago: 0, dueDate },
      today,
    );
    expect(status).toBe('vencido');
  });
});

describe('getContractOpenSummary', () => {
  it('soma dois pagamentos no mesmo mês para considerá-lo quitado', () => {
    const { mesesEmAberto } = getContractOpenSummary(
      {
        startDate: '2026-01-10',
        endDate: null,
        monthlyAmount: 300,
        dueDay: 10,
        payments: [
          { referenceMonth: '2026-08-01', amount: 150 },
          { referenceMonth: '2026-08-01', amount: 150 },
        ],
      },
      today,
    );
    // jan..set vencidos = 9 meses; agosto quitado pela soma dos dois pagamentos -> 8 em aberto
    expect(mesesEmAberto).toBe(8);
  });

  it('calcula meses e valor em aberto de um contrato iniciado no ano anterior', () => {
    const { mesesEmAberto, valorEmAberto } = getContractOpenSummary(
      {
        startDate: '2025-01-15',
        endDate: null,
        monthlyAmount: 300,
        dueDay: 10,
        payments: [
          { referenceMonth: '2025-03-01', amount: 300 }, // março/2025 quitado
          { referenceMonth: '2025-06-01', amount: 100 }, // junho/2025 parcial, falta 200
        ],
      },
      today,
    );
    // jan/2025 a set/2026 = 21 meses; março quitado -> 20 em aberto
    expect(mesesEmAberto).toBe(20);
    // 19 meses cheios (300) + 200 de junho parcial
    expect(valorEmAberto).toBe(19 * 300 + 200);
  });
});
