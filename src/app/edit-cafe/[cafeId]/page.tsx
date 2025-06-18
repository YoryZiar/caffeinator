
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
  const { getCafeById } = useStore();
  const router = useRouter();
  
  const [cafe, setCafe] = useState<Cafe | null | undefined>(undefined); // undefined for loading, null for not found
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cafeId) {
      const foundCafe = getCafeById(cafeId);
      setCafe(foundCafe);
      setIsLoading(false);
      if (!foundCafe && !isLoading) { // Ensure isLoading is false before redirecting for not found
        router.push('/'); // Redirect if cafe not found after initial load attempt
      }
    } else {
      setIsLoading(false);
      router.push('/'); // Redirect if no cafeId
    }
  }, [cafeId, getCafeById, router, isLoading]);


  if (isLoading || cafe === undefined) {
    return <div className="text-center py-10">Memuat data kafe...</div>;
  }

  if (cafe === null) {
    // This state is reached if getCafeById returned undefined and useEffect has run
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
