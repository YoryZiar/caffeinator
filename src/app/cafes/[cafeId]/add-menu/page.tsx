
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
  const { getCafeById } = useStore();
  const router = useRouter();
  
  const [cafeName, setCafeName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cafeId) {
      const cafe = getCafeById(cafeId);
      if (cafe) {
        setCafeName(cafe.name);
      } else {
        // Cafe not found, redirect
        router.push('/');
      }
      setIsLoading(false);
    }
  }, [cafeId, getCafeById, router]);


  if (isLoading) {
    return <div className="text-center py-10">Memuat info kafe...</div>;
  }

  if (!cafeName) {
    // This case should ideally be handled by the redirect in useEffect
    return <div className="text-center py-10">Kafe tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6">
       <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Menu Kafe
      </Button>
      <MenuItemForm cafeId={cafeId} cafeName={cafeName} />
    </div>
  );
}
