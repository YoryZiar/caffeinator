
"use client";

import { useStore } from '@/lib/store';
import type { Cafe as CafeType, MenuItem as MenuItemType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, UtensilsCrossed, Coffee, Tag, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


function PublicMenuItemCard({ menuItem }: { menuItem: MenuItemType }) {
  const imageSrc = menuItem.imageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(menuItem.name)}`;
  return (
    <Card className="overflow-hidden shadow-lg group">
      <div className="relative w-full h-32 sm:h-40">
        <Image
          src={imageSrc}
          alt={menuItem.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
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
    </Card>
  );
}


export default function PublicCafeMenuPage() {
  const params = useParams();
  const cafeId = typeof params.cafeId === 'string' ? params.cafeId : '';
  
  const { getCafeById, getMenuItemsByCafeId, isInitialized } = useStore(); 
  const router = useRouter();

  const [cafe, setCafe] = useState<CafeType | null | undefined>(undefined); 
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isInitialized && cafeId) {
      const foundCafe = getCafeById(cafeId);
      if (foundCafe) {
        setCafe(foundCafe);
        setMenuItems(getMenuItemsByCafeId(cafeId));
      } else {
        setCafe(null); 
      }
      setIsLoading(false);
    } else if (isInitialized && !cafeId) {
      setIsLoading(false);
      setCafe(null);
    }
  }, [cafeId, getCafeById, getMenuItemsByCafeId, isInitialized]);


  if (!isInitialized || isLoading) { 
    return <div className="text-center py-10">Memuat menu kafe...</div>;
  }

  if (cafe === null) { 
    return (
      <div className="text-center py-10 px-4">
        <UtensilsCrossed className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-xl sm:text-2xl font-bold text-destructive mb-2">Kafe Tidak Ditemukan</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">Maaf, kami tidak dapat menemukan kafe yang Anda cari.</p>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Daftar Kafe
          </Link>
        </Button>
      </div>
    );
  }
  
  if (!cafe) { 
      return <div className="text-center py-10">Memuat data kafe...</div>
  }


  const groupedMenuItems = menuItems.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {} as Record<string, MenuItemType[]>);

  const cafeImageSrc = cafe.imageUrl || `https://placehold.co/1200x400.png?text=${encodeURIComponent(cafe.name)}`;


  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="relative w-full h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden shadow-lg mb-6 sm:mb-8">
        <Image
          src={cafeImageSrc}
          alt={`Gambar untuk ${cafe.name}`}
          layout="fill"
          objectFit="cover"
          data-ai-hint={cafe.imageUrl && !cafe.imageUrl.startsWith('data:') ? "cafe exterior building" : "generic cafe image"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-white shadow-md">{cafe.name}</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-200 mt-1 sm:mt-2 shadow-sm">{cafe.address}</p>
           <p className="text-xs sm:text-sm md:text-md text-gray-300 mt-1 shadow-sm">Kontak: {cafe.contactInfo}</p>
        </div>
      </div>
      
      <div className="flex justify-start items-center mb-4 sm:mb-6">
         <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Lihat Semua Kafe
          </Link>
        </Button>
      </div>


      {menuItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-muted-foreground/30 rounded-lg px-4">
          <Coffee className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg sm:text-xl text-muted-foreground mb-2">Menu untuk {cafe.name} segera hadir!</p>
          <p className="text-sm sm:text-base text-muted-foreground">Saat ini belum ada item menu yang ditampilkan.</p>
        </div>
      ) : (
        Object.entries(groupedMenuItems).map(([category, items]) => (
          <section key={category} className="space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-headline text-accent border-b-2 border-accent/30 pb-2">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {items.map((item) => (
                <PublicMenuItemCard key={item.id} menuItem={item} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
