
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MenuItemForm } from '@/components/MenuItemForm';
import { useStore } from '@/lib/store';
import type { Cafe, MenuItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditMenuItemPage() {
  const params = useParams();
  const router = useRouter();
  const { getCafeById, getMenuItemById, isAuthenticated, isInitialized } = useStore();

  const cafeId = typeof params.cafeId === 'string' ? params.cafeId : '';
  const menuItemId = typeof params.menuItemId === 'string' ? params.menuItemId : '';

  const [cafe, setCafe] = useState<Cafe | null | undefined>(undefined);
  const [menuItem, setMenuItem] = useState<MenuItem | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated === false) {
        router.push(`/login?redirect=/cafes/${cafeId}/edit-menu/${menuItemId}`);
      } else if (isAuthenticated === true) {
        setIsCheckingAuth(false);
        if (cafeId && menuItemId) {
          const foundCafe = getCafeById(cafeId);
          const foundMenuItem = getMenuItemById(menuItemId);
          
          setCafe(foundCafe);
          setMenuItem(foundMenuItem);
          setIsLoading(false);

          if (!foundCafe || !foundMenuItem) {
            router.push(foundCafe ? `/cafes/${cafeId}` : '/'); 
          }
        } else {
          setIsLoading(false);
          router.push('/'); 
        }
      }
    }
  }, [isAuthenticated, isInitialized, router, cafeId, menuItemId, getCafeById, getMenuItemById]);

  if (isCheckingAuth || !isInitialized || isAuthenticated === undefined) {
    return <div className="text-center py-10">Memuat dan memeriksa otentikasi...</div>;
  }
  if (!isAuthenticated) {
    return <div className="text-center py-10">Mengarahkan ke halaman login...</div>;
  }

  if (isLoading || cafe === undefined || menuItem === undefined) {
    return <div className="text-center py-10">Memuat data item menu...</div>;
  }

  if (cafe === null || menuItem === null) {
    return <div className="text-center py-10">Data kafe atau item menu tidak ditemukan. Anda akan diarahkan.</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push(`/cafes/${cafeId}`)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Menu Kafe (Admin)
      </Button>
      <MenuItemForm
        isEditMode={true}
        initialMenuItemData={menuItem}
        cafeId={cafe.id}
        cafeName={cafe.name}
      />
    </div>
  );
}
