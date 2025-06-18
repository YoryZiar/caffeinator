"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CategoryManager } from '@/components/CategoryManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Cafe } from '@/lib/types';

export default function ManageCafeCategoriesPage() {
  const router = useRouter();
  const params = useParams();
  const cafeId = typeof params.cafeId === 'string' ? params.cafeId : '';
  const { currentUser, isInitialized, getCafeById } = useStore();
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      if (!currentUser || currentUser.role !== 'cafeadmin' || currentUser.cafeId !== cafeId) {
        router.push(`/login?redirect=/cafes/${cafeId}/manage-categories`);
        return;
      }
      setCanManage(true);
      setIsCheckingAuth(false);

      const currentCafe = getCafeById(cafeId);
      if (currentCafe) {
        setCafe(currentCafe);
      } else {
        router.push('/dashboard'); // Cafe not found or mismatch
      }
      setIsLoading(false);
    }
  }, [currentUser, isInitialized, router, cafeId, getCafeById]);

  if (isCheckingAuth || !isInitialized || currentUser === undefined || isLoading) {
    return <div className="text-center py-10">Memuat dan memeriksa otentikasi...</div>;
  }
  if (!canManage) {
    return <div className="text-center py-10">Anda tidak diizinkan mengelola kategori untuk kafe ini. Mengarahkan...</div>;
  }
  
  if (!cafe) {
     return <div className="text-center py-10">Kafe tidak ditemukan atau tidak sesuai.</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push('/dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Dashboard
      </Button>
      <CategoryManager cafeId={cafe.id} cafeName={cafe.name} />
    </div>
  );
}
