
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CafeForm } from '@/components/CafeForm';
import { useStore } from '@/lib/store';

export default function AddCafePage() {
  const { isAuthenticated, isInitialized } = useStore();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated === false) { // Explicitly check for false after initialization
        router.push('/login?redirect=/add-cafe');
      } else if (isAuthenticated === true) {
        setIsCheckingAuth(false);
      }
    }
  }, [isAuthenticated, isInitialized, router]);

  if (isCheckingAuth || !isInitialized || isAuthenticated === undefined) {
    return <div className="text-center py-10">Memuat dan memeriksa otentikasi...</div>;
  }
  
  if (!isAuthenticated) { // Should be caught by useEffect, but as a fallback
      return <div className="text-center py-10">Mengarahkan ke halaman login...</div>;
  }

  return (
    <div>
      <CafeForm isEditMode={false} />
    </div>
  );
}
