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
  const { getCafeById, currentUser, isInitialized } = useStore();
  const router = useRouter();
  
  const [cafe, setCafe] = useState<Cafe | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      const targetCafe = getCafeById(cafeId);
      setCafe(targetCafe);

      if (!currentUser) {
        router.push(`/login?redirect=/edit-cafe/${cafeId}`);
        return;
      }
      
      let hasPermission = false;
      if (currentUser.role === 'superadmin') {
        hasPermission = true;
      } else if (currentUser.role === 'cafeadmin' && currentUser.cafeId === cafeId) {
        hasPermission = true;
      }

      setCanEdit(hasPermission);
      setIsCheckingAuth(false);

      if (!hasPermission) {
        // If they don't have permission but are logged in, send to their dashboard or homepage
        router.push(currentUser.role === 'cafeadmin' ? '/dashboard' : '/');
        return;
      }

      if (hasPermission && !targetCafe) {
        // Has permission but cafe doesn't exist
        router.push(currentUser.role === 'cafeadmin' ? '/dashboard' : '/');
      }
      setIsLoading(false);
    }
  }, [currentUser, isInitialized, router, cafeId, getCafeById]);


  if (isCheckingAuth || !isInitialized || currentUser === undefined) {
    return <div className="text-center py-10">Memuat dan memeriksa otentikasi...</div>;
  }

  if (!canEdit) {
      return <div className="text-center py-10">Anda tidak memiliki izin untuk mengedit kafe ini. Mengarahkan...</div>;
  }

  if (isLoading || cafe === undefined) {
    return <div className="text-center py-10">Memuat data kafe...</div>;
  }

  if (cafe === null) {
    return <div className="text-center py-10">Kafe tidak ditemukan. Anda akan diarahkan kembali.</div>;
  }

  const handleBack = () => {
    if (currentUser?.role === 'cafeadmin') {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="space-y-6">
       <Button variant="outline" onClick={handleBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>
      <CafeForm isEditMode={true} initialCafeData={cafe} />
    </div>
  );
}
