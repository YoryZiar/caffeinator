
"use client";

import { useStore } from '@/lib/store';
import { CafeCard } from '@/components/CafeCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function HomePage() {
  const { cafes, isAuthenticated, isInitialized } = useStore();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-headline font-bold text-primary">Daftar Kafe</h1>
        {isInitialized && isAuthenticated && (
          <Button asChild>
            <Link href="/add-cafe">
              <PlusCircle className="mr-2 h-5 w-5" />
              Tambah Kafe Baru
            </Link>
          </Button>
        )}
      </div>

      {cafes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground mb-4">Belum ada kafe yang terdaftar.</p>
          {isInitialized && isAuthenticated ? (
            <p className="text-muted-foreground">Mulai dengan menambahkan kafe baru!</p>
          ) : (
            <p className="text-muted-foreground">Login sebagai admin untuk menambahkan kafe.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafes.map((cafe) => (
            <CafeCard key={cafe.id} cafe={cafe} />
          ))}
        </div>
      )}
    </div>
  );
}
