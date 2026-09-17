export type ProjectStatus = 'orcamento' | 'andamento' | 'aguardando' | 'entregue' | 'cancelado';

export const projectStatusOptions: ProjectStatus[] = [
  'orcamento',
  'andamento',
  'aguardando',
  'entregue',
  'cancelado',
];

export const projectStatusLabels: Record<ProjectStatus, string> = {
  orcamento: 'Orçamento',
  andamento: 'Em andamento',
  aguardando: 'Aguardando',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const projectStatusTone: Record<ProjectStatus, 'pago' | 'atencao' | 'inativo' | 'neutro'> = {
  orcamento: 'neutro',
  andamento: 'atencao',
  aguardando: 'atencao',
  entregue: 'pago',
  cancelado: 'inativo',
};

export type BillingType = 'unico' | 'parcelado';

export const billingTypeLabels: Record<BillingType, string> = {
  unico: 'Pagamento único',
  parcelado: 'Parcelado',
};
