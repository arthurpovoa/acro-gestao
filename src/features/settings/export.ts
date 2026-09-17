import { supabase } from '@/lib/supabase';

type TableName =
  | 'clients'
  | 'projects'
  | 'charges'
  | 'recurring_contracts'
  | 'recurring_payments'
  | 'transactions'
  | 'settings';

async function fetchAll(table: TableName): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return (data ?? []) as Record<string, unknown>[];
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const EXPORT_TABLES = [
  { table: 'clients', csvName: 'clientes' },
  { table: 'projects', csvName: 'projetos' },
  { table: 'charges', csvName: 'cobrancas' },
  { table: 'recurring_contracts', csvName: 'contratos' },
  { table: 'recurring_payments', csvName: 'pagamentos' },
  { table: 'transactions', csvName: 'financeiro' },
  { table: 'settings', csvName: 'configuracoes' },
] as const;

export async function exportAllDataJSON(): Promise<void> {
  const entries = await Promise.all(EXPORT_TABLES.map(({ table }) => fetchAll(table)));
  const payload: Record<string, unknown> = { exported_at: new Date().toISOString() };
  EXPORT_TABLES.forEach(({ table }, index) => {
    payload[table] = entries[index];
  });
  downloadFile('acro-gestao-dados.json', JSON.stringify(payload, null, 2), 'application/json');
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCSV(rows: Record<string, unknown>[]): string | null {
  const first = rows[0];
  if (!first) return null;
  const headers = Object.keys(first);
  const lines = [headers.join(','), ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(','))];
  return lines.join('\n');
}

export async function exportAllDataCSV(): Promise<void> {
  for (const { table, csvName } of EXPORT_TABLES) {
    const rows = await fetchAll(table);
    const csv = toCSV(rows);
    if (!csv) continue;
    downloadFile(`acro-gestao-${csvName}.csv`, csv, 'text/csv');
    // pequena pausa entre downloads para o navegador não bloquear os múltiplos arquivos
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}
