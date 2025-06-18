
"use client";

import { useStore } from '@/lib/store';
import type { MenuItem as MenuItemType } from '@/lib/types';
import { MenuItemCard } from '@/components/MenuItemCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, PlusCircle, UtensilsCrossed } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CafeMenuPage() { // This is now the ADMIN menu page
  const params = useParams();
  const cafeId = typeof params.cafeId === 'string' ? params.cafeId : '';
  
  const { getCafeById, getMenuItemsByCafeId, isAuthenticated, isInitialized } = useStore();
  const router = useRouter();

  const [cafeName, setCafeName] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated === false) {
        router.push(`/login?redirect=/cafes/${cafeId}`);
      } else if (isAuthenticated === true) {
        setIsCheckingAuth(false);
        if (cafeId) {
          const cafe = getCafeById(cafeId);
          if (cafe) {
            setCafeName(cafe.name);
            setMenuItems(getMenuItemsByCafeId(cafeId));
          } else {
            router.push('/'); 
          }
          setIsLoading(false);
        }
      }
    }
  }, [isAuthenticated, isInitialized, router, cafeId, getCafeById, getMenuItemsByCafeId]);


  if (isCheckingAuth || !isInitialized || isAuthenticated === undefined) {
    return <div className="text-center py-10">Memuat dan memeriksa otentikasi...</div>;
  }
  if (!isAuthenticated) {
    return <div className="text-center py-10">Mengarahkan ke halaman login...</div>;
  }

  if (isLoading) {
    return <div className="text-center py-10">Memuat menu kafe...</div>;
  }

  if (!cafeName) {
    return <div className="text-center py-10">Kafe tidak ditemukan.</div>;
  }

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {} as Record<string, MenuItemType[]>);

  return (
    <div className="space-y-8">
      <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Daftar Kafe (Admin)
      </Button>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-headline font-bold text-primary">Kelola Menu {cafeName}</h1>
        <Button asChild>
          <Link href={`/cafes/${cafeId}/add-menu`}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Tambah Item Menu
          </Link>
        </Button>
      </div>

      {menuItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <UtensilsCrossed className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-xl text-muted-foreground mb-2">Menu masih kosong.</p>
          <p className="text-muted-foreground">Tambahkan item pertama ke menu kafe ini!</p>
        </div>
      ) : (
        Object.entries(groupedMenuItems).map(([category, items]) => (
          <section key={category} className="space-y-4">
            <h2 className="text-2xl font-headline text-accent border-b-2 border-accent/30 pb-2">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <MenuItemCard key={item.id} menuItem={item} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
