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
  const { getCafeById, getMenuItemById, currentUser, isInitialized } = useStore();

  const cafeId = typeof params.cafeId === 'string' ? params.cafeId : '';
  const menuItemId = typeof params.menuItemId === 'string' ? params.menuItemId : '';

  const [cafe, setCafe] = useState<Cafe | null | undefined>(undefined);
  const [menuItem, setMenuItem] = useState<MenuItem | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      if (!currentUser || currentUser.role !== 'cafeadmin' || currentUser.cafeId !== cafeId) {
        router.push(`/login?redirect=/cafes/${cafeId}/edit-menu/${menuItemId}`);
        return;
      }
      setCanManage(true);
      setIsCheckingAuth(false);

      if (cafeId && menuItemId) {
        const foundCafe = getCafeById(cafeId);
        const foundMenuItem = getMenuItemById(menuItemId);
        
        // Ensure the menu item belongs to the cafe the admin is managing
        if (foundCafe && foundMenuItem && foundMenuItem.cafeId === cafeId) {
            setCafe(foundCafe);
            setMenuItem(foundMenuItem);
        } else {
            setCafe(null); // Indicate error or mismatch
            setMenuItem(null);
            router.push(foundCafe ? `/cafes/${cafeId}` : '/dashboard'); 
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
        router.push('/dashboard'); 
      }
    }
  }, [currentUser, isInitialized, router, cafeId, menuItemId, getCafeById, getMenuItemById]);

  if (isCheckingAuth || !isInitialized || currentUser === undefined) {
    return <div className="text-center py-10">Memuat dan memeriksa otentikasi...</div>;
  }
  if (!canManage) {
    return <div className="text-center py-10">Anda tidak diizinkan mengedit menu ini. Mengarahkan...</div>;
  }

  if (isLoading || cafe === undefined || menuItem === undefined) {
    return <div className="text-center py-10">Memuat data item menu...</div>;
  }

  if (cafe === null || menuItem === null) {
    return <div className="text-center py-10">Data kafe atau item menu tidak ditemukan/tidak sesuai. Anda akan diarahkan.</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push(`/cafes/${cafeId}`)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Kelola Menu
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
