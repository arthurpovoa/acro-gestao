export type ContractSituacao = 'ativo' | 'a_iniciar' | 'encerrado';

export const contractSituacaoLabels: Record<ContractSituacao, string> = {
  ativo: 'Ativo',
  a_iniciar: 'A iniciar',
  encerrado: 'Encerrado',
};

export const contractSituacaoTone: Record<ContractSituacao, 'pago' | 'atencao' | 'inativo'> = {
  ativo: 'pago',
  a_iniciar: 'atencao',
  encerrado: 'inativo',
};

export const monthNamesShort = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];
