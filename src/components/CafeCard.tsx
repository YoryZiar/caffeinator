
"use client";

import type { Cafe } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPin, Phone, Eye, Edit3, Trash2, BookOpen } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface CafeCardProps {
  cafe: Cafe;
}

export function CafeCard({ cafe }: CafeCardProps) {
  const imageSrc = cafe.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(cafe.name)}`;
  const imageAlt = cafe.imageUrl ? `Gambar untuk ${cafe.name}` : `Placeholder untuk ${cafe.name}`;
  const aiHint = cafe.imageUrl ? "cafe interior" : "cafe restaurant";
  
  const { deleteCafe, isAuthenticated, isInitialized } = useStore();
  const { toast } = useToast();
  const router = useRouter();

  const handleDeleteCafe = () => {
    try {
      deleteCafe(cafe.id);
      toast({
        title: "Kafe Dihapus!",
        description: `Kafe "${cafe.name}" beserta menunya berhasil dihapus.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Menghapus Kafe",
        description: "Terjadi kesalahan. Silakan coba lagi.",
      });
      console.error("Failed to delete cafe:", error);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out group">
      <div className="relative w-full h-48">
        <Image
          src={imageSrc}
          alt={imageAlt}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={aiHint}
        />
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{cafe.name}</CardTitle>
        <CardDescription className="flex items-center text-sm pt-1">
          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" /> {cafe.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground">
          <Phone className="w-4 h-4 mr-2" /> {cafe.contactInfo}
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-1 gap-2">
        <Button asChild className="w-full" variant="secondary">
          <Link href={`/menu/${cafe.id}`}>
            <BookOpen className="mr-2 h-4 w-4" />
            Lihat Menu Publik
          </Link>
        </Button>
        {isInitialized && isAuthenticated && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            <Button asChild className="w-full col-span-1">
              <Link href={`/cafes/${cafe.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full col-span-1">
              <Link href={`/edit-cafe/${cafe.id}`}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full col-span-1">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Anda yakin ingin menghapus kafe ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan menghapus kafe "{cafe.name}" beserta semua item menunya secara permanen. Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteCafe}>Ya, Hapus</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
