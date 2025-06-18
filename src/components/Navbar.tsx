"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Coffee, List, PlusCircle } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Coffee className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg">Caffeinator</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="text-sm font-medium">
              <List className="mr-2 h-4 w-4" />
              Daftar Kafe
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/add-cafe" className="text-sm font-medium">
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Kafe Baru
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
