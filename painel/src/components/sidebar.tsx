'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import {
  LayoutDashboard, MessageSquare, BookOpen, Settings, QrCode, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard',                label: 'Visão Geral',  icon: LayoutDashboard },
  { href: '/dashboard/conversas',      label: 'Conversas',    icon: MessageSquare },
  { href: '/dashboard/treinamento',    label: 'Treinamento',  icon: BookOpen },
  { href: '/dashboard/qrcode',         label: 'WhatsApp',     icon: QrCode },
  { href: '/dashboard/configuracoes',  label: 'Configurações',icon: Settings },
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
    <aside className="w-56 bg-white border-r flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b">
        <span className="text-green-600 font-bold text-lg">WhatsBot</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
