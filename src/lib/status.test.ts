import { describe, expect, it } from 'vitest';
import { getChargeStatus, getDaysLate } from './status';

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
