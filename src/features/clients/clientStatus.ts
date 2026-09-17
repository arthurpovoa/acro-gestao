export type ClientStatus = 'ativo' | 'prospect' | 'inativo';

export const clientStatusOptions: ClientStatus[] = ['ativo', 'prospect', 'inativo'];

export const clientStatusLabels: Record<ClientStatus, string> = {
  ativo: 'Ativo',
  prospect: 'Prospect',
  inativo: 'Inativo',
};

export const clientStatusTone: Record<ClientStatus, 'pago' | 'atencao' | 'inativo'> = {
  ativo: 'pago',
  prospect: 'atencao',
  inativo: 'inativo',
};
