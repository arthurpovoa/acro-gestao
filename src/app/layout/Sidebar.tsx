import { NavLink } from 'react-router-dom';
import { navItems } from './navItems';

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 lg:flex lg:flex-col">
      <p className="mb-6 px-2 text-lg font-semibold text-primary dark:text-primary-200">
        Acro Gestão
      </p>
      <nav aria-label="Navegação principal" className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-touch items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary dark:bg-primary-800/40 dark:text-primary-200'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`
            }
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
