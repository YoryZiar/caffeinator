export interface Cafe {
  id: string;
  name: string;
  address: string;
  contactInfo: string;
}

export interface MenuItem {
  id: string;
  cafeId: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
}

export const MenuItemCategories = [
  "Makanan Utama",
  "Makanan Ringan",
  "Minuman Panas",
  "Minuman Dingin",
  "Pencuci Mulut",
] as const;

export type MenuItemCategory = typeof MenuItemCategories[number];
