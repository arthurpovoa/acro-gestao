export type TransactionType = 'entrada' | 'saida';

export const transactionTypeOptions: TransactionType[] = ['entrada', 'saida'];

export const transactionTypeLabels: Record<TransactionType, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
};

export const transactionTypeTone: Record<TransactionType, 'pago' | 'atrasado'> = {
  entrada: 'pago',
  saida: 'atrasado',
};
