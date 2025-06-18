
"use client";

import type { Cafe, MenuItem } from '@/lib/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface StoreContextType {
  cafes: Cafe[];
  menuItems: MenuItem[];
  menuCategories: string[];
  isAuthenticated: boolean | undefined;
  isInitialized: boolean;
  login: (email: string, password: string) => boolean; // Updated signature
  logout: () => void;
  addCafe: (cafe: Omit<Cafe, 'id'>) => Cafe;
  getCafeById: (cafeId: string) => Cafe | undefined;
  editCafe: (cafeId: string, updatedCafeData: Omit<Cafe, 'id'>) => boolean;
  deleteCafe: (cafeId: string) => void;
  addMenuItem: (menuItem: Omit<MenuItem, 'id'>) => MenuItem;
  getMenuItemById: (menuItemId: string) => MenuItem | undefined;
  editMenuItem: (menuItemId: string, updatedMenuItemData: Omit<MenuItem, 'id' | 'cafeId'>) => boolean;
  deleteMenuItem: (menuItemId: string) => void;
  getMenuItemsByCafeId: (cafeId: string) => MenuItem[];
  addMenuCategory: (categoryName: string) => boolean;
  editMenuCategory: (oldName: string, newName: string) => boolean;
  deleteMenuCategory: (categoryName: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CAFE_STORAGE_KEY = 'caffeinator_cafes';
const MENU_ITEM_STORAGE_KEY = 'caffeinator_menuItems';
const MENU_CATEGORIES_STORAGE_KEY = 'caffeinator_menuCategories';
const AUTH_STATUS_KEY = 'caffeinator_authStatus';

const initialDefaultCategories = [
  "Makanan Utama",
  "Makanan Ringan",
  "Minuman Panas",
  "Minuman Dingin",
  "Pencuci Mulut",
];

// Hardcoded credentials for prototype
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedCafesRaw = localStorage.getItem(CAFE_STORAGE_KEY);
      setCafes(storedCafesRaw ? JSON.parse(storedCafesRaw) : []);

      const storedMenuItemsRaw = localStorage.getItem(MENU_ITEM_STORAGE_KEY);
      setMenuItems(storedMenuItemsRaw ? JSON.parse(storedMenuItemsRaw) : []);

      const storedMenuCategoriesRaw = localStorage.getItem(MENU_CATEGORIES_STORAGE_KEY);
      const parsedCategories = storedMenuCategoriesRaw ? JSON.parse(storedMenuCategoriesRaw) : null;
      setMenuCategories(Array.isArray(parsedCategories) && parsedCategories.length > 0 && parsedCategories.every(item => typeof item === 'string') ? parsedCategories : initialDefaultCategories);
      
      const storedAuthStatus = localStorage.getItem(AUTH_STATUS_KEY);
      setIsAuthenticated(storedAuthStatus === 'true');

    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      setCafes(prev => Array.isArray(prev) ? prev : []);
      setMenuItems(prev => Array.isArray(prev) ? prev : []);
      setMenuCategories(prev => Array.isArray(prev) && prev.length > 0 && prev.every(item => typeof item === 'string') ? prev : initialDefaultCategories);
      setIsAuthenticated(false);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CAFE_STORAGE_KEY, JSON.stringify(cafes));
        localStorage.setItem(MENU_ITEM_STORAGE_KEY, JSON.stringify(menuItems));
        localStorage.setItem(MENU_CATEGORIES_STORAGE_KEY, JSON.stringify(menuCategories));
        if (isAuthenticated !== undefined) {
          localStorage.setItem(AUTH_STATUS_KEY, String(isAuthenticated));
        }
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [cafes, menuItems, menuCategories, isAuthenticated, isInitialized]);

  const login = (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      return true;
    }
    setIsAuthenticated(false);
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STATUS_KEY);
  };

  const addCafe = (cafeData: Omit<Cafe, 'id'>) => {
    const newCafe: Cafe = { ...cafeData, id: Date.now().toString() };
    setCafes((prevCafes) => [...prevCafes, newCafe]);
    return newCafe;
  };

  const getCafeById = (cafeId: string) => {
    return cafes.find(cafe => cafe.id === cafeId);
  };

  const editCafe = (cafeId: string, updatedCafeData: Omit<Cafe, 'id'>) => {
    setCafes(prevCafes => 
      prevCafes.map(cafe => 
        cafe.id === cafeId ? { ...cafe, ...updatedCafeData } : cafe
      )
    );
    return true; 
  };

  const deleteCafe = (cafeId: string) => {
    setCafes(prevCafes => prevCafes.filter(cafe => cafe.id !== cafeId));
    setMenuItems(prevMenuItems => prevMenuItems.filter(item => item.cafeId !== cafeId));
  };

  const addMenuItem = (menuItemData: Omit<MenuItem, 'id'>) => {
    const newMenuItem: MenuItem = { ...menuItemData, id: Date.now().toString() };
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

  const addMenuCategory = (categoryName: string) => {
    if (menuCategories.includes(categoryName)) {
      return false; 
    }
    setMenuCategories((prevCategories) => [...prevCategories, categoryName].sort());
    return true;
  };

  const editMenuCategory = (oldName: string, newName: string) => {
    if (oldName === newName) return true; 
    if (menuCategories.includes(newName)) {
      return false; 
    }
    const oldNameIndex = menuCategories.indexOf(oldName);
    if (oldNameIndex === -1) {
      return false;
    }

    setMenuCategories((prevCategories) => {
      const updatedCategories = [...prevCategories];
      updatedCategories[oldNameIndex] = newName;
      return updatedCategories.sort();
    });

    setMenuItems((prevItems) => 
      prevItems.map(item => 
        item.category === oldName ? { ...item, category: newName } : item
      )
    );
    return true;
  };

  const deleteMenuCategory = (categoryName: string) => {
    setMenuCategories((prevCategories) => prevCategories.filter(cat => cat !== categoryName));
  };
  
  const providerValue: StoreContextType = {
    cafes,
    menuItems,
    menuCategories,
    isAuthenticated,
    isInitialized,
    login,
    logout,
    addCafe,
    getCafeById,
    editCafe,
    deleteCafe,
    addMenuItem,
    getMenuItemById,
    editMenuItem,
    deleteMenuItem,
    getMenuItemsByCafeId,
    addMenuCategory,
    editMenuCategory,
    deleteMenuCategory,
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
