import { Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useTheme } from '@/app/providers/ThemeProvider';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  return (
    <header className="flex min-h-touch items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm font-semibold text-primary dark:text-primary-200 lg:hidden">
        Acro Gestão
      </p>
      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          onClick={() => void signOut()}
          aria-label="Sair"
          className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
