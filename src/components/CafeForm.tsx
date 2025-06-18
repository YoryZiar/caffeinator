"use client";

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
import { Building, MapPin, Phone, Save } from 'lucide-react';

const cafeFormSchema = z.object({
  name: z.string().min(2, { message: "Nama kafe minimal 2 karakter." }).max(50, { message: "Nama kafe maksimal 50 karakter." }),
  address: z.string().min(5, { message: "Alamat minimal 5 karakter." }).max(100, { message: "Alamat maksimal 100 karakter." }),
  contactInfo: z.string().min(5, { message: "Info kontak minimal 5 karakter (e.g., nomor telepon)." }).max(50, { message: "Info kontak maksimal 50 karakter." }),
});

type CafeFormValues = z.infer<typeof cafeFormSchema>;

export function CafeForm() {
  const { addCafe } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CafeFormValues>({
    resolver: zodResolver(cafeFormSchema),
    defaultValues: {
      name: '',
      address: '',
      contactInfo: '',
    },
  });

  function onSubmit(data: CafeFormValues) {
    try {
      addCafe(data);
      toast({
        title: "Kafe Ditambahkan!",
        description: `${data.name} berhasil ditambahkan.`,
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Menambahkan Kafe",
        description: "Terjadi kesalahan. Silakan coba lagi.",
      });
      console.error("Failed to add cafe:", error);
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-primary">Tambah Kafe Baru</CardTitle>
        <CardDescription>Isi detail kafe Anda di bawah ini.</CardDescription>
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
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Kafe"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
