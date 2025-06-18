
"use client";

import type { Cafe, MenuItem, User } from '@/lib/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface StoreContextType {
  cafes: Cafe[];
  menuItems: MenuItem[];
  menuCategoriesByCafe: Record<string, string[]>; // cafeId -> string[]
  users: User[];
  currentUser: User | null;
  isInitialized: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  registerCafeAndAdmin: (
    cafeData: Omit<Cafe, 'id' | 'ownerUserId' | 'imageUrl'> & { imageUrl?: string },
    adminData: Omit<User, 'id' | 'role' | 'cafeId'>
  ) => { success: boolean; message?: string; newCafe?: Cafe, newUser?: User };
  addCafeBySuperAdmin: (
    cafeData: Omit<Cafe, 'id' | 'ownerUserId' | 'imageUrl'> & { imageUrl?: string },
    adminEmail: string, adminPassword: string
  ) => { success: boolean; message?: string; newCafe?: Cafe, newUser?: User };
  getCafeById: (cafeId: string) => Cafe | undefined;
  editCafe: (
    cafeId: string,
    updatedCafeData: Partial<Omit<Cafe, 'id' | 'ownerUserId' | 'imageUrl'>> & { imageUrl?: string },
    newAdminPassword?: string
  ) => boolean;
  deleteCafe: (cafeId: string) => void;
  addMenuItem: (menuItem: Omit<MenuItem, 'id' | 'imageUrl'> & { imageUrl?: string }) => MenuItem;
  getMenuItemById: (menuItemId: string) => MenuItem | undefined;
  editMenuItem: (menuItemId: string, updatedMenuItemData: Omit<MenuItem, 'id' | 'cafeId' | 'imageUrl'> & { imageUrl?: string }) => boolean;
  deleteMenuItem: (menuItemId: string) => void;
  getMenuItemsByCafeId: (cafeId: string) => MenuItem[];
  getMenuCategoriesForCafe: (cafeId: string) => string[];
  addMenuCategoryForCafe: (cafeId: string, categoryName: string) => boolean;
  editMenuCategoryForCafe: (cafeId: string, oldName: string, newName: string) => boolean;
  deleteMenuCategoryForCafe: (cafeId: string, categoryName: string) => void;
  getTotalMenuItemCount: () => number;
  getTotalUniqueCategoryCount: () => number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CAFE_STORAGE_KEY = 'caffeinator_cafes_v6_image_volatile';
const MENU_ITEM_STORAGE_KEY = 'caffeinator_menuItems_v6_image_volatile';
const MENU_CATEGORIES_BY_CAFE_STORAGE_KEY = 'caffeinator_menuCategoriesByCafe_v2';
const USERS_STORAGE_KEY = 'caffeinator_users_v2';
const CURRENT_USER_STORAGE_KEY = 'caffeinator_currentUser_v2';


const initialDefaultCategories = [
  "Makanan Utama",
  "Makanan Ringan",
  "Minuman Panas",
  "Minuman Dingin",
  "Pencuci Mulut",
];

const SUPERADMIN_ID = "superadmin-001";
const SUPERADMIN_EMAIL = "superadmin@example.com";
const SUPERADMIN_PASSWORD = "superadmin123";

const initialSuperAdminUser: User = {
  id: SUPERADMIN_ID,
  email: SUPERADMIN_EMAIL,
  password: SUPERADMIN_PASSWORD,
  role: 'superadmin',
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategoriesByCafe, setMenuCategoriesByCafe] = useState<Record<string, string[]>>({});
  const [users, setUsers] = useState<User[]>([initialSuperAdminUser]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedCafesRaw = localStorage.getItem(CAFE_STORAGE_KEY);
      // When loading, imageUrl might be missing if it was a Data URI.
      // Components should handle undefined imageUrl by showing placeholders.
      setCafes(storedCafesRaw ? JSON.parse(storedCafesRaw) : []);

      const storedMenuItemsRaw = localStorage.getItem(MENU_ITEM_STORAGE_KEY);
      setMenuItems(storedMenuItemsRaw ? JSON.parse(storedMenuItemsRaw) : []);

      const storedMenuCategoriesRaw = localStorage.getItem(MENU_CATEGORIES_BY_CAFE_STORAGE_KEY);
      const parsedMenuCategories = storedMenuCategoriesRaw ? JSON.parse(storedMenuCategoriesRaw) : {};
      setMenuCategoriesByCafe(parsedMenuCategories);
      
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const parsedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      if (!parsedUsers.find((u: User) => u.id === SUPERADMIN_ID)) {
        setUsers([initialSuperAdminUser, ...parsedUsers.filter((u: User) => u.id !== SUPERADMIN_ID)]);
      } else {
        setUsers(parsedUsers);
      }

      const storedCurrentUserRaw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      setCurrentUser(storedCurrentUserRaw ? JSON.parse(storedCurrentUserRaw) : null);

    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      setCafes([]);
      setMenuItems([]);
      setMenuCategoriesByCafe({});
      setUsers([initialSuperAdminUser]);
      setCurrentUser(null);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        // Prepare cafes for storage: remove Data URI images
        const cafesToStore = cafes.map(cafe => {
          const { imageUrl, ...restOfCafe } = cafe;
          // Only keep imageUrl if it's NOT a Data URI
          if (imageUrl && imageUrl.startsWith('data:')) {
            return restOfCafe; 
          }
          // If it's an external URL (like placeholder) or undefined, keep as is (or with the external URL)
          return { ...restOfCafe, imageUrl: imageUrl && !imageUrl.startsWith('data:') ? imageUrl : undefined };
        });
        localStorage.setItem(CAFE_STORAGE_KEY, JSON.stringify(cafesToStore));

        // Prepare menu items for storage: remove Data URI images
        const menuItemsToStore = menuItems.map(item => {
          const { imageUrl, ...restOfItem } = item;
          if (imageUrl && imageUrl.startsWith('data:')) {
            return restOfItem;
          }
          return { ...restOfItem, imageUrl: imageUrl && !imageUrl.startsWith('data:') ? imageUrl : undefined };
        });
        localStorage.setItem(MENU_ITEM_STORAGE_KEY, JSON.stringify(menuItemsToStore));
        
        localStorage.setItem(MENU_CATEGORIES_BY_CAFE_STORAGE_KEY, JSON.stringify(menuCategoriesByCafe));
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        
        if (currentUser) {
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
        } else {
          localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to save data to localStorage. Data URIs for images are not persisted to avoid quota issues:", error);
      }
    }
  }, [cafes, menuItems, menuCategoriesByCafe, users, currentUser, isInitialized]);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    setCurrentUser(null);
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const registerCafeAndAdmin = (
    cafeData: Omit<Cafe, 'id' | 'ownerUserId' | 'imageUrl'> & { imageUrl?: string },
    adminData: Omit<User, 'id' | 'role' | 'cafeId'>
  ) => {
    if (users.find(u => u.email === adminData.email)) {
      return { success: false, message: "Email sudah terdaftar." };
    }

    const newAdminId = `user-${Date.now()}`;
    const newCafeId = `cafe-${Date.now()}`;

    const newAdminUser: User = {
      id: newAdminId,
      email: adminData.email,
      password: adminData.password,
      role: 'cafeadmin',
      cafeId: newCafeId,
    };

    const newCafe: Cafe = {
      name: cafeData.name,
      address: cafeData.address,
      contactInfo: cafeData.contactInfo,
      imageUrl: cafeData.imageUrl, // This is the Data URI from upload, will be transient
      id: newCafeId,
      ownerUserId: newAdminId,
    };

    setUsers(prevUsers => [...prevUsers, newAdminUser]);
    setCafes(prevCafes => [...prevCafes, newCafe]);
    setMenuCategoriesByCafe(prev => ({ ...prev, [newCafeId]: [...initialDefaultCategories] }));
    setCurrentUser(newAdminUser); // Auto-login after registration
    return { success: true, newCafe, newUser: newAdminUser };
  };
  
  const addCafeBySuperAdmin = (
    cafeData: Omit<Cafe, 'id' | 'ownerUserId' | 'imageUrl'> & { imageUrl?: string },
    adminEmail: string, adminPassword: string
  ) => {
     if (users.find(u => u.email === adminEmail)) {
      return { success: false, message: "Email admin sudah terdaftar untuk pengguna lain." };
    }
    const newAdminId = `user-sa-${Date.now()}`;
    const newCafeId = `cafe-sa-${Date.now()}`;

    const newAdminUser: User = {
      id: newAdminId,
      email: adminEmail,
      password: adminPassword,
      role: 'cafeadmin',
      cafeId: newCafeId,
    };
    const newCafe: Cafe = {
      name: cafeData.name,
      address: cafeData.address,
      contactInfo: cafeData.contactInfo,
      imageUrl: cafeData.imageUrl, // Transient Data URI
      id: newCafeId,
      ownerUserId: newAdminId,
    };
    setUsers(prev => [...prev, newAdminUser]);
    setCafes(prev => [...prev, newCafe]);
    setMenuCategoriesByCafe(prev => ({ ...prev, [newCafeId]: [...initialDefaultCategories] }));
    return { success: true, newCafe, newUser: newAdminUser };
  };


  const getCafeById = (cafeId: string) => {
    return cafes.find(cafe => cafe.id === cafeId);
  };

  const editCafe = (
    cafeId: string,
    updatedCafeData: Partial<Omit<Cafe, 'id' | 'ownerUserId' | 'imageUrl'>> & { imageUrl?: string },
    newAdminPassword?: string
  ) => {
    setCafes(prevCafes =>
      prevCafes.map(cafe => {
        if (cafe.id === cafeId) {
          const newDetails: Cafe = {
            ...cafe,
            name: updatedCafeData.name ?? cafe.name,
            address: updatedCafeData.address ?? cafe.address,
            contactInfo: updatedCafeData.contactInfo ?? cafe.contactInfo,
            // If imageUrl is provided in updatedCafeData, it's a new Data URI (transient)
            // If not, we keep the existing imageUrl (which might be an external URL or undefined)
            imageUrl: typeof updatedCafeData.imageUrl !== 'undefined' ? updatedCafeData.imageUrl : cafe.imageUrl,
          };

          if (newAdminPassword && currentUser?.role === 'superadmin') {
             setUsers(prevUsers => prevUsers.map(u => {
               if (u.cafeId === cafeId && u.role === 'cafeadmin') {
                 return { ...u, password: newAdminPassword };
               }
               return u;
             }));
          }
          return newDetails;
        }
        return cafe;
      })
    );
    return true;
  };


  const deleteCafe = (cafeId: string) => {
    const cafeToDelete = cafes.find(c => c.id === cafeId);
    if (!cafeToDelete) return;

    setCafes(prevCafes => prevCafes.filter(cafe => cafe.id !== cafeId));
    setMenuItems(prevMenuItems => prevMenuItems.filter(item => item.cafeId !== cafeId));
    setMenuCategoriesByCafe(prev => {
      const { [cafeId]: _, ...rest } = prev;
      return rest;
    });
    // Also remove the cafe admin user associated with this cafe
    setUsers(prevUsers => prevUsers.filter(user => user.cafeId !== cafeId));
    
    // If the currently logged-in user is the admin of the deleted cafe, log them out
    if (currentUser && currentUser.role === 'cafeadmin' && currentUser.cafeId === cafeId) {
        logout();
    }
  };

  const addMenuItem = (menuItemData: Omit<MenuItem, 'id' | 'imageUrl'> & { imageUrl?: string }) => {
    const newMenuItem: MenuItem = { 
      id: `menu-${Date.now()}`,
      cafeId: menuItemData.cafeId,
      name: menuItemData.name,
      price: menuItemData.price,
      category: menuItemData.category,
      imageUrl: menuItemData.imageUrl, // Transient Data URI
    };
    setMenuItems((prevMenuItems) => [...prevMenuItems, newMenuItem]);
    return newMenuItem;
  };

  const getMenuItemById = (menuItemId: string) => {
    return menuItems.find(item => item.id === menuItemId);
  };

  const editMenuItem = (menuItemId: string, updatedMenuItemData: Omit<MenuItem, 'id' | 'cafeId' | 'imageUrl'> & { imageUrl?: string }) => {
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === menuItemId ? { 
          ...item, 
          name: updatedMenuItemData.name ?? item.name,
          price: updatedMenuItemData.price ?? item.price,
          category: updatedMenuItemData.category ?? item.category,
          imageUrl: typeof updatedMenuItemData.imageUrl !== 'undefined' ? updatedMenuItemData.imageUrl : item.imageUrl, // New transient Data URI or keep old
        } : item
      )
    );
    return true;
  };

  const deleteMenuItem = (menuItemId: string) => {
    setMenuItems(prevItems => prevItems.filter(item => item.id !== menuItemId));
  };

  const getMenuItemsByCafeId = (cafeId: string) => {
    return menuItems.filter(item => item.cafeId === cafeId);
  };

  const getMenuCategoriesForCafe = (cafeId: string): string[] => {
    return menuCategoriesByCafe[cafeId] || [];
  };

  const addMenuCategoryForCafe = (cafeId: string, categoryName: string) => {
    const currentCategories = menuCategoriesByCafe[cafeId] || [];
    if (currentCategories.includes(categoryName)) {
      return false; // Category already exists
    }
    const newCategories = [...currentCategories, categoryName].sort();
    setMenuCategoriesByCafe(prev => ({ ...prev, [cafeId]: newCategories }));
    return true;
  };

  const editMenuCategoryForCafe = (cafeId: string, oldName: string, newName: string) => {
    const currentCategories = menuCategoriesByCafe[cafeId] || [];
    if (oldName === newName) return true; // No change needed
    if (currentCategories.includes(newName)) return false; // New name already exists
    
    const oldNameIndex = currentCategories.indexOf(oldName);
    if (oldNameIndex === -1) return false; // Old name not found

    const updatedCategoriesList = [...currentCategories];
    updatedCategoriesList[oldNameIndex] = newName;
    
    setMenuCategoriesByCafe(prev => ({ ...prev, [cafeId]: updatedCategoriesList.sort() }));
    // Update category name in all menu items of this cafe
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.cafeId === cafeId && item.category === oldName ? { ...item, category: newName } : item
      )
    );
    return true;
  };

  const deleteMenuCategoryForCafe = (cafeId: string, categoryName: string) => {
    const currentCategories = menuCategoriesByCafe[cafeId] || [];
    const newCategories = currentCategories.filter(cat => cat !== categoryName);
    setMenuCategoriesByCafe(prev => ({ ...prev, [cafeId]: newCategories }));
    // Note: Menu items using this category will still exist but might show the old category name
    // or you might want to handle this differently (e.g., assign a default category).
    // For simplicity, we'll leave them as is. Re-editing the item would allow category change.
  };

  const getTotalMenuItemCount = () => menuItems.length;

  const getTotalUniqueCategoryCount = () => {
    const allCategories = new Set<string>();
    Object.values(menuCategoriesByCafe).forEach(cafeCategories => {
      cafeCategories.forEach(cat => allCategories.add(cat));
    });
    return allCategories.size;
  };
  
  const providerValue: StoreContextType = {
    cafes,
    menuItems,
    menuCategoriesByCafe,
    users,
    currentUser,
    isInitialized,
    login,
    logout,
    registerCafeAndAdmin,
    addCafeBySuperAdmin,
    getCafeById,
    editCafe,
    deleteCafe,
    addMenuItem,
    getMenuItemById,
    editMenuItem,
    deleteMenuItem,
    getMenuItemsByCafeId,
    getMenuCategoriesForCafe,
    addMenuCategoryForCafe,
    editMenuCategoryForCafe,
    deleteMenuCategoryForCafe,
    getTotalMenuItemCount,
    getTotalUniqueCategoryCount,
  };

  return React.createElement(
    StoreContext.Provider,
    { value: providerValue },
    children
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

