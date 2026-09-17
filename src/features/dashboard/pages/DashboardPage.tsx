import { lazy, Suspense, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, Th, Td } from '@/components/ui/Table';
import { formatCurrency } from '@/lib/format';
import { monthNamesShort } from '@/lib/dates';
import { useContractsWithOpenMonths, useDashboard, useOverdueCharges } from '../hooks';
import { StatCard } from '../components/StatCard';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { CollectNowList } from '../components/CollectNowList';

const MonthlyBarChart = lazy(() => import('../components/MonthlyBarChart'));

function currentYear(): number {
  return new Date().getFullYear();
}

function negClass(value: number): string {
  return value < 0 ? 'text-status-atrasado' : 'text-gray-900 dark:text-gray-100';
}

export default function DashboardPage() {
  const [year, setYear] = useState(currentYear());
  const { data, isLoading } = useDashboard(year);
  const { data: overdueCharges, isLoading: isLoadingCharges } = useOverdueCharges();
  const { data: openContracts, isLoading: isLoadingContracts } = useContractsWithOpenMonths();

  const cards = data?.cards;
  const totals = (data?.meses ?? []).reduce(
    (acc, m) => ({
      projetos_avulsos: acc.projetos_avulsos + m.projetos_avulsos,
      mensalidades: acc.mensalidades + m.mensalidades,
      outras_entradas: acc.outras_entradas + m.outras_entradas,
      total_entradas: acc.total_entradas + m.total_entradas,
      saidas: acc.saidas + m.saidas,
      resultado: acc.resultado + m.resultado,
    }),
    { projetos_avulsos: 0, mensalidades: 0, outras_entradas: 0, total_entradas: 0, saidas: 0, resultado: 0 },
  );
  const acumuladoFinal = data?.meses.at(-1)?.acumulado ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Painel</h1>
        <div className="flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setYear((y) => y - 1)}
            aria-label="Ano anterior"
            className="flex min-h-touch min-w-touch items-center justify-center text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-12 text-center text-sm font-medium">{year}</span>
          <button
            type="button"
            onClick={() => setYear((y) => y + 1)}
            aria-label="Próximo ano"
            className="flex min-h-touch min-w-touch items-center justify-center text-gray-600 dark:text-gray-300"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {isLoading || !cards ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard label="A receber (avulsos)" value={formatCurrency(cards.a_receber)} />
          <StatCard label="Em atraso" value={formatCurrency(cards.em_atraso)} tone="atrasado" />
          <StatCard label="Avulsos vencendo em 7 dias" value={formatCurrency(cards.vencendo_7_dias)} tone="atencao" />
          <StatCard label="Entradas do mês" value={formatCurrency(cards.entradas_mes)} tone="pago" />
          <StatCard label="Saídas do mês" value={formatCurrency(cards.saidas_mes)} tone="atrasado" />
          <StatCard
            label="Resultado do mês"
            value={formatCurrency(cards.resultado_mes)}
            tone={cards.resultado_mes >= 0 ? 'pago' : 'atrasado'}
          />
          <StatCard label="Receita recorrente mensal" value={formatCurrency(cards.receita_recorrente_mensal)} />
          <StatCard label="Mensalidades ativas" value={String(cards.mensalidades_ativas)} />
          <StatCard label="Meses em aberto" value={String(cards.meses_em_aberto)} tone="atencao" />
          <StatCard label="Cobranças atrasadas" value={String(cards.cobrancas_atrasadas)} tone="atrasado" />
          <StatCard label="Projetos em andamento" value={String(cards.projetos_andamento)} />
          <StatCard label="Clientes ativos" value={String(cards.clientes_ativos)} />
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-base font-semibold">Entradas × Saídas</h2>
        {isLoading || !data ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <MonthlyBarChart meses={data.meses} />
          </Suspense>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-base font-semibold">Resumo mensal</h2>
        {isLoading || !data ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Mês</Th>
                  <Th>Projetos avulsos</Th>
                  <Th>Mensalidades</Th>
                  <Th>Outras entradas</Th>
                  <Th>Total entradas</Th>
                  <Th>Saídas</Th>
                  <Th>Resultado</Th>
                  <Th>Acumulado</Th>
                </tr>
              </thead>
              <tbody>
                {data.meses.map((m) => (
                  <tr key={m.mes}>
                    <Td>{monthNamesShort[m.mes - 1]}</Td>
                    <Td>{formatCurrency(m.projetos_avulsos)}</Td>
                    <Td>{formatCurrency(m.mensalidades)}</Td>
                    <Td>{formatCurrency(m.outras_entradas)}</Td>
                    <Td>{formatCurrency(m.total_entradas)}</Td>
                    <Td>{formatCurrency(m.saidas)}</Td>
                    <Td className={negClass(m.resultado)}>{formatCurrency(m.resultado)}</Td>
                    <Td className={negClass(m.acumulado)}>{formatCurrency(m.acumulado)}</Td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <Td>Total</Td>
                  <Td>{formatCurrency(totals.projetos_avulsos)}</Td>
                  <Td>{formatCurrency(totals.mensalidades)}</Td>
                  <Td>{formatCurrency(totals.outras_entradas)}</Td>
                  <Td>{formatCurrency(totals.total_entradas)}</Td>
                  <Td>{formatCurrency(totals.saidas)}</Td>
                  <Td className={negClass(totals.resultado)}>{formatCurrency(totals.resultado)}</Td>
                  <Td className={negClass(acumuladoFinal)}>{formatCurrency(acumuladoFinal)}</Td>
                </tr>
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold">Saídas por categoria</h2>
          {isLoading || !data ? <Skeleton className="h-40 w-full" /> : <CategoryBreakdown categorias={data.saidas_por_categoria} />}
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold">Cobrar agora</h2>
          {isLoadingCharges || isLoadingContracts ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <CollectNowList charges={overdueCharges ?? []} contracts={openContracts ?? []} />
          )}
        </Card>
      </div>
    </div>
  );
}
