import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Эвакуация CRM · Демо MELUWI',
  icons: { icon: '/favicon.svg' },
  description:
    'Попробуйте работу диспетчера и водителя в демонстрации CRM службы эвакуации. Только вымышленные данные.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
