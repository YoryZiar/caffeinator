"use client";

import { useState } from 'react';
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
import { Building, MapPin, Phone, Image as ImageIcon, Mail, KeyRound, UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const registerCafeFormSchema = z.object({
  cafeName: z.string().min(2, "Nama kafe minimal 2 karakter.").max(50),
  cafeAddress: z.string().min(5, "Alamat kafe minimal 5 karakter.").max(100),
  cafeContact: z.string().min(5, "Info kontak kafe minimal 5 karakter.").max(50),
  cafeImageUrl: z.string().url("URL gambar tidak valid.").optional().or(z.literal('')),
  adminEmail: z.string().email("Format email tidak valid."),
  adminPassword: z.string().min(6, "Password minimal 6 karakter."),
});

type RegisterCafeFormValues = z.infer<typeof registerCafeFormSchema>;

export default function RegisterCafePage() {
  const { registerCafeAndAdmin, currentUser } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterCafeFormValues>({
    resolver: zodResolver(registerCafeFormSchema),
    defaultValues: {
      cafeName: '',
      cafeAddress: '',
      cafeContact: '',
      cafeImageUrl: '',
      adminEmail: '',
      adminPassword: '',
    },
  });

  if (currentUser) {
    router.push(currentUser.role === 'cafeadmin' ? '/dashboard' : '/');
    return <div className="text-center py-10">Anda sudah login. Mengarahkan...</div>;
  }

  function onSubmit(data: RegisterCafeFormValues) {
    const cafeData = {
      name: data.cafeName,
      address: data.cafeAddress,
      contactInfo: data.cafeContact,
      imageUrl: data.cafeImageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(data.cafeName)}`,
    };
    const adminData = {
      email: data.adminEmail,
      password: data.adminPassword,
    };

    const result = registerCafeAndAdmin(cafeData, adminData);

    if (result.success) {
      toast({
        title: "Pendaftaran Berhasil!",
        description: `Kafe "${data.cafeName}" dan akun admin Anda telah dibuat.`,
      });
      router.push('/dashboard'); // Redirect to dashboard after successful registration
    } else {
      toast({
        variant: "destructive",
        title: "Pendaftaran Gagal",
        description: result.message || "Terjadi kesalahan. Silakan coba lagi.",
      });
    }
  }

  return (
    <div className="flex justify-center items-center py-8">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary text-center">Daftarkan Kafe Anda</CardTitle>
          <CardDescription className="text-center">
            Buat akun admin dan daftarkan detail kafe Anda untuk mulai mengelola menu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <h3 className="text-lg font-semibold text-accent border-b pb-2">Detail Kafe</h3>
              <FormField
                control={form.control}
                name="cafeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Building className="mr-2 h-4 w-4 text-primary" />Nama Kafe</FormLabel>
                    <FormControl><Input placeholder="Kopi Pagi Ceria" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cafeAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-primary" />Alamat Kafe</FormLabel>
                    <FormControl><Input placeholder="Jl. Bahagia No. 123" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cafeContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Phone className="mr-2 h-4 w-4 text-primary" />Kontak Kafe (WA/Telepon)</FormLabel>
                    <FormControl><Input placeholder="0812-xxxx-xxxx" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cafeImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><ImageIcon className="mr-2 h-4 w-4 text-primary" />URL Gambar Kafe (Opsional)</FormLabel>
                    <FormControl><Input placeholder="https://example.com/cafe.jpg" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h3 className="text-lg font-semibold text-accent border-b pb-2 pt-4">Detail Akun Admin Kafe</h3>
              <FormField
                control={form.control}
                name="adminEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary" />Email Admin</FormLabel>
                    <FormControl><Input type="email" placeholder="admin.kafe@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><KeyRound className="mr-2 h-4 w-4 text-primary" />Password Admin</FormLabel>
                    <FormControl><Input type="password" placeholder="Minimal 6 karakter" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                <UserPlus className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? "Mendaftarkan..." : "Daftar & Buat Kafe"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="pt-6">
          <Button variant="link" asChild className="mx-auto">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" /> Sudah punya akun? Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
