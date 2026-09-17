const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(value: number | null | undefined): string {
  return currencyFormatter.format(value ?? 0);
}

export function formatPercent(value: number | null | undefined): string {
  return `${(value ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}
