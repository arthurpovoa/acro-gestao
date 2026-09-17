type Tone = 'pago' | 'atencao' | 'atrasado' | 'inativo' | 'neutro';

interface BadgeProps {
  children: string;
  tone: Tone;
}

const toneClasses: Record<Tone, string> = {
  pago: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  atencao: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  atrasado: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  inativo: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  neutro: 'bg-primary-50 text-primary dark:bg-primary-800/40 dark:text-primary-200',
};

export function Badge({ children, tone }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
