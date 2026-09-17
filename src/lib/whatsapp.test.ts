import { describe, expect, it } from 'vitest';
import { buildWhatsAppLink, fillTemplate, sanitizeDigits } from './whatsapp';

const AVULSO_A_VENCER =
  'Olá {nome}, tudo bem? Passando para lembrar do pagamento de R$ {valor} referente a {descricao}, com vencimento em {vencimento}. Qualquer dúvida, estou à disposição!';

describe('sanitizeDigits', () => {
  it('remove tudo que não é dígito', () => {
    expect(sanitizeDigits('(61) 99823-6056')).toBe('61998236056');
  });
});

describe('buildWhatsAppLink', () => {
  it('retorna null quando não há número', () => {
    expect(buildWhatsAppLink(null)).toBeNull();
    expect(buildWhatsAppLink('')).toBeNull();
  });

  it('monta o link só com o número quando não há mensagem', () => {
    expect(buildWhatsAppLink('61998236056')).toBe('https://wa.me/61998236056');
  });

  it('sanitiza o número antes de montar o link', () => {
    expect(buildWhatsAppLink('(61) 99823-6056')).toBe('https://wa.me/61998236056');
  });

  it('inclui a mensagem codificada quando fornecida', () => {
    expect(buildWhatsAppLink('61998236056', 'Olá, tudo bem?')).toBe(
      'https://wa.me/61998236056?text=Ol%C3%A1%2C%20tudo%20bem%3F',
    );
  });
});

describe('fillTemplate', () => {
  it('substitui todos os placeholders do modelo', () => {
    const result = fillTemplate(AVULSO_A_VENCER, {
      nome: 'Fernanda',
      valor: '1.234,56',
      descricao: 'Site institucional',
      vencimento: '20/09/2026',
    });
    expect(result).toBe(
      'Olá Fernanda, tudo bem? Passando para lembrar do pagamento de R$ 1.234,56 referente a Site institucional, com vencimento em 20/09/2026. Qualquer dúvida, estou à disposição!',
    );
  });

  it('quando o nome está vazio, a saudação fica só "Olá"', () => {
    const result = fillTemplate(AVULSO_A_VENCER, {
      nome: '',
      valor: '1.234,56',
      descricao: 'Site institucional',
      vencimento: '20/09/2026',
    });
    expect(result.startsWith('Olá, tudo bem?')).toBe(true);
  });
});
