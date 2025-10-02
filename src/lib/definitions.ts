import type { LucideIcon } from 'lucide-react';

export type Category = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  date: Date;
};

export type Earning = {
  id: string;
  description: string;
  amount: number;
  date: Date;
};

export type Budget = {
  categoryId: string;
  limit: number;
};
