import { PiggyBank } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex h-16 items-center border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <PiggyBank className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          FinanceFlow
        </h1>
      </div>
    </header>
  );
}
