import { createClient } from '@/features/clients/api';
import type { ClientStatus } from '@/features/clients/clientStatus';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headerLine = lines[0];
  if (!headerLine) return [];
  const headers = parseCSVLine(headerLine).map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = (values[index] ?? '').trim();
    });
    return row;
  });
}

function firstNonEmpty(row: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    if (row[key]) return row[key];
  }
  return '';
}

const VALID_STATUSES: ClientStatus[] = ['ativo', 'prospect', 'inativo'];

export interface ImportClientsResult {
  imported: number;
  skipped: number;
  errors: string[];
}

/**
 * Importa clientes de um CSV. Aceita cabeçalhos em português ou inglês
 * (ex.: "nome" ou "name", "responsavel" ou "contact_name").
 */
export async function importClientsCSV(text: string, userId: string): Promise<ImportClientsResult> {
  const rows = parseCSV(text);
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const name = firstNonEmpty(row, ['name', 'nome']);
    if (!name) {
      skipped++;
      continue;
    }

    const statusRaw = firstNonEmpty(row, ['status']).toLowerCase();
    const status: ClientStatus = VALID_STATUSES.includes(statusRaw as ClientStatus)
      ? (statusRaw as ClientStatus)
      : 'ativo';

    try {
      await createClient(
        {
          name,
          contact_name: firstNonEmpty(row, ['contact_name', 'responsavel', 'responsável']) || null,
          whatsapp: firstNonEmpty(row, ['whatsapp']).replace(/\D/g, '') || null,
          email: firstNonEmpty(row, ['email', 'e-mail']) || null,
          city: firstNonEmpty(row, ['city', 'cidade']) || null,
          source: firstNonEmpty(row, ['source', 'origem']) || null,
          status,
          notes: firstNonEmpty(row, ['notes', 'observacoes', 'observações']) || null,
        },
        userId,
      );
      imported++;
    } catch (error) {
      errors.push(`${name}: ${(error as Error).message}`);
    }
  }

  return { imported, skipped, errors };
}
