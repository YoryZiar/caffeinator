"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { MenuItem } from '@/lib/types';
import { Utensils, Image as ImageIcon, DollarSign, ListChecks, Save, ArrowLeft } from 'lucide-react';

const menuItemFormSchema = z.object({
  name: z.string().min(2, { message: "Nama menu minimal 2 karakter." }).max(50, { message: "Nama menu maksimal 50 karakter." }),
  imageUrl: z.string().url({ message: "URL gambar tidak valid." }).optional().or(z.literal('')),
  price: z.coerce.number().min(0, { message: "Harga tidak boleh negatif." }),
  category: z.string().min(1, { message: "Kategori harus dipilih."}),
});

type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;

interface MenuItemFormProps {
  cafeId: string;
  cafeName: string;
  isEditMode?: boolean;
  initialMenuItemData?: MenuItem;
}

export function MenuItemForm({ cafeId, cafeName, isEditMode = false, initialMenuItemData }: MenuItemFormProps) {
  const { addMenuItem, editMenuItem, getMenuCategoriesForCafe } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const menuCategories = getMenuCategoriesForCafe(cafeId);

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: initialMenuItemData && isEditMode ? {
      name: initialMenuItemData.name,
      imageUrl: initialMenuItemData.imageUrl || '',
      price: initialMenuItemData.price,
      category: initialMenuItemData.category,
    } : {
      name: '',
      imageUrl: '',
      price: 0,
      category: menuCategories.length > 0 ? menuCategories[0] : undefined, // Default to first category if available
    },
  });

  useEffect(() => {
    if (isEditMode && initialMenuItemData) {
      form.reset({
        name: initialMenuItemData.name,
        imageUrl: initialMenuItemData.imageUrl || '',
        price: initialMenuItemData.price,
        category: initialMenuItemData.category,
      });
    } else if (!isEditMode) {
      // For new items, if categories change, we might want to update default or clear selection
      // This simple reset won't do that, but is okay for now.
      form.reset({
        name: '',
        imageUrl: '',
        price: 0,
        category: menuCategories.length > 0 ? menuCategories[0] : undefined,
      });
    }
  }, [isEditMode, initialMenuItemData, form, menuCategories]); // Added menuCategories to dependency

  function onSubmit(data: MenuItemFormValues) {
    try {
      const fullMenuItemData = { 
        ...data, 
        imageUrl: data.imageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(data.name)}`
      };

      if (isEditMode && initialMenuItemData) {
        editMenuItem(initialMenuItemData.id, fullMenuItemData);
        toast({
          title: "Item Menu Diperbarui!",
          description: `${data.name} berhasil diperbarui di menu ${cafeName}.`,
        });
      } else {
        addMenuItem({ ...fullMenuItemData, cafeId });
        toast({
          title: "Item Menu Ditambahkan!",
          description: `${data.name} berhasil ditambahkan ke menu ${cafeName}.`,
        });
      }
      router.push(`/cafes/${cafeId}`); // Back to menu management for this cafe
    } catch (error) {
      toast({
        variant: "destructive",
        title: `Gagal ${isEditMode ? "Memperbarui" : "Menambahkan"} Item`,
        description: "Terjadi kesalahan. Silakan coba lagi.",
      });
      console.error(`Failed to ${isEditMode ? "edit" : "add"} menu item:`, error);
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
        <CardTitle className="font-headline text-3xl text-primary">{isEditMode ? "Edit Item Menu" : "Tambah Item Menu"}</CardTitle>
          {/* Back button logic handled by page containing this form */}
        </div>
        <CardDescription>
          {isEditMode ? `Untuk item: ${initialMenuItemData?.name || ''} di kafe: ` : "Untuk kafe: "}
          <span className="font-semibold">{cafeName}</span>
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
                  <FormLabel className="flex items-center"><Utensils className="mr-2 h-4 w-4 text-primary" />Nama Menu</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Nasi Goreng Spesial" {...field} />
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
                  <FormLabel className="flex items-center"><ImageIcon className="mr-2 h-4 w-4 text-primary" />URL Gambar (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://contoh.com/gambar.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-primary" />Harga (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Contoh: 25000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><ListChecks className="mr-2 h-4 w-4 text-primary" />Kategori Menu</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {menuCategories.length === 0 ? (
                        <SelectItem value="-" disabled>Belum ada kategori. Tambah di 'Kelola Kategori Saya'.</SelectItem>
                      ) : (
                        menuCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || menuCategories.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? "Menyimpan..." : (isEditMode ? "Simpan Perubahan" : "Simpan Item Menu")}
            </Button>
            {menuCategories.length === 0 && <p className="text-xs text-destructive text-center">Anda perlu menambahkan kategori terlebih dahulu sebelum menyimpan item menu.</p>}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
