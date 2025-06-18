"use client";

import { MenuItemForm } from '@/components/MenuItemForm';
import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AddMenuItemPage() {
  const params = useParams();
  const cafeId = typeof params.cafeId === 'string' ? params.cafeId : '';
  const { getCafeById, currentUser, isInitialized } = useStore();
  const router = useRouter();
  
  const [cafeName, setCafeName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [canManage, setCanManage] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      if (!currentUser || currentUser.role !== 'cafeadmin' || currentUser.cafeId !== cafeId) {
        router.push(`/login?redirect=/cafes/${cafeId}/add-menu`);
        return;
      }
      setCanManage(true);
      setIsCheckingAuth(false);

      if (cafeId) {
        const cafe = getCafeById(cafeId);
        if (cafe) {
          setCafeName(cafe.name);
        } else {
          router.push('/dashboard'); // Cafe not found or mismatch
        }
        setIsLoading(false);
      }
    }
  }, [currentUser, isInitialized, router, cafeId, getCafeById]);


  if (isCheckingAuth || !isInitialized || currentUser === undefined) {
    return <div className="text-center py-10">Memuat dan memeriksa otentikasi...</div>;
  }
  if (!canManage) {
    return <div className="text-center py-10">Anda tidak diizinkan menambah menu untuk kafe ini. Mengarahkan...</div>;
  }

  if (isLoading) {
    return <div className="text-center py-10">Memuat info kafe...</div>;
  }

  if (!cafeName) {
    return <div className="text-center py-10">Kafe tidak ditemukan atau tidak sesuai.</div>;
  }

  return (
    <div className="space-y-6">
       <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Kelola Menu
      </Button>
      <MenuItemForm cafeId={cafeId} cafeName={cafeName} />
    </div>
  );
}
