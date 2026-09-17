import { formatCurrency } from '@/lib/format';
import type { DashboardCategoria } from '../api';

export function CategoryBreakdown({ categorias }: { categorias: DashboardCategoria[] }) {
  if (categorias.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma saída registrada no ano.</p>;
  }

  const max = Math.max(...categorias.map((c) => c.valor));

  return (
    <ul className="flex flex-col gap-3">
      {categorias.map((c) => (
        <li key={c.categoria} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-200">{c.categoria}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(c.valor)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${max > 0 ? (c.valor / max) * 100 : 0}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
