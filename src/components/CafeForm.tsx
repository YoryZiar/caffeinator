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
import { Building, MapPin, Phone, Save, Image as ImageIcon, ArrowLeft, Mail, KeyRound } from 'lucide-react';

const cafeFormSchemaBase = z.object({
  name: z.string().min(2, { message: "Nama kafe minimal 2 karakter." }).max(50, { message: "Nama kafe maksimal 50 karakter." }),
  address: z.string().min(5, { message: "Alamat minimal 5 karakter." }).max(100, { message: "Alamat maksimal 100 karakter." }),
  contactInfo: z.string().min(5, { message: "Info kontak minimal 5 karakter (e.g., nomor telepon)." }).max(50, { message: "Info kontak maksimal 50 karakter." }),
  imageUrl: z.string().url({ message: "URL gambar tidak valid." }).optional().or(z.literal('')),
});

const superAdminAddCafeSchema = cafeFormSchemaBase.extend({
  adminEmail: z.string().email("Email admin tidak valid."),
  adminPassword: z.string().min(6, "Password admin minimal 6 karakter."),
});

const editCafeSchema = cafeFormSchemaBase.extend({
  // For editing, admin email/password changes are handled differently or not at all via this form for cafe owner.
  // Superadmin might have a more complex edit flow if they can change ownership.
});


interface CafeFormProps {
  isEditMode?: boolean;
  initialCafeData?: Cafe;
  isSuperAdminAddMode?: boolean; // New prop for superadmin adding a cafe + admin
}

export function CafeForm({ isEditMode = false, initialCafeData, isSuperAdminAddMode = false }: CafeFormProps) {
  const { addCafeBySuperAdmin, editCafe, currentUser } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const currentFormSchema = isSuperAdminAddMode ? superAdminAddCafeSchema : editCafeSchema;

  const form = useForm<z.infer<typeof currentFormSchema>>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: initialCafeData && isEditMode ? {
      name: initialCafeData.name,
      address: initialCafeData.address,
      contactInfo: initialCafeData.contactInfo,
      imageUrl: initialCafeData.imageUrl || '',
      // adminEmail and adminPassword fields only for superAdminAddMode, not prefilled for edit mode here
    } : {
      name: '',
      address: '',
      contactInfo: '',
      imageUrl: '',
      adminEmail: '', // only relevant for superAdminAddMode
      adminPassword: '', // only relevant for superAdminAddMode
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
    } else if (!isEditMode && !isSuperAdminAddMode) {
        // This case should not happen if add-cafe page is removed for self-registration
        // Or if CafeForm is only used by superadmin add or edit modes.
    }
  }, [isEditMode, initialCafeData, form, isSuperAdminAddMode]);

  function onSubmit(data: z.infer<typeof currentFormSchema>) {
    try {
      if (isEditMode && initialCafeData) {
        // Cafe owner edits their own cafe details, or superadmin edits any cafe's details
        // Password change for cafe owner is not handled here, only cafe details.
        const cafeDetailsToUpdate: Partial<Omit<Cafe, 'id' | 'ownerUserId'>> = {
            name: data.name,
            address: data.address,
            contactInfo: data.contactInfo,
            imageUrl: data.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(data.name)}`
        };
        // Superadmin might change adminEmail/password. This is complex and store logic for editCafe needs to handle it.
        // For now, editCafe primarily updates cafe details.
        editCafe(initialCafeData.id, cafeDetailsToUpdate);
        toast({
          title: "Kafe Diperbarui!",
          description: `${data.name} berhasil diperbarui.`,
        });
        router.push(currentUser?.role === 'cafeadmin' ? '/dashboard' : '/');
      } else if (isSuperAdminAddMode) {
        // Superadmin adds a new cafe and creates an admin account for it
        const typedData = data as z.infer<typeof superAdminAddCafeSchema>;
        const cafeToAdd = {
            name: typedData.name,
            address: typedData.address,
            contactInfo: typedData.contactInfo,
            imageUrl: typedData.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(typedData.name)}`
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
        // This case would be for a general "addCafe" which is now handled by registration or superadmin specific add.
        // Should not be reached if UI flow is correct.
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
  
  const title = isSuperAdminAddMode ? "Tambah Kafe & Admin Baru (Superadmin)" : (isEditMode ? "Edit Detail Kafe" : "Form Kafe");
  const description = isSuperAdminAddMode ? "Isi detail kafe dan kredensial admin untuk kafe ini." : (isEditMode ? `Perbarui detail untuk kafe ${initialCafeData?.name || ''}.` : "Isi detail kafe.");

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
         <CardTitle className="font-headline text-3xl text-primary">{title}</CardTitle>
          {(isEditMode || isSuperAdminAddMode) && ( // Show back button for these modes
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
