
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Mail, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, currentUser, isInitialized } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (isInitialized && currentUser) {
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (currentUser.role === 'cafeadmin') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [currentUser, isInitialized, router, searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      toast({
        title: "Login Berhasil!",
        description: "Selamat datang kembali.",
      });
      // Redirection is handled by useEffect
    } else {
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: "Email atau password yang Anda masukkan salah.",
      });
    }
  };

  if (!isInitialized || currentUser === undefined) { 
    return <div className="text-center py-10">Memuat...</div>;
  }
  
  if (currentUser) { 
     return <div className="text-center py-10">Anda sudah login. Mengarahkan...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-xl sm:text-2xl text-primary text-center">Login</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm">Masukkan email dan password Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center text-xs sm:text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password Anda"
              />
            </div>
            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-xs text-muted-foreground text-center w-full">
            Belum punya akun kafe?
          </p>
          <Button variant="outline" asChild className="w-full">
            <Link href="/register">
              <UserPlus className="mr-2 h-4 w-4" />
              Daftarkan Kafe Anda
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
