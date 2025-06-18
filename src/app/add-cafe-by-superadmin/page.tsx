"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CafeForm } from '@/components/CafeForm';
import { useStore } from '@/lib/store';

export default function AddCafeBySuperAdminPage() {
  const { currentUser, isInitialized } = useStore();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      if (!currentUser || currentUser.role !== 'superadmin') {
        router.push('/login?redirect=/add-cafe-by-superadmin');
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [currentUser, isInitialized, router]);

  if (isCheckingAuth || !isInitialized || currentUser === undefined) {
    return <div className="text-center py-10">Memuat dan memeriksa otentikasi...</div>;
  }
  
  if (!currentUser || currentUser.role !== 'superadmin') {
      return <div className="text-center py-10">Akses ditolak. Mengarahkan ke halaman login...</div>;
  }

  return (
    <div>
      <CafeForm isEditMode={false} isSuperAdminAddMode={true} />
    </div>
  );
}
