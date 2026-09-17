import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface ListEditorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}

export function ListEditor({ label, items, onChange }: ListEditorProps) {
  const [draft, setDraft] = useState('');

  function addItem() {
    const value = draft.trim();
    if (!value || items.includes(value)) {
      setDraft('');
      return;
    }
    onChange([...items, value]);
    setDraft('');
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={item}
            className="flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-3 pr-1.5 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            {item}
            <button
              type="button"
              onClick={() => removeItem(index)}
              aria-label={`Remover ${item}`}
              className="flex h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">Nenhum item ainda.</p>}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder="Adicionar item..."
          className="min-h-touch flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        <button
          type="button"
          onClick={addItem}
          aria-label={`Adicionar em ${label}`}
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
