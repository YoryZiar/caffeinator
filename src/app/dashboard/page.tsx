
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
           console.warn("Cafe data not found for current admin's cafeId:", currentUser.cafeId);
        }
        setIsLoading(false);
      }
    }
  }, [currentUser, isInitialized, router, getMenuItemsByCafeId, getMenuCategoriesForCafe, getCafeById]);

  if (!isInitialized || isLoading) {
    return <div className="text-center py-10">Memuat dashboard...</div>;
  }

  if (!currentUser || currentUser.role !== 'cafeadmin' || !cafe) {
    return <div className="text-center py-10">Akses ditolak atau data kafe tidak ditemukan. Mengarahkan ke login...</div>;
  }
  
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-primary flex items-center">
          <LayoutDashboard className="inline-block mr-2 sm:mr-3 h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 align-bottom" />
          Dashboard {cafe.name}
        </h1>
        <Button variant="outline" asChild size="sm" className="sm:size-auto">
          <Link href={`/menu/${cafe.id}`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Lihat Menu Publik
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-accent text-lg sm:text-xl">
              <Utensils className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              Item Menu
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Jumlah item menu yang Anda miliki.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{menuItemCount}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-accent text-lg sm:text-xl">
              <ListChecks className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              Kategori Menu
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Jumlah kategori menu yang telah dibuat.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{categoryCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 pt-0">
          <Button asChild size="default" className="w-full sm:size-lg">
            <Link href={`/cafes/${cafe.id}`}>
              <Utensils className="mr-2 h-5 w-5" />
              Kelola Menu Saya
            </Link>
          </Button>
          <Button asChild size="default" className="w-full sm:size-lg">
            <Link href={`/cafes/${cafe.id}/manage-categories`}>
              <ListChecks className="mr-2 h-5 w-5" />
              Kelola Kategori Saya
            </Link>
          </Button>
           <Button asChild variant="outline" size="default" className="w-full sm:size-lg">
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
