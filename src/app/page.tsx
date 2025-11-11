'use client';
import { useUser } from '@/firebase';
import Header from '@/components/header';
import Dashboard from '@/components/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
           <div className="flex flex-col gap-8">
              <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
                 <Skeleton className="h-9 w-48" />
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
               </div>
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                   <Skeleton className="h-96 rounded-xl" />
                   <Skeleton className="h-96 rounded-xl" />
                </div>
           </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <Dashboard />
      </main>
    </div>
  );
}
