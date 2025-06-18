
"use client";

import React from 'react'; // Added React import
import { useStore } from '@/lib/store';
import { CafeCard } from '@/components/CafeCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, BarChart3, ListTree, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const { cafes, currentUser, isInitialized, getTotalMenuItemCount, getTotalUniqueCategoryCount } = useStore();

  const displayedCafes = React.useMemo(() => {
    if (!isInitialized) return [];
    if (currentUser?.role === 'cafeadmin' && currentUser.cafeId) {
      return cafes.filter(cafe => cafe.id === currentUser.cafeId);
    }
    return cafes;
  }, [cafes, currentUser, isInitialized]);

  if (!isInitialized) {
    return <div className="text-center py-10">Memuat data...</div>;
  }

  const SuperAdminStats = () => (
    <div className="mb-8 grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Kafe Terdaftar</CardTitle>
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cafes.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Item Menu (Semua Kafe)</CardTitle>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTotalMenuItemCount()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Kategori (Unik, Semua Kafe)</CardTitle>
          <ListTree className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTotalUniqueCategoryCount()}</div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-8">
      {currentUser?.role === 'superadmin' && <SuperAdminStats />}
      
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-headline font-bold text-primary">
          {currentUser?.role === 'cafeadmin' && cafes.find(c => c.id === currentUser.cafeId) 
            ? `Kafe Saya: ${cafes.find(c => c.id === currentUser.cafeId)?.name}`
            : "Daftar Kafe"}
        </h1>
        {isInitialized && currentUser && currentUser.role === 'superadmin' && (
          <Button asChild>
            <Link href="/add-cafe-by-superadmin">
              <PlusCircle className="mr-2 h-5 w-5" />
              Tambah Kafe (Superadmin)
            </Link>
          </Button>
        )}
      </div>

      {displayedCafes.length === 0 ? (
        <div className="text-center py-12">
          {currentUser?.role === 'cafeadmin' ? (
             <p className="text-xl text-muted-foreground mb-4">Kafe Anda belum terdata atau ada masalah.</p>
          ) : (
            <p className="text-xl text-muted-foreground mb-4">Belum ada kafe yang terdaftar.</p>
          )}

          {isInitialized && (!currentUser || (currentUser.role !== 'superadmin' && currentUser.role !== 'cafeadmin')) && (
             <p className="text-muted-foreground">Daftar sebagai pemilik kafe untuk menambahkan kafe Anda!</p>
          )}
           {isInitialized && currentUser && currentUser.role === 'superadmin' && !cafes.length && (
            <p className="text-muted-foreground">Mulai dengan menambahkan kafe baru sebagai superadmin.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCafes.map((cafe) => (
            <CafeCard key={cafe.id} cafe={cafe} />
          ))}
        </div>
      )}
    </div>
  );
}
