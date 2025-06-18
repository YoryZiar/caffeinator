
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Coffee, List, UserPlus, LogIn, LogOut, LayoutDashboard, Settings, PlusCircle, Menu } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

export function Navbar() {
  const { currentUser, logout, isInitialized } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Coffee className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg">Caffeinator</span>
        </Link>

        {/* Desktop Navigation & Auth */}
        <div className="hidden md:flex items-center space-x-4 ml-auto">
          <nav className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            <Button variant="ghost" asChild className="text-xs sm:text-sm">
              <Link href="/" >
                <List className="mr-1 h-4 w-4" />
                Daftar Kafe
              </Link>
            </Button>
            {isInitialized && currentUser?.role === 'superadmin' && (
              <Button variant="ghost" asChild className="text-xs sm:text-sm">
                <Link href="/add-cafe-by-superadmin">
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Tambah Kafe (SA)
                </Link>
              </Button>
            )}
            {isInitialized && currentUser?.role === 'cafeadmin' && currentUser.cafeId && (
              <>
                <Button variant="ghost" asChild className="text-xs sm:text-sm">
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-1 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="text-xs sm:text-sm">
                  <Link href={`/cafes/${currentUser.cafeId}`}>
                    <Coffee className="mr-1 h-4 w-4" />
                    Kelola Menu Saya
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="text-xs sm:text-sm">
                  <Link href={`/cafes/${currentUser.cafeId}/manage-categories`}>
                    <Settings className="mr-1 h-4 w-4" />
                    Kelola Kategori Saya
                  </Link>
                </Button>
              </>
            )}
          </nav>
          <div className="flex items-center space-x-2">
            {isInitialized && !currentUser && (
              <>
                <Button variant="outline" asChild className="text-xs sm:text-sm">
                  <Link href="/login">
                    <LogIn className="mr-1 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button asChild className="text-xs sm:text-sm">
                  <Link href="/register">
                    <UserPlus className="mr-1 h-4 w-4" />
                    Daftar Kafe
                  </Link>
                </Button>
              </>
            )}
            {isInitialized && currentUser && (
              <Button variant="outline" onClick={handleLogout} className="text-xs sm:text-sm">
                <LogOut className="mr-1 h-4 w-4" />
                Logout ({currentUser.email.split('@')[0]})
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden ml-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <nav className="flex flex-col space-y-2 mt-6">
                <SheetClose asChild>
                  <Button variant="ghost" asChild className="w-full justify-start text-base py-3">
                    <Link href="/">
                      <List className="mr-2 h-5 w-5" />
                      Daftar Kafe
                    </Link>
                  </Button>
                </SheetClose>

                {isInitialized && currentUser?.role === 'superadmin' && (
                  <SheetClose asChild>
                    <Button variant="ghost" asChild className="w-full justify-start text-base py-3">
                      <Link href="/add-cafe-by-superadmin">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Tambah Kafe (SA)
                      </Link>
                    </Button>
                  </SheetClose>
                )}

                {isInitialized && currentUser?.role === 'cafeadmin' && currentUser.cafeId && (
                  <>
                    <SheetClose asChild>
                      <Button variant="ghost" asChild className="w-full justify-start text-base py-3">
                        <Link href="/dashboard">
                          <LayoutDashboard className="mr-2 h-5 w-5" />
                          Dashboard
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="ghost" asChild className="w-full justify-start text-base py-3">
                        <Link href={`/cafes/${currentUser.cafeId}`}>
                          <Coffee className="mr-2 h-5 w-5" />
                          Kelola Menu Saya
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="ghost" asChild className="w-full justify-start text-base py-3">
                        <Link href={`/cafes/${currentUser.cafeId}/manage-categories`}>
                          <Settings className="mr-2 h-5 w-5" />
                          Kelola Kategori Saya
                        </Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
                
                {(isInitialized && (!currentUser || currentUser)) && <hr className="my-3"/>}


                {isInitialized && !currentUser && (
                  <>
                    <SheetClose asChild>
                      <Button variant="outline" asChild className="w-full justify-start text-base py-3">
                        <Link href="/login">
                          <LogIn className="mr-2 h-5 w-5" />
                          Login
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full justify-start text-base py-3">
                        <Link href="/register">
                          <UserPlus className="mr-2 h-5 w-5" />
                          Daftar Kafe
                        </Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
                {isInitialized && currentUser && (
                  <SheetClose asChild>
                    <Button variant="outline" onClick={handleLogout} className="w-full justify-start text-base py-3">
                      <LogOut className="mr-2 h-5 w-5" />
                       Logout ({currentUser.email.split('@')[0]})
                    </Button>
                  </SheetClose>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
