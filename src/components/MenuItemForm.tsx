
"use client";

import { useEffect, useState } from 'react';
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
import { Utensils, Image as ImageIconLucide, DollarSign, ListChecks, Save } from 'lucide-react';
import Image from 'next/image'; 

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const menuItemFormSchema = z.object({
  name: z.string().min(2, { message: "Nama menu minimal 2 karakter." }).max(50, { message: "Nama menu maksimal 50 karakter." }),
  imageUrl: z.string().optional().or(z.literal('')), 
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
  const [imagePreview, setImagePreview] = useState<string | null>(initialMenuItemData?.imageUrl || null);

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
      category: menuCategories.length > 0 ? menuCategories[0] : undefined,
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
      setImagePreview(initialMenuItemData.imageUrl || null);
    } else if (!isEditMode) {
      form.reset({
        name: '',
        imageUrl: '',
        price: 0,
        category: menuCategories.length > 0 ? menuCategories[0] : undefined,
      });
      setImagePreview(null);
    }
  }, [isEditMode, initialMenuItemData, form, menuCategories]);

  async function onSubmit(data: MenuItemFormValues) {
    try {
      const finalImageUrl = data.imageUrl || `https://placehold.co/400x300.png?text=${encodeURIComponent(data.name)}`;
      
      const fullMenuItemData = { 
        name: data.name,
        price: data.price,
        category: data.category,
        imageUrl: finalImageUrl,
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
      router.push(`/cafes/${cafeId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: `Gagal ${isEditMode ? "Memperbarui" : "Menambahkan"} Item`,
        description: "Terjadi kesalahan. Silakan coba lagi.",
      });
      console.error(`Failed to ${isEditMode ? "edit" : "add"} menu item:`, error);
    }
  }

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>, fieldOnChange: (value: string) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const dataUri = await fileToDataUri(file);
        fieldOnChange(dataUri); 
        setImagePreview(dataUri);
      } catch (error) {
        console.error("Error converting file to Data URI:", error);
        toast({ variant: "destructive", title: "Gagal Memproses Gambar", description: "Tidak dapat memuat pratinjau gambar." });
        fieldOnChange(initialMenuItemData?.imageUrl || ''); 
        setImagePreview(initialMenuItemData?.imageUrl || null);
      }
    } else {
    }
  };

  return (
    <Card className="w-full max-w-md sm:max-w-lg mx-auto shadow-xl">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex justify-between items-center">
        <CardTitle className="font-headline text-xl sm:text-2xl lg:text-3xl text-primary">{isEditMode ? "Edit Item Menu" : "Tambah Item Menu"}</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          {isEditMode ? `Untuk item: ${initialMenuItemData?.name || ''} di kafe: ` : "Untuk kafe: "}
          <span className="font-semibold">{cafeName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-xs sm:text-sm"><Utensils className="mr-2 h-4 w-4 text-primary" />Nama Menu</FormLabel>
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
                  <FormLabel className="flex items-center text-xs sm:text-sm"><ImageIconLucide className="mr-2 h-4 w-4 text-primary" />Gambar Menu (Opsional)</FormLabel>
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
                      <p className="text-xs sm:text-sm text-muted-foreground">Pratinjau:</p>
                      <Image src={imagePreview} alt="Pratinjau gambar menu" width={100} height={100} className="rounded-md object-cover border sm:w-[150px] sm:h-[150px]" data-ai-hint="food item" />
                    </div>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-xs sm:text-sm"><DollarSign className="mr-2 h-4 w-4 text-primary" />Harga (Rp)</FormLabel>
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
                  <FormLabel className="flex items-center text-xs sm:text-sm"><ListChecks className="mr-2 h-4 w-4 text-primary" />Kategori Menu</FormLabel>
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
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || (menuCategories.length === 0 && !form.getValues("category"))}>
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
