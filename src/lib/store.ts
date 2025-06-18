"use client";

import type { Cafe, MenuItem, User } from '@/lib/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface StoreContextType {
  cafes: Cafe[];
  menuItems: MenuItem[];
  menuCategoriesByCafe: Record<string, string[]>; // cafeId -> string[]
  currentUser: User | null;
  isInitialized: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  registerCafeAndAdmin: (
    cafeData: Omit<Cafe, 'id' | 'ownerUserId'>,
    adminData: Omit<User, 'id' | 'role' | 'cafeId'>
  ) => { success: boolean; message?: string; newCafe?: Cafe, newUser?: User };
  addCafeBySuperAdmin: (cafeData: Omit<Cafe, 'id' | 'ownerUserId'>, adminEmail: string, adminPassword: string) => { success: boolean; message?: string; newCafe?: Cafe, newUser?: User };
  getCafeById: (cafeId: string) => Cafe | undefined;
  editCafe: (cafeId: string, updatedCafeData: Partial<Omit<Cafe, 'id' | 'ownerUserId'>>, newAdminPassword?: string) => boolean;
  deleteCafe: (cafeId: string) => void;
  addMenuItem: (menuItem: Omit<MenuItem, 'id'>) => MenuItem;
  getMenuItemById: (menuItemId: string) => MenuItem | undefined;
  editMenuItem: (menuItemId: string, updatedMenuItemData: Omit<MenuItem, 'id' | 'cafeId'>) => boolean;
  deleteMenuItem: (menuItemId: string) => void;
  getMenuItemsByCafeId: (cafeId: string) => MenuItem[];
  getMenuCategoriesForCafe: (cafeId: string) => string[];
  addMenuCategoryForCafe: (cafeId: string, categoryName: string) => boolean;
  editMenuCategoryForCafe: (cafeId: string, oldName: string, newName: string) => boolean;
  deleteMenuCategoryForCafe: (cafeId: string, categoryName: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CAFE_STORAGE_KEY = 'caffeinator_cafes_v2';
const MENU_ITEM_STORAGE_KEY = 'caffeinator_menuItems_v2';
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

// Hardcoded superadmin
const SUPERADMIN_ID = "superadmin-001";
const SUPERADMIN_EMAIL = "superadmin@example.com";
const SUPERADMIN_PASSWORD = "superadmin123";

const initialSuperAdminUser: User = {
  id: SUPERADMIN_ID,
  email: SUPERADMIN_EMAIL,
  password: SUPERADMIN_PASSWORD, // In real app, store hashed passwords
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
      setCafes(storedCafesRaw ? JSON.parse(storedCafesRaw) : []);

      const storedMenuItemsRaw = localStorage.getItem(MENU_ITEM_STORAGE_KEY);
      setMenuItems(storedMenuItemsRaw ? JSON.parse(storedMenuItemsRaw) : []);

      const storedMenuCategoriesRaw = localStorage.getItem(MENU_CATEGORIES_BY_CAFE_STORAGE_KEY);
      setMenuCategoriesByCafe(storedMenuCategoriesRaw ? JSON.parse(storedMenuCategoriesRaw) : {});
      
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const parsedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      // Ensure superadmin always exists
      if (!parsedUsers.find((u: User) => u.id === SUPERADMIN_ID)) {
        setUsers([initialSuperAdminUser, ...parsedUsers.filter((u: User) => u.id !== SUPERADMIN_ID)]);
      } else {
        setUsers(parsedUsers);
      }

      const storedCurrentUserRaw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      setCurrentUser(storedCurrentUserRaw ? JSON.parse(storedCurrentUserRaw) : null);

    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      // Reset to defaults or handle error appropriately
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
        localStorage.setItem(CAFE_STORAGE_KEY, JSON.stringify(cafes));
        localStorage.setItem(MENU_ITEM_STORAGE_KEY, JSON.stringify(menuItems));
        localStorage.setItem(MENU_CATEGORIES_BY_CAFE_STORAGE_KEY, JSON.stringify(menuCategoriesByCafe));
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        if (currentUser) {
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
        } else {
          localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [cafes, menuItems, menuCategoriesByCafe, users, currentUser, isInitialized]);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password); // Plain text check for proto
    if (user) {
      setCurrentUser(user);
      return true;
    }
    setCurrentUser(null);
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  const registerCafeAndAdmin = (
    cafeData: Omit<Cafe, 'id' | 'ownerUserId'>,
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
      password: adminData.password, // Store plain for proto
      role: 'cafeadmin',
      cafeId: newCafeId,
    };

    const newCafe: Cafe = {
      ...cafeData,
      id: newCafeId,
      ownerUserId: newAdminId,
    };

    setUsers(prevUsers => [...prevUsers, newAdminUser]);
    setCafes(prevCafes => [...prevCafes, newCafe]);
    setMenuCategoriesByCafe(prev => ({ ...prev, [newCafeId]: [...initialDefaultCategories] }));
    setCurrentUser(newAdminUser); // Auto-login after registration
    return { success: true, newCafe, newUser: newAdminUser };
  };
  
  const addCafeBySuperAdmin = (cafeData: Omit<Cafe, 'id' | 'ownerUserId'>, adminEmail: string, adminPassword: string) => {
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
      ...cafeData,
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

  const editCafe = (cafeId: string, updatedCafeData: Partial<Omit<Cafe, 'id' | 'ownerUserId'>>, newAdminPassword?: string) => {
    let cafeAdminUpdated = false;
    setCafes(prevCafes =>
      prevCafes.map(cafe => {
        if (cafe.id === cafeId) {
          const newDetails = { ...cafe, ...updatedCafeData };
          // If adminEmail is part of updatedCafeData and it changed, or newAdminPassword is provided
          if (('adminEmail' in updatedCafeData && updatedCafeData.adminEmail !== cafe.adminEmail) || newAdminPassword) {
             setUsers(prevUsers => prevUsers.map(u => {
               if (u.cafeId === cafeId && u.role === 'cafeadmin') {
                 cafeAdminUpdated = true;
                 return {
                   ...u,
                   email: ('adminEmail' in updatedCafeData && updatedCafeData.adminEmail) ? updatedCafeData.adminEmail : u.email,
                   password: newAdminPassword || u.password
                 };
               }
               return u;
             }));
          }
          // The adminEmail field is not directly on Cafe type anymore, it's linked via ownerUserId
          // This part of logic for updating adminEmail directly on cafe needs to be rethought if adminEmail is not on Cafe.
          // For now, let's assume `updatedCafeData` might contain `adminEmail` if superadmin is changing it.
          // This editCafe function is primarily for cafe details like name, address, image.
          // Owner changes are more complex and might need a separate flow or be restricted.
          return newDetails;
        }
        return cafe;
      })
    );
    return true; // Simplified return
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
    setUsers(prevUsers => prevUsers.filter(user => user.cafeId !== cafeId && user.id !== cafeToDelete.ownerUserId));
     // If the deleted cafe's admin is the current user, log them out
    if (currentUser && currentUser.cafeId === cafeId) {
        logout();
    }
  };

  const addMenuItem = (menuItemData: Omit<MenuItem, 'id'>) => {
    const newMenuItem: MenuItem = { ...menuItemData, id: `menu-${Date.now()}` };
    setMenuItems((prevMenuItems) => [...prevMenuItems, newMenuItem]);
    return newMenuItem;
  };

  const getMenuItemById = (menuItemId: string) => {
    return menuItems.find(item => item.id === menuItemId);
  };

  const editMenuItem = (menuItemId: string, updatedMenuItemData: Omit<MenuItem, 'id' | 'cafeId'>) => {
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === menuItemId ? { ...item, ...updatedMenuItemData } : item
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
      return false;
    }
    const newCategories = [...currentCategories, categoryName].sort();
    setMenuCategoriesByCafe(prev => ({ ...prev, [cafeId]: newCategories }));
    return true;
  };

  const editMenuCategoryForCafe = (cafeId: string, oldName: string, newName: string) => {
    const currentCategories = menuCategoriesByCafe[cafeId] || [];
    if (oldName === newName) return true;
    if (currentCategories.includes(newName)) return false;
    
    const oldNameIndex = currentCategories.indexOf(oldName);
    if (oldNameIndex === -1) return false;

    const updatedCategoriesList = [...currentCategories];
    updatedCategoriesList[oldNameIndex] = newName;
    
    setMenuCategoriesByCafe(prev => ({ ...prev, [cafeId]: updatedCategoriesList.sort() }));
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
    // Items with this category are not deleted, just the category from the list.
  };
  
  const providerValue: StoreContextType = {
    cafes,
    menuItems,
    menuCategoriesByCafe,
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
