
"use client";

import type { MenuItem } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tag, DollarSign, Edit3, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

interface MenuItemCardProps {
  menuItem: MenuItem;
}

export function MenuItemCard({ menuItem }: MenuItemCardProps) {
  const { deleteMenuItem } = useStore();
  const { toast } = useToast();

  const handleDelete = () => {
    try {
      deleteMenuItem(menuItem.id);
      toast({
        title: "Item Menu Dihapus",
        description: `"${menuItem.name}" berhasil dihapus dari menu.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan saat menghapus item menu.",
      });
      console.error("Failed to delete menu item:", error);
    }
  };
  
  const imageSrc = menuItem.imageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(menuItem.name)}`;

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out group">
      <div className="relative w-full h-32 sm:h-40">
        <Image
          src={imageSrc}
          alt={menuItem.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-110"
          data-ai-hint={menuItem.imageUrl && !menuItem.imageUrl.startsWith('data:') ? "food dish" : "menu item image"}
        />
      </div>
      <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
        <CardTitle className="font-headline text-lg sm:text-xl">{menuItem.name}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3 pt-0 px-3 sm:px-4 space-y-1 sm:space-y-2">
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
          <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-accent" /> {menuItem.category}
        </div>
         <div className="flex items-center font-semibold text-primary text-sm sm:text-base">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-1" /> 
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(menuItem.price)}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/5 p-2 sm:p-3 grid grid-cols-2 gap-2">
        <Button variant="outline" size="xs" className="text-xs sm:text-sm sm:size-sm" asChild>
          <Link href={`/cafes/${menuItem.cafeId}/edit-menu/${menuItem.id}`}>
            <Edit3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Ubah
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="xs" className="text-xs sm:text-sm sm:size-sm">
              <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Hapus
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Anda yakin ingin menghapus item ini?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus item menu "{menuItem.name}" secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Ya, Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
