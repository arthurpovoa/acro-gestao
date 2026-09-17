import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 pt-2 text-sm text-gray-500 dark:text-gray-400">
      <p>
        {total === 0 ? 'Nenhum resultado' : `Mostrando ${start}–${end} de ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg border border-gray-300 disabled:opacity-40 dark:border-gray-700"
        >
          <ChevronLeft size={16} />
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Próxima página"
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg border border-gray-300 disabled:opacity-40 dark:border-gray-700"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
