const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number | null | undefined): string {
  return currencyFormatter.format(value ?? 0);
}

/** Só o número, sem "R$" — para compor mensagens de WhatsApp (ex.: "R$ {valor}"). */
export function formatNumber(value: number | null | undefined): string {
  return numberFormatter.format(value ?? 0);
}

export function formatPercent(value: number | null | undefined): string {
  return `${(value ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}
