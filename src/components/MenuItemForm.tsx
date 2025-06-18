"use client";

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
import { MenuItemCategories, type MenuItemCategory } from '@/lib/types';
import { Utensils, Image as ImageIcon, DollarSign, ListChecks, Save } from 'lucide-react';

const menuItemFormSchema = z.object({
  name: z.string().min(2, { message: "Nama menu minimal 2 karakter." }).max(50, { message: "Nama menu maksimal 50 karakter." }),
  imageUrl: z.string().url({ message: "URL gambar tidak valid." }).optional().or(z.literal('')),
  price: z.coerce.number().min(0, { message: "Harga tidak boleh negatif." }),
  category: z.enum(MenuItemCategories, { errorMap: () => ({ message: "Pilih kategori yang valid."}) }),
});

type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;

interface MenuItemFormProps {
  cafeId: string;
  cafeName: string;
}

export function MenuItemForm({ cafeId, cafeName }: MenuItemFormProps) {
  const { addMenuItem } = useStore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
      price: 0,
      category: undefined,
    },
  });

  function onSubmit(data: MenuItemFormValues) {
    try {
      addMenuItem({ ...data, cafeId, imageUrl: data.imageUrl || '' });
      toast({
        title: "Item Menu Ditambahkan!",
        description: `${data.name} berhasil ditambahkan ke menu ${cafeName}.`,
      });
      router.push(`/cafes/${cafeId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Menambahkan Item",
        description: "Terjadi kesalahan. Silakan coba lagi.",
      });
      console.error("Failed to add menu item:", error);
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-primary">Tambah Item Menu</CardTitle>
        <CardDescription>Untuk kafe: <span className="font-semibold">{cafeName}</span></CardDescription>
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
                      {MenuItemCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Item Menu"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
