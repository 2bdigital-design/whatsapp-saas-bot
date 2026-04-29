import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Atende Bem — Atendimento inteligente no WhatsApp',
  description: 'Automatize o atendimento da sua empresa com inteligência artificial.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
