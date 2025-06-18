import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Caffeinator - Menu Online Anda',
  description: 'Aplikasi menu online untuk kafe dan restoran.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <StoreProvider>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
          <footer className="py-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Caffeinator. Dibuat dengan ❤️.
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
