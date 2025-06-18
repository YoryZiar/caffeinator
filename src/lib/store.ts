
"use client";

import type { Cafe, MenuItem } from '@/lib/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface StoreContextType {
  cafes: Cafe[];
  menuItems: MenuItem[];
  menuCategories: string[];
  addCafe: (cafe: Omit<Cafe, 'id'>) => Cafe;
  getCafeById: (cafeId: string) => Cafe | undefined;
  addMenuItem: (menuItem: Omit<MenuItem, 'id'>) => MenuItem;
  getMenuItemsByCafeId: (cafeId: string) => MenuItem[];
  addMenuCategory: (categoryName: string) => boolean; // return true if added, false if duplicate
  editMenuCategory: (oldName: string, newName: string) => boolean; // return true if edited, false if newName exists or oldName not found
  deleteMenuCategory: (categoryName: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CAFE_STORAGE_KEY = 'caffeinator_cafes';
const MENU_ITEM_STORAGE_KEY = 'caffeinator_menuItems';
const MENU_CATEGORIES_STORAGE_KEY = 'caffeinator_menuCategories';

const initialDefaultCategories = [
  "Makanan Utama",
  "Makanan Ringan",
  "Minuman Panas",
  "Minuman Dingin",
  "Pencuci Mulut",
];

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedCafes = localStorage.getItem(CAFE_STORAGE_KEY);
      if (storedCafes) {
        setCafes(JSON.parse(storedCafes));
      }
      const storedMenuItems = localStorage.getItem(MENU_ITEM_STORAGE_KEY);
      if (storedMenuItems) {
        setMenuItems(JSON.parse(storedMenuItems));
      }
      const storedMenuCategories = localStorage.getItem(MENU_CATEGORIES_STORAGE_KEY);
      if (storedMenuCategories) {
        setMenuCategories(JSON.parse(storedMenuCategories));
      } else {
        setMenuCategories(initialDefaultCategories);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
       // Initialize with defaults if parsing fails or on first load
      if (menuCategories.length === 0) setMenuCategories(initialDefaultCategories);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CAFE_STORAGE_KEY, JSON.stringify(cafes));
      } catch (error) {
        console.error("Failed to save cafes to localStorage", error);
      }
    }
  }, [cafes, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(MENU_ITEM_STORAGE_KEY, JSON.stringify(menuItems));
      } catch (error) {
        console.error("Failed to save menu items to localStorage", error);
      }
    }
  }, [menuItems, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(MENU_CATEGORIES_STORAGE_KEY, JSON.stringify(menuCategories));
      } catch (error) {
        console.error("Failed to save menu categories to localStorage", error);
      }
    }
  }, [menuCategories, isInitialized]);

  const addCafe = (cafeData: Omit<Cafe, 'id'>) => {
    const newCafe: Cafe = { ...cafeData, id: Date.now().toString() };
    setCafes((prevCafes) => [...prevCafes, newCafe]);
    return newCafe;
  };

  const getCafeById = (cafeId: string) => {
    return cafes.find(cafe => cafe.id === cafeId);
  };

  const addMenuItem = (menuItemData: Omit<MenuItem, 'id'>) => {
    const newMenuItem: MenuItem = { ...menuItemData, id: Date.now().toString() };
    setMenuItems((prevMenuItems) => [...prevMenuItems, newMenuItem]);
    return newMenuItem;
  };

  const getMenuItemsByCafeId = (cafeId: string) => {
    return menuItems.filter(item => item.cafeId === cafeId);
  };

  const addMenuCategory = (categoryName: string) => {
    if (menuCategories.includes(categoryName)) {
      return false; // Duplicate
    }
    setMenuCategories((prevCategories) => [...prevCategories, categoryName].sort());
    return true;
  };

  const editMenuCategory = (oldName: string, newName: string) => {
    if (oldName === newName) return true; // No change needed
    if (menuCategories.includes(newName)) {
      return false; // New name already exists
    }
    const oldNameIndex = menuCategories.indexOf(oldName);
    if (oldNameIndex === -1) {
      return false; // Old name not found
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
    // Menu items using this category will retain the category string.
    // They just won't be editable with this category in forms unless re-added.
  };
  
  if (!isInitialized) {
    // Return a loading state or null to prevent premature rendering of consumers
    return null; 
  }

  const providerValue = {
    cafes,
    menuItems,
    menuCategories,
    addCafe,
    getCafeById,
    addMenuItem,
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
