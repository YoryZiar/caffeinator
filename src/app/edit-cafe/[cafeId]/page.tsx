
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CafeForm } from '@/components/CafeForm';
import { useStore } from '@/lib/store';
import type { Cafe } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditCafePage() {
  const params = useParams();
  const cafeId = typeof params.cafeId === 'string' ? params.cafeId : '';
  const { getCafeById, isAuthenticated, isInitialized } = useStore();
  const router = useRouter();
  
  const [cafe, setCafe] = useState<Cafe | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated === false) {
        router.push(`/login?redirect=/edit-cafe/${cafeId}`);
      } else if (isAuthenticated === true) {
        setIsCheckingAuth(false);
        if (cafeId) {
          const foundCafe = getCafeById(cafeId);
          setCafe(foundCafe);
          setIsLoading(false);
          if (!foundCafe) { 
            router.push('/'); 
          }
        } else {
          setIsLoading(false);
          router.push('/'); 
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

  if (isLoading || cafe === undefined) {
    return <div className="text-center py-10">Memuat data kafe...</div>;
  }

  if (cafe === null) {
    return <div className="text-center py-10">Kafe tidak ditemukan. Anda akan diarahkan kembali.</div>;
  }

  return (
    <div className="space-y-6">
       <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Daftar Kafe
      </Button>
      <CafeForm isEditMode={true} initialCafeData={cafe} />
    </div>
  );
}
