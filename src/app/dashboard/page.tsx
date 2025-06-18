"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { Cafe } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Utensils, ListChecks, Edit, LayoutDashboard, ExternalLink } from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, isInitialized, getMenuItemsByCafeId, getMenuCategoriesForCafe, getCafeById } = useStore();
  const router = useRouter();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [menuItemCount, setMenuItemCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      if (!currentUser || currentUser.role !== 'cafeadmin' || !currentUser.cafeId) {
        router.push('/login?redirect=/dashboard');
      } else {
        const currentCafe = getCafeById(currentUser.cafeId);
        if (currentCafe) {
          setCafe(currentCafe);
          setMenuItemCount(getMenuItemsByCafeId(currentUser.cafeId).length);
          setCategoryCount(getMenuCategoriesForCafe(currentUser.cafeId).length);
        } else {
          // Cafe data not found for this admin, might indicate an issue or new registration without full sync
           console.warn("Cafe data not found for current admin's cafeId:", currentUser.cafeId);
           // Potentially redirect or show an error, for now, we'll let it render with "Kafe tidak ditemukan"
        }
        setIsLoading(false);
      }
    }
  }, [currentUser, isInitialized, router, getMenuItemsByCafeId, getMenuCategoriesForCafe, getCafeById]);

  if (!isInitialized || isLoading) {
    return <div className="text-center py-10">Memuat dashboard...</div>;
  }

  if (!currentUser || currentUser.role !== 'cafeadmin' || !cafe) {
     // This case should ideally be caught by the useEffect redirect, but as a fallback:
    return <div className="text-center py-10">Akses ditolak atau data kafe tidak ditemukan. Mengarahkan ke login...</div>;
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-headline font-bold text-primary">
          <LayoutDashboard className="inline-block mr-3 h-10 w-10 align-bottom" />
          Dashboard {cafe.name}
        </h1>
        <Button variant="outline" asChild>
          <Link href={`/menu/${cafe.id}`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Lihat Menu Publik
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-accent">
              <Utensils className="mr-2 h-6 w-6" />
              Item Menu
            </CardTitle>
            <CardDescription>Jumlah item menu yang Anda miliki.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{menuItemCount}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-accent">
              <ListChecks className="mr-2 h-6 w-6" />
              Kategori Menu
            </CardTitle>
            <CardDescription>Jumlah kategori menu yang telah dibuat.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{categoryCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button asChild size="lg" className="w-full">
            <Link href={`/cafes/${cafe.id}`}>
              <Utensils className="mr-2 h-5 w-5" />
              Kelola Menu Saya
            </Link>
          </Button>
          <Button asChild size="lg" className="w-full">
            <Link href={`/cafes/${cafe.id}/manage-categories`}>
              <ListChecks className="mr-2 h-5 w-5" />
              Kelola Kategori Saya
            </Link>
          </Button>
           <Button asChild variant="outline" size="lg" className="w-full">
            <Link href={`/edit-cafe/${cafe.id}`}>
              <Edit className="mr-2 h-5 w-5" />
              Edit Detail Kafe Saya
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
