
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PiggyBank, LogOut, LogIn, MoreHorizontal, Bolt, Shapes, Upload, Download, AlertTriangle } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';

interface HeaderProps {
    handleImportClick: () => void;
    handleExportData: () => void;
    setShowNukeConfirm: (show: boolean) => void;
}

export default function Header({ handleImportClick, handleExportData, setShowNukeConfirm }: HeaderProps) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignOut = () => {
    auth?.signOut();
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '...';
    const names = name.split(' ');
    return names
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  };

  const actionItems = (
    <>
        <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => document.getElementById('add-shortcut-trigger')?.click()}>
            <Bolt className="mr-2 h-4 w-4" />
            Add Shortcut
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => document.getElementById('manage-shortcuts-trigger')?.click()}>
            <Shapes className="mr-2 h-4 w-4" />
            Manage Shortcuts
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => document.getElementById('add-category-trigger')?.click()}>
            <Shapes className="mr-2 h-4 w-4" />
            Add Category
            </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
            <DropdownMenuItem onSelect={handleImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Import Data
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
            </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setShowNukeConfirm(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Clear All Data
            </DropdownMenuItem>
        </DropdownMenuGroup>
    </>
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <PiggyBank className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          FinanceFlow
        </h1>
      </Link>
      <div className="flex items-center gap-2">
        {isUserLoading ? (
          <Skeleton className="h-10 w-10 rounded-full" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {actionItems}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
           <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="sr-only">Actions</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {actionItems}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/login">
                          <LogIn className="mr-2 h-4 w-4" />
                          Sign In
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )}
      </div>
    </header>
  );
}
