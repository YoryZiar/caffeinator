
"use client";

import { useState, useEffect } from 'react'; // Added useEffect
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Building, MapPin, Phone, Image as ImageIcon, Mail, KeyRound, UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image'; // For image preview

const registerCafeFormSchema = z.object({
  cafeName: z.string().min(2, "Nama kafe minimal 2 karakter.").max(50),
  cafeAddress: z.string().min(5, "Alamat kafe minimal 5 karakter.").max(100),
  cafeContact: z.string().min(5, "Info kontak kafe minimal 5 karakter.").max(50),
  cafeImageUrl: z.string().optional().or(z.literal('')), // Will store Data URI or be empty
  adminEmail: z.string().email("Format email tidak valid."),
  adminPassword: z.string().min(6, "Password minimal 6 karakter."),
});

type RegisterCafeFormValues = z.infer<typeof registerCafeFormSchema>;

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function RegisterCafePage() {
  const { registerCafeAndAdmin, currentUser, isInitialized } = useStore(); // Added isInitialized
  const router = useRouter();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  useEffect(() => {
    if (isInitialized && currentUser) {
      router.push(currentUser.role === 'cafeadmin' ? '/dashboard' : '/');
    }
  }, [currentUser, isInitialized, router]);


  if (!isInitialized) { // Show loading until store is ready
    return <div className="text-center py-10">Memuat...</div>;
  }

  if (currentUser) { // If user is already logged in after initialization
    return <div className="text-center py-10">Anda sudah login. Mengarahkan...</div>;
  }

  async function onSubmit(data: RegisterCafeFormValues) {
    // The cafeImageUrl from form 'data' is already the Data URI string if a file was selected and processed,
    // or empty string if not.
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
      // Login is handled by registerCafeAndAdmin, redirection by useEffect
    } else {
      toast({
        variant: "destructive",
        title: "Pendaftaran Gagal",
        description: result.message || "Terjadi kesalahan. Silakan coba lagi.",
      });
    }
  }

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>, fieldOnChange: (value: string) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const dataUri = await fileToDataUri(file);
        fieldOnChange(dataUri); // Update RHF form state for cafeImageUrl
        setImagePreview(dataUri);
      } catch (error) {
        console.error("Error converting file to Data URI:", error);
        toast({ variant: "destructive", title: "Gagal Memproses Gambar", description: "Tidak dapat memuat pratinjau gambar." });
        fieldOnChange(''); // Clear if error
        setImagePreview(null);
      }
    } else {
      fieldOnChange(''); // Clear if no file selected
      setImagePreview(null);
    }
  };

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
                render={({ field }) => ( // field.onChange will be used to set the Data URI string
                  <FormItem>
                    <FormLabel className="flex items-center"><ImageIcon className="mr-2 h-4 w-4 text-primary" />Gambar Kafe (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e, field.onChange)}
                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                    {imagePreview && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">Pratinjau:</p>
                        <Image src={imagePreview} alt="Pratinjau gambar kafe" width={150} height={150} className="rounded-md object-cover border" data-ai-hint="cafe interior image" />
                      </div>
                    )}
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
