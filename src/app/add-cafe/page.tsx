"use client";

// This page is now intended for Superadmin to add a cafe and assign an admin.
// If self-registration is the only way, this page might be removed or repurposed.
// For now, let's make it a superadmin-only page.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CafeForm } from '@/components/CafeForm'; // CafeForm will need updates for admin fields
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
      {/* CafeForm will be used for adding a cafe by superadmin.
          It needs to be adapted to also take admin email/password for the new cafe.
          Or, we create a specific form for this.
          For now, CafeForm is used, assuming it's adapted or this is a simplified placeholder.
      */}
      <CafeForm isEditMode={false} isSuperAdminAddMode={true} />
    </div>
  );
}
