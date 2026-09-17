import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '@/app/providers/ThemeProvider';
import { formatCurrency } from '@/lib/format';
import { monthNamesShort } from '@/lib/dates';
import type { DashboardMonth } from '../api';

interface MonthlyBarChartProps {
  meses: DashboardMonth[];
}

export default function MonthlyBarChart({ meses }: MonthlyBarChartProps) {
  const { theme } = useTheme();
  const entradaColor = theme === 'dark' ? '#4ADE80' : '#16A34A';
  const saidaColor = theme === 'dark' ? '#F87171' : '#DC2626';
  const gridColor = theme === 'dark' ? '#374151' : '#E5E7EB';
  const textColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';

  const data = meses.map((m) => ({
    name: monthNamesShort[m.mes - 1],
    Entradas: m.total_entradas,
    Saídas: m.saidas,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={2} barCategoryGap="20%">
        <CartesianGrid vertical={false} stroke={gridColor} />
        <XAxis dataKey="name" tick={{ fill: textColor, fontSize: 12 }} axisLine={{ stroke: gridColor }} tickLine={false} />
        <YAxis
          tick={{ fill: textColor, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) => formatCurrency(value).replace('R$', '').trim()}
          width={64}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            background: theme === 'dark' ? '#111827' : '#fff',
            border: `1px solid ${gridColor}`,
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="Entradas" fill={entradaColor} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Saídas" fill={saidaColor} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
