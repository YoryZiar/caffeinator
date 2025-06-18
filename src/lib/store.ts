
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

// Changed keys to reflect IndexedDB usage for images
const CAFE_STORAGE_KEY = 'caffeinator_cafes_v7_metadata';
const MENU_ITEM_STORAGE_KEY = 'caffeinator_menuItems_v7_metadata';
const MENU_CATEGORIES_BY_CAFE_STORAGE_KEY = 'caffeinator_menuCategoriesByCafe_v3'; // Incremented if structure changes
const USERS_STORAGE_KEY = 'caffeinator_users_v3'; // Incremented if structure changes
const CURRENT_USER_STORAGE_KEY = 'caffeinator_currentUser_v3'; // Incremented


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

// IndexedDB Helper Functions
const DB_NAME = "CaffeinatorImageDB";
const IMAGE_STORE_NAME = "imageStore";

function openImageDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject("Error opening IndexedDB: " + request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        db.createObjectStore(IMAGE_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

async function saveImageToDB(id: string, dataUrl: string): Promise<void> {
  if (!dataUrl || !dataUrl.startsWith('data:')) return; // Only save actual Data URIs
  try {
    const db = await openImageDB();
    const transaction = db.transaction(IMAGE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    store.put({ id, dataUrl });
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject("Transaction error: " + transaction.error);
    });
  } catch (error) {
    console.error(`Failed to save image ${id} to IndexedDB:`, error);
  }
}

async function loadImageFromDB(id: string): Promise<string | undefined> {
  try {
    const db = await openImageDB();
    const transaction = db.transaction(IMAGE_STORE_NAME, 'readonly');
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    const request = store.get(id);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result?.dataUrl);
      };
      request.onerror = () => {
        console.error(`Error loading image ${id} from DB:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to load image ${id} from IndexedDB:`, error);
    return undefined;
  }
}

async function deleteImageFromDB(id: string): Promise<void> {
  try {
    const db = await openImageDB();
    const transaction = db.transaction(IMAGE_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    store.delete(id);
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject("Transaction error: " + transaction.error);
    });
  } catch (error) {
    console.error(`Failed to delete image ${id} from IndexedDB:`, error);
  }
}


export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategoriesByCafe, setMenuCategoriesByCafe] = useState<Record<string, string[]>>({});
  const [users, setUsers] = useState<User[]>([initialSuperAdminUser]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const storedCafesRaw = localStorage.getItem(CAFE_STORAGE_KEY);
        let loadedCafes: Cafe[] = storedCafesRaw ? JSON.parse(storedCafesRaw) : [];
        for (let cafe of loadedCafes) {
          const imageDataUrl = await loadImageFromDB(cafe.id);
          if (imageDataUrl) cafe.imageUrl = imageDataUrl;
        }
        setCafes(loadedCafes);

        const storedMenuItemsRaw = localStorage.getItem(MENU_ITEM_STORAGE_KEY);
        let loadedMenuItems: MenuItem[] = storedMenuItemsRaw ? JSON.parse(storedMenuItemsRaw) : [];
        for (let item of loadedMenuItems) {
          const imageDataUrl = await loadImageFromDB(item.id);
          if (imageDataUrl) item.imageUrl = imageDataUrl;
        }
        setMenuItems(loadedMenuItems);

        const storedMenuCategoriesRaw = localStorage.getItem(MENU_CATEGORIES_BY_CAFE_STORAGE_KEY);
        setMenuCategoriesByCafe(storedMenuCategoriesRaw ? JSON.parse(storedMenuCategoriesRaw) : {});
        
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
        console.error("Error loading data from localStorage/IndexedDB:", error);
        // Reset to empty/initial state on error
        setCafes([]);
        setMenuItems([]);
        setMenuCategoriesByCafe({});
        setUsers([initialSuperAdminUser]);
        setCurrentUser(null);
      }
      setIsInitialized(true);
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        // Prepare cafes for localStorage: remove Data URI images before saving metadata
        const cafesMetadata = cafes.map(cafe => {
          const { imageUrl, ...restOfCafe } = cafe;
          // Store only external URLs or undefined in localStorage for imageUrl
          return { ...restOfCafe, imageUrl: (imageUrl && !imageUrl.startsWith('data:')) ? imageUrl : undefined };
        });
        localStorage.setItem(CAFE_STORAGE_KEY, JSON.stringify(cafesMetadata));

        // Prepare menu items for localStorage: remove Data URI images
        const menuItemsMetadata = menuItems.map(item => {
          const { imageUrl, ...restOfItem } = item;
          return { ...restOfItem, imageUrl: (imageUrl && !imageUrl.startsWith('data:')) ? imageUrl : undefined };
        });
        localStorage.setItem(MENU_ITEM_STORAGE_KEY, JSON.stringify(menuItemsMetadata));
        
        localStorage.setItem(MENU_CATEGORIES_BY_CAFE_STORAGE_KEY, JSON.stringify(menuCategoriesByCafe));
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        
        if (currentUser) {
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
        } else {
          localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to save metadata to localStorage:", error);
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
      imageUrl: cafeData.imageUrl, // This is the Data URI from upload, will be in React state
      id: newCafeId,
      ownerUserId: newAdminId,
    };

    if (newCafe.imageUrl && newCafe.imageUrl.startsWith('data:')) {
      saveImageToDB(newCafe.id, newCafe.imageUrl).catch(console.error);
    }

    setUsers(prevUsers => [...prevUsers, newAdminUser]);
    setCafes(prevCafes => [...prevCafes, newCafe]);
    setMenuCategoriesByCafe(prev => ({ ...prev, [newCafeId]: [...initialDefaultCategories] }));
    setCurrentUser(newAdminUser); 
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
      imageUrl: cafeData.imageUrl, 
      id: newCafeId,
      ownerUserId: newAdminId,
    };

    if (newCafe.imageUrl && newCafe.imageUrl.startsWith('data:')) {
      saveImageToDB(newCafe.id, newCafe.imageUrl).catch(console.error);
    }

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
    let oldImageUrl: string | undefined;
    setCafes(prevCafes =>
      prevCafes.map(cafe => {
        if (cafe.id === cafeId) {
          oldImageUrl = cafe.imageUrl;
          const newDetails: Cafe = {
            ...cafe,
            name: updatedCafeData.name ?? cafe.name,
            address: updatedCafeData.address ?? cafe.address,
            contactInfo: updatedCafeData.contactInfo ?? cafe.contactInfo,
            imageUrl: typeof updatedCafeData.imageUrl !== 'undefined' ? updatedCafeData.imageUrl : cafe.imageUrl,
          };

          if (newDetails.imageUrl && newDetails.imageUrl.startsWith('data:') && newDetails.imageUrl !== oldImageUrl) {
            saveImageToDB(cafe.id, newDetails.imageUrl).catch(console.error);
          } else if (typeof updatedCafeData.imageUrl !== 'undefined' && !newDetails.imageUrl && oldImageUrl?.startsWith('data:')) {
            // Image was removed or changed to non-DataURI, delete from DB if it was a DataURI
             deleteImageFromDB(cafe.id).catch(console.error);
          }


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

    // Delete cafe image from IndexedDB
    if (cafeToDelete.imageUrl && cafeToDelete.imageUrl.startsWith('data:')) {
      deleteImageFromDB(cafeToDelete.id).catch(console.error);
    }
    
    // Delete images of menu items associated with this cafe
    const itemsOfCafe = menuItems.filter(item => item.cafeId === cafeId);
    itemsOfCafe.forEach(item => {
      if (item.imageUrl && item.imageUrl.startsWith('data:')) {
        deleteImageFromDB(item.id).catch(console.error);
      }
    });

    setCafes(prevCafes => prevCafes.filter(cafe => cafe.id !== cafeId));
    setMenuItems(prevMenuItems => prevMenuItems.filter(item => item.cafeId !== cafeId));
    setMenuCategoriesByCafe(prev => {
      const { [cafeId]: _, ...rest } = prev;
      return rest;
    });
    setUsers(prevUsers => prevUsers.filter(user => user.cafeId !== cafeId));
    
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
      imageUrl: menuItemData.imageUrl, 
    };
    if (newMenuItem.imageUrl && newMenuItem.imageUrl.startsWith('data:')) {
      saveImageToDB(newMenuItem.id, newMenuItem.imageUrl).catch(console.error);
    }
    setMenuItems((prevMenuItems) => [...prevMenuItems, newMenuItem]);
    return newMenuItem;
  };

  const getMenuItemById = (menuItemId: string) => {
    return menuItems.find(item => item.id === menuItemId);
  };

  const editMenuItem = (menuItemId: string, updatedMenuItemData: Omit<MenuItem, 'id' | 'cafeId' | 'imageUrl'> & { imageUrl?: string }) => {
    let oldImageUrl: string | undefined;
    setMenuItems(prevItems =>
      prevItems.map(item => {
        if (item.id === menuItemId) {
          oldImageUrl = item.imageUrl;
          const newDetails = { 
            ...item, 
            name: updatedMenuItemData.name ?? item.name,
            price: updatedMenuItemData.price ?? item.price,
            category: updatedMenuItemData.category ?? item.category,
            imageUrl: typeof updatedMenuItemData.imageUrl !== 'undefined' ? updatedMenuItemData.imageUrl : item.imageUrl,
          };
          if (newDetails.imageUrl && newDetails.imageUrl.startsWith('data:') && newDetails.imageUrl !== oldImageUrl) {
             saveImageToDB(item.id, newDetails.imageUrl).catch(console.error);
          } else if (typeof updatedMenuItemData.imageUrl !== 'undefined' && !newDetails.imageUrl && oldImageUrl?.startsWith('data:')) {
             deleteImageFromDB(item.id).catch(console.error);
          }
          return newDetails;
        }
        return item;
      })
    );
    return true;
  };

  const deleteMenuItem = (menuItemId: string) => {
    const itemToDelete = menuItems.find(item => item.id === menuItemId);
    if (itemToDelete && itemToDelete.imageUrl && itemToDelete.imageUrl.startsWith('data:')) {
      deleteImageFromDB(itemToDelete.id).catch(console.error);
    }
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

