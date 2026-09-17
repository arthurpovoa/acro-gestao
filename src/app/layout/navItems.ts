import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarClock,
  Receipt,
  Wallet,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { to: '/painel', label: 'Painel', icon: LayoutDashboard },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/projetos', label: 'Projetos', icon: Briefcase },
  { to: '/mensalidades', label: 'Mensalidades', icon: CalendarClock },
  { to: '/cobrancas', label: 'Cobranças', icon: Receipt },
  { to: '/financeiro', label: 'Financeiro', icon: Wallet },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];
