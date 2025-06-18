
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Coffee, List, PlusCircle, Settings, LogIn, LogOut } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { isAuthenticated, logout, isInitialized } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Coffee className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg">Caffeinator</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-1 sm:space-x-2 md:space-x-4">
          <Button variant="ghost" asChild className="text-xs sm:text-sm">
            <Link href="/" >
              <List className="mr-1 h-4 w-4" />
              Daftar Kafe
            </Link>
          </Button>
          {isInitialized && isAuthenticated && (
            <>
              <Button variant="ghost" asChild className="text-xs sm:text-sm">
                <Link href="/add-cafe">
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Tambah Kafe
                </Link>
              </Button>
              <Button variant="ghost" asChild className="text-xs sm:text-sm">
                <Link href="/manage-categories">
                  <Settings className="mr-1 h-4 w-4" />
                  Kelola Kategori
                </Link>
              </Button>
            </>
          )}
        </nav>
        <div className="flex items-center space-x-2">
          {isInitialized && isAuthenticated === false && (
            <Button variant="outline" asChild className="text-xs sm:text-sm">
              <Link href="/login">
                <LogIn className="mr-1 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
          {isInitialized && isAuthenticated === true && (
            <Button variant="outline" onClick={handleLogout} className="text-xs sm:text-sm">
              <LogOut className="mr-1 h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
