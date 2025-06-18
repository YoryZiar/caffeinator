"use client";

import type { Cafe } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Eye } from 'lucide-react';

interface CafeCardProps {
  cafe: Cafe;
}

export function CafeCard({ cafe }: CafeCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="relative w-full h-48">
        <Image
          src={`https://placehold.co/600x400.png?text=${encodeURIComponent(cafe.name)}`}
          alt={`Gambar representatif untuk ${cafe.name}`}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="cafe restaurant"
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
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/cafes/${cafe.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Lihat Menu
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
