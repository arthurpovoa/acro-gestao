export function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Monta o link do wa.me. Retorna null quando não há número — quem chama decide
 * como avisar (ex.: "Cliente sem WhatsApp cadastrado").
 */
export function buildWhatsAppLink(
  whatsapp: string | null | undefined,
  message?: string,
): string | null {
  const digits = whatsapp ? sanitizeDigits(whatsapp) : '';
  if (!digits) return null;

  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
