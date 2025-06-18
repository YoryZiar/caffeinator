
"use client";

import type { Cafe, MenuItem } from '@/lib/types';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface StoreContextType {
  cafes: Cafe[];
  menuItems: MenuItem[];
  addCafe: (cafe: Omit<Cafe, 'id'>) => Cafe;
  getCafeById: (cafeId: string) => Cafe | undefined;
  addMenuItem: (menuItem: Omit<MenuItem, 'id'>) => MenuItem;
  getMenuItemsByCafeId: (cafeId: string) => MenuItem[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CAFE_STORAGE_KEY = 'caffeinator_cafes';
const MENU_ITEM_STORAGE_KEY = 'caffeinator_menuItems';

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
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
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
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

  if (!isInitialized) {
    return null;
  }

  const providerValue = {
    cafes,
    menuItems,
    addCafe,
    getCafeById,
    addMenuItem,
    getMenuItemsByCafeId
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
