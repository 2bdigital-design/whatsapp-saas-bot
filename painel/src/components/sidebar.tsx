'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import {
  LayoutDashboard, MessageSquare, BookOpen, Settings, QrCode, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard',                label: 'Visão Geral',    icon: LayoutDashboard },
  { href: '/dashboard/conversas',      label: 'Conversas',      icon: MessageSquare },
  { href: '/dashboard/treinamento',    label: 'Treinamento',    icon: BookOpen },
  { href: '/dashboard/qrcode',         label: 'Conectar WhatsApp', icon: QrCode },
  { href: '/dashboard/configuracoes',  label: 'Configurações',  icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-60 bg-white border-r flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <span className="text-gray-900 font-bold text-base leading-none">Atende Bem</span>
            <p className="text-gray-400 text-xs mt-0.5">Painel de gestão</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl w-full transition-colors"
        >
          <LogOut size={17} />
          Sair
        </button>
      </div>
    </aside>
  );
}
