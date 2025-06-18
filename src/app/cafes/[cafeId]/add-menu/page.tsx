
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
  const { getCafeById, isAuthenticated, isInitialized } = useStore();
  const router = useRouter();
  
  const [cafeName, setCafeName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated === false) {
        router.push(`/login?redirect=/cafes/${cafeId}/add-menu`);
      } else if (isAuthenticated === true) {
        setIsCheckingAuth(false);
        if (cafeId) {
          const cafe = getCafeById(cafeId);
          if (cafe) {
            setCafeName(cafe.name);
          } else {
            router.push('/');
          }
          setIsLoading(false);
        }
      }
    }
  }, [isAuthenticated, isInitialized, router, cafeId, getCafeById]);


  if (isCheckingAuth || !isInitialized || isAuthenticated === undefined) {
    return <div className="text-center py-10">Memuat dan memeriksa otentikasi...</div>;
  }
  if (!isAuthenticated) {
    return <div className="text-center py-10">Mengarahkan ke halaman login...</div>;
  }

  if (isLoading) {
    return <div className="text-center py-10">Memuat info kafe...</div>;
  }

  if (!cafeName) {
    return <div className="text-center py-10">Kafe tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6">
       <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Menu Kafe (Admin)
      </Button>
      <MenuItemForm cafeId={cafeId} cafeName={cafeName} />
    </div>
  );
}
