
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Edit3, Trash2, Tag } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, { message: "Nama kategori minimal 2 karakter." }).max(30, { message: "Nama kategori maksimal 30 karakter." }),
});
type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoryManager() {
  const { menuCategories, addMenuCategory, editMenuCategory, deleteMenuCategory } = useStore();
  const { toast } = useToast();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const addForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  function handleAddCategory(data: CategoryFormValues) {
    const success = addMenuCategory(data.name);
    if (success) {
      toast({ title: "Kategori Ditambahkan", description: `Kategori "${data.name}" berhasil ditambahkan.` });
      addForm.reset();
    } else {
      toast({ variant: "destructive", title: "Gagal Menambahkan", description: `Kategori "${data.name}" sudah ada.` });
    }
  }

  function handleDeleteCategory(categoryName: string) {
    deleteMenuCategory(categoryName);
    toast({ title: "Kategori Dihapus", description: `Kategori "${categoryName}" berhasil dihapus.` });
  }

  function openEditDialog(categoryName: string) {
    setEditingCategory(categoryName);
    editForm.reset({ name: categoryName }); // Pre-fill form with current name
    setIsEditDialogOpen(true);
  }

  function handleEditCategory(data: CategoryFormValues) {
    if (!editingCategory) return;
    const success = editMenuCategory(editingCategory, data.name);
    if (success) {
      toast({ title: "Kategori Diperbarui", description: `Kategori "${editingCategory}" berhasil diubah menjadi "${data.name}".` });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
    } else {
      toast({ variant: "destructive", title: "Gagal Memperbarui", description: `Nama kategori "${data.name}" mungkin sudah ada atau terjadi kesalahan.` });
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <Tag className="mr-3 h-7 w-7" />
            Kelola Kategori Menu
          </CardTitle>
          <CardDescription>Tambah, ubah, atau hapus kategori untuk item menu Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddCategory)} className="flex items-start gap-4 mb-6">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="sr-only">Nama Kategori Baru</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama kategori baru (e.g., Minuman Spesial)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={addForm.formState.isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {addForm.formState.isSubmitting ? "Menambah..." : "Tambah"}
              </Button>
            </form>
          </Form>

          <Separator className="my-6" />

          {menuCategories.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Belum ada kategori. Silakan tambahkan kategori pertama Anda.</p>
          ) : (
            <ul className="space-y-3">
              {menuCategories.map((category) => (
                <li key={category} className="flex items-center justify-between p-3 bg-card border rounded-md hover:shadow-sm transition-shadow">
                  <span className="text-card-foreground">{category}</span>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                      <Edit3 className="mr-1 h-3 w-3" /> Ubah
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-1 h-3 w-3" /> Hapus
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus kategori "{category}". Item menu yang menggunakan kategori ini tidak akan terpengaruh secara langsung, tetapi kategori ini tidak akan tersedia lagi untuk dipilih.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCategory(category)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Nama Kategori</DialogTitle>
            <DialogDescription>
              Mengubah nama untuk kategori: <span className="font-semibold">{editingCategory}</span>
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditCategory)} className="space-y-4 py-2">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kategori Baru</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama baru" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Batal</Button>
                </DialogClose>
                <Button type="submit" disabled={editForm.formState.isSubmitting}>
                  {editForm.formState.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
