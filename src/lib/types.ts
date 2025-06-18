export interface Cafe {
  id: string;
  name: string;
  address: string;
  contactInfo: string;
  imageUrl?: string; // Tambahkan imageUrl opsional
}

export interface MenuItem {
  id: string;
  cafeId: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string; // Kategori tetap string, akan divalidasi/dipilih dari daftar dinamis
}

// MenuItemCategories konstanta dihapus, akan dikelola di store
// export const MenuItemCategories = [
//   "Makanan Utama",
//   "Makanan Ringan",
//   "Minuman Panas",
//   "Minuman Dingin",
//   "Pencuci Mulut",
// ] as const;

// export type MenuItemCategory = typeof MenuItemCategories[number]; // Tidak lagi digunakan seperti ini
export type MenuItemCategory = string; // Kategori adalah string
