"use client";

import type { MenuItem } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, DollarSign } from 'lucide-react';

interface MenuItemCardProps {
  menuItem: MenuItem;
}

export function MenuItemCard({ menuItem }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out group hover:scale-105">
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
      <CardContent className="pb-3 pt-0">
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <Tag className="w-4 h-4 mr-2 text-accent" /> {menuItem.category}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-3">
        <div className="flex items-center font-semibold text-primary">
          <DollarSign className="w-5 h-5 mr-1" /> 
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(menuItem.price)}
        </div>
      </CardFooter>
    </Card>
  );
}
