
"use client";

import { CategoryManager } from '@/components/CategoryManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ManageCategoriesPage() {
  const router = useRouter();

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
