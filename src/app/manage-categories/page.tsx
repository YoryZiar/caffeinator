
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryManager } from '@/components/CategoryManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function ManageCategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated === false) {
        router.push('/login?redirect=/manage-categories');
      } else if (isAuthenticated === true) {
        setIsCheckingAuth(false);
      }
    }
  }, [isAuthenticated, isInitialized, router]);

  if (isCheckingAuth || !isInitialized || isAuthenticated === undefined) {
    return <div className="text-center py-10">Memuat dan memeriksa otentikasi...</div>;
  }
  if (!isAuthenticated) {
    return <div className="text-center py-10">Mengarahkan ke halaman login...</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>
      <CategoryManager />
    </div>
  );
}
