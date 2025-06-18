"use client";

// This file is effectively removed and replaced by /cafes/[cafeId]/manage-categories/page.tsx
// Keeping a placeholder or redirecting might be an option if direct access is anticipated.
// For now, let's assume it's "removed" by not being linked and its functionality moved.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ObsoleteManageCategoriesPage() {
  const router = useRouter();
  useEffect(() => {
    // Redirect to homepage or a more relevant page
    // as global category management is no longer a feature.
    router.replace('/'); 
  }, [router]);

  return (
    <div className="text-center py-10">
      Halaman ini sudah tidak digunakan. Pengelolaan kategori sekarang dilakukan per kafe.
      <p>Anda akan diarahkan...</p>
    </div>
  );
}
