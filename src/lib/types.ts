
export interface User {
  id: string; // uuid or email
  email: string;
  password: string; // Plain text for prototype, hash in production
  role: 'superadmin' | 'cafeadmin';
  cafeId?: string; // For cafeadmin, links to the Cafe they own
}

export interface Cafe {
  id: string;
  name: string;
  address: string;
  contactInfo: string;
  imageUrl?: string;
  ownerUserId: string; // Links to the User who owns/administers this cafe
}

export interface MenuItem {
  id: string;
  cafeId: string; // Ensures menu item is tied to a specific cafe
  name: string;
  imageUrl: string;
  price: number;
  category: string;
}

// MenuItemCategory is just a string, but categories will be stored per cafe in the store
export type MenuItemCategory = string;
