'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { LayoutDashboard, MessageSquare, BookOpen, Settings, QrCode, LogOut, Lightbulb, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard',               label: 'Visão Geral',       icon: LayoutDashboard },
  { href: '/dashboard/conversas',     label: 'Conversas',         icon: MessageSquare },
  { href: '/dashboard/instrucoes',    label: 'Instruções',        icon: Lightbulb },
  { href: '/dashboard/treinamento',   label: 'Treinar Assistente',icon: BookOpen },
  { href: '/dashboard/qrcode',        label: 'Conectar WhatsApp', icon: QrCode },
  { href: '/dashboard/configuracoes', label: 'Configurações',     icon: Settings },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 glass-dark border-r border-white/[0.08] flex flex-col h-full min-h-screen">
      {/* Header */}
      <div className="px-5 py-5 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <span className="text-white font-bold text-[15px] leading-none">Atende Bem</span>
            <p className="text-white/40 text-xs mt-0.5">Painel de gestão</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
              )}
            >
              <Icon size={16} className={active ? 'text-green-400' : 'text-white/40 group-hover:text-white/70'} />
              <span>{label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.08]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-all"
        >
          <LogOut size={16} />
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
