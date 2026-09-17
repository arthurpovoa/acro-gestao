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

/**
 * Substitui os placeholders {chave} do modelo. Quando {nome} está vazio, remove
 * a vírgula solta que sobraria ("Olá {nome}, tudo bem?" -> "Olá, tudo bem?").
 */
export function fillTemplate(template: string, placeholders: Record<string, string | undefined>): string {
  let result = template;

  if (!placeholders.nome) {
    result = result.replace(/\s*\{nome\}\s*,/g, ',');
  }

  for (const [key, value] of Object.entries(placeholders)) {
    result = result.replaceAll(`{${key}}`, value ?? '');
  }

  return result;
}
