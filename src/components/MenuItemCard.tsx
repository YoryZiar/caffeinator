
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

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out group">
      <div className="relative w-full h-40">
        <Image
          src={menuItem.imageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(menuItem.name)}`}
          alt={menuItem.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-110"
          data-ai-hint="food dish"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="font-headline text-xl">{menuItem.name}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3 pt-0 space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Tag className="w-4 h-4 mr-2 text-accent" /> {menuItem.category}
        </div>
         <div className="flex items-center font-semibold text-primary">
          <DollarSign className="w-5 h-5 mr-1" /> 
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(menuItem.price)}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/5 p-3 grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/cafes/${menuItem.cafeId}/edit-menu/${menuItem.id}`}>
            <Edit3 className="mr-2 h-4 w-4" />
            Ubah
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
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
