import { NavLink } from 'react-router-dom';
import { navItems } from './navItems';

export function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:hidden"
    >
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex min-h-touch flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium ${
              isActive
                ? 'text-primary dark:text-primary-200'
                : 'text-gray-500 dark:text-gray-400'
            }`
          }
        >
          <Icon size={20} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
