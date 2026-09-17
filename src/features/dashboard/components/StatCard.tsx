import { Card } from '@/components/ui/Card';

type Tone = 'neutro' | 'pago' | 'atencao' | 'atrasado';

const toneClasses: Record<Tone, string> = {
  neutro: 'text-gray-900 dark:text-gray-100',
  pago: 'text-status-pago',
  atencao: 'text-status-atencao',
  atrasado: 'text-status-atrasado',
};

interface StatCardProps {
  label: string;
  value: string;
  tone?: Tone;
}

export function StatCard({ label, value, tone = 'neutro' }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-xl font-semibold ${toneClasses[tone]}`}>{value}</p>
    </Card>
  );
}
