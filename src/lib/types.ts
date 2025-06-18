export interface Cafe {
  id: string;
  name: string;
  address: string;
  contactInfo: string;
  imageUrl?: string;
}

export interface MenuItem {
  id: string;
  cafeId: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string; 
}

export type MenuItemCategory = string;
