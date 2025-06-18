
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Cafe } from '@/lib/types';
import { Building, MapPin, Phone, Save, Image as ImageIcon, ArrowLeft } from 'lucide-react';

const cafeFormSchema = z.object({
  name: z.string().min(2, { message: "Nama kafe minimal 2 karakter." }).max(50, { message: "Nama kafe maksimal 50 karakter." }),
  address: z.string().min(5, { message: "Alamat minimal 5 karakter." }).max(100, { message: "Alamat maksimal 100 karakter." }),
  contactInfo: z.string().min(5, { message: "Info kontak minimal 5 karakter (e.g., nomor telepon)." }).max(50, { message: "Info kontak maksimal 50 karakter." }),
  imageUrl: z.string().url({ message: "URL gambar tidak valid." }).optional().or(z.literal('')),
});

type CafeFormValues = z.infer<typeof cafeFormSchema>;

interface CafeFormProps {
  isEditMode?: boolean;
  initialCafeData?: Cafe;
}

export function CafeForm({ isEditMode = false, initialCafeData }: CafeFormProps) {
  const { addCafe, editCafe } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CafeFormValues>({
    resolver: zodResolver(cafeFormSchema),
    defaultValues: initialCafeData && isEditMode ? {
      name: initialCafeData.name,
      address: initialCafeData.address,
      contactInfo: initialCafeData.contactInfo,
      imageUrl: initialCafeData.imageUrl || '',
    } : {
      name: '',
      address: '',
      contactInfo: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (isEditMode && initialCafeData) {
      form.reset({
        name: initialCafeData.name,
        address: initialCafeData.address,
        contactInfo: initialCafeData.contactInfo,
        imageUrl: initialCafeData.imageUrl || '',
      });
    }
  }, [isEditMode, initialCafeData, form]);

  function onSubmit(data: CafeFormValues) {
    try {
      if (isEditMode && initialCafeData) {
        editCafe(initialCafeData.id, data);
        toast({
          title: "Kafe Diperbarui!",
          description: `${data.name} berhasil diperbarui.`,
        });
        router.push('/'); 
      } else {
        addCafe(data);
        toast({
          title: "Kafe Ditambahkan!",
          description: `${data.name} berhasil ditambahkan.`,
        });
        router.push('/');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: `Gagal ${isEditMode ? "Memperbarui" : "Menambahkan"} Kafe`,
        description: "Terjadi kesalahan. Silakan coba lagi.",
      });
      console.error(`Failed to ${isEditMode ? "edit" : "add"} cafe:`, error);
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
         <CardTitle className="font-headline text-3xl text-primary">{isEditMode ? "Edit Kafe" : "Tambah Kafe Baru"}</CardTitle>
          {!isEditMode && (
            <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          )}
        </div>
        <CardDescription>
          {isEditMode ? `Perbarui detail untuk kafe ${initialCafeData?.name || ''}.` : "Isi detail kafe Anda di bawah ini."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Building className="mr-2 h-4 w-4 text-primary" />Nama Kafe</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Kopi Senja" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary" />Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Jl. Kenangan No. 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Phone className="mr-2 h-4 w-4 text-primary" />Info Kontak</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 08123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><ImageIcon className="mr-2 h-4 w-4 text-primary" />URL Gambar Kafe (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://contoh.com/gambar-kafe.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? "Menyimpan..." : (isEditMode ? "Simpan Perubahan" : "Simpan Kafe")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
