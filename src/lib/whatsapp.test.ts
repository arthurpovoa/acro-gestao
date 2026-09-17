import { describe, expect, it } from 'vitest';
import { buildWhatsAppLink, sanitizeDigits } from './whatsapp';

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
