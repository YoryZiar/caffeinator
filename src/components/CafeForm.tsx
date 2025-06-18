
"use client";

import { useEffect, useState } from 'react';
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
import { Building, MapPin, Phone, Save, Image as ImageIconLucide, ArrowLeft, Mail, KeyRound } from 'lucide-react';
import Image from 'next/image'; // For image preview

// Helper function to convert File to Data URI
const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const cafeFormSchemaBase = z.object({
  name: z.string().min(2, { message: "Nama kafe minimal 2 karakter." }).max(50, { message: "Nama kafe maksimal 50 karakter." }),
  address: z.string().min(5, { message: "Alamat minimal 5 karakter." }).max(100, { message: "Alamat maksimal 100 karakter." }),
  contactInfo: z.string().min(5, { message: "Info kontak minimal 5 karakter (e.g., nomor telepon)." }).max(50, { message: "Info kontak maksimal 50 karakter." }),
  imageUrl: z.string().optional().or(z.literal('')), // Will store Data URI string or be empty
});

const superAdminAddCafeSchema = cafeFormSchemaBase.extend({
  adminEmail: z.string().email("Email admin tidak valid."),
  adminPassword: z.string().min(6, "Password admin minimal 6 karakter."),
});

const editCafeSchema = cafeFormSchemaBase;


interface CafeFormProps {
  isEditMode?: boolean;
  initialCafeData?: Cafe;
  isSuperAdminAddMode?: boolean;
}

export function CafeForm({ isEditMode = false, initialCafeData, isSuperAdminAddMode = false }: CafeFormProps) {
  const { addCafeBySuperAdmin, editCafe, currentUser } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(initialCafeData?.imageUrl || null);


  const currentFormSchema = isSuperAdminAddMode ? superAdminAddCafeSchema : editCafeSchema;

  const form = useForm<z.infer<typeof currentFormSchema>>({
    resolver: zodResolver(currentFormSchema),
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
      ...(isSuperAdminAddMode && { adminEmail: '', adminPassword: '' }),
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
      setImagePreview(initialCafeData.imageUrl || null);
    } else if (!isEditMode && !isSuperAdminAddMode) {
      form.reset({
        name: '',
        address: '',
        contactInfo: '',
        imageUrl: '',
      });
      setImagePreview(null);
    } else if (isSuperAdminAddMode) {
       form.reset({
        name: '',
        address: '',
        contactInfo: '',
        imageUrl: '',
        adminEmail: '',
        adminPassword: '',
      });
      setImagePreview(null);
    }
  }, [isEditMode, initialCafeData, form, isSuperAdminAddMode]);

  async function onSubmit(data: z.infer<typeof currentFormSchema>) {
    try {
      // The `data.imageUrl` is already a Data URI string from the form state,
      // or empty if no image was set/uploaded.
      const finalImageUrl = data.imageUrl || (isSuperAdminAddMode || !isEditMode ? `https://placehold.co/600x400.png?text=${encodeURIComponent(data.name)}` : initialCafeData?.imageUrl || '');
      
      if (isEditMode && initialCafeData) {
        const cafeDetailsToUpdate = {
            name: data.name,
            address: data.address,
            contactInfo: data.contactInfo,
            imageUrl: finalImageUrl,
        };
        editCafe(initialCafeData.id, cafeDetailsToUpdate);
        toast({
          title: "Kafe Diperbarui!",
          description: `${data.name} berhasil diperbarui.`,
        });
        router.push(currentUser?.role === 'cafeadmin' ? '/dashboard' : '/');
      } else if (isSuperAdminAddMode) {
        const typedData = data as z.infer<typeof superAdminAddCafeSchema>;
        const cafeToAdd = {
            name: typedData.name,
            address: typedData.address,
            contactInfo: typedData.contactInfo,
            imageUrl: finalImageUrl,
        };
        const result = addCafeBySuperAdmin(cafeToAdd, typedData.adminEmail, typedData.adminPassword);
        if (result.success) {
            toast({
                title: "Kafe & Admin Ditambahkan!",
                description: `Kafe "${typedData.name}" dan admin ${typedData.adminEmail} berhasil ditambahkan.`,
            });
            router.push('/');
        } else {
            toast({ variant: "destructive", title: "Gagal Menambahkan", description: result.message || "Terjadi Kesalahan." });
        }
      } else {
        console.error("CafeForm: Reached unexpected onSubmit case.");
        toast({ variant: "destructive", title: "Aksi Tidak Valid", description: "Operasi tidak didukung." });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: `Gagal ${isEditMode ? "Memperbarui" : "Menambahkan"} Kafe`,
        description: "Terjadi kesalahan. Silakan coba lagi.",
      });
      console.error(`Failed operation:`, error);
    }
  }

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>, fieldOnChange: (value: string) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const dataUri = await fileToDataUri(file);
        fieldOnChange(dataUri); // Update RHF form state
        setImagePreview(dataUri);
      } catch (error) {
        console.error("Error converting file to Data URI:", error);
        toast({ variant: "destructive", title: "Gagal Memproses Gambar", description: "Tidak dapat memuat pratinjau gambar." });
        fieldOnChange(initialCafeData?.imageUrl || ''); // Revert to initial or empty
        setImagePreview(initialCafeData?.imageUrl || null);
      }
    } else {
      // If user cancels file dialog, do we clear the image?
      // For now, let's say if they want to remove image, they'd need a "remove" button.
      // Or, they can upload a transparent pixel.
      // If no file is selected, the current RHF value for imageUrl remains.
    }
  };
  
  const title = isSuperAdminAddMode ? "Tambah Kafe & Admin Baru (Superadmin)" : (isEditMode ? "Edit Detail Kafe" : "Form Kafe");
  const description = isSuperAdminAddMode ? "Isi detail kafe dan kredensial admin untuk kafe ini." : (isEditMode ? `Perbarui detail untuk kafe ${initialCafeData?.name || ''}.` : "Isi detail kafe.");

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
         <CardTitle className="font-headline text-3xl text-primary">{title}</CardTitle>
          {(isEditMode || isSuperAdminAddMode) && (
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
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
              name="imageUrl" // This RHF field stores the Data URI string
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><ImageIconLucide className="mr-2 h-4 w-4 text-primary" />Gambar Kafe (Opsional)</FormLabel>
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
                      <Image src={imagePreview} alt="Pratinjau gambar kafe" width={150} height={150} className="rounded-md object-cover border" data-ai-hint="cafe photo" />
                    </div>
                  )}
                </FormItem>
              )}
            />

            {isSuperAdminAddMode && (
              <>
                <h3 className="text-lg font-semibold text-accent border-b pb-2 pt-4">Detail Admin untuk Kafe Ini</h3>
                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary" />Email Admin</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="admin.kafe@example.com" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input type="password" placeholder="Min. 6 karakter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? "Menyimpan..." : (isEditMode ? "Simpan Perubahan Detail Kafe" : (isSuperAdminAddMode ? "Simpan Kafe & Admin" : "Simpan"))}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
