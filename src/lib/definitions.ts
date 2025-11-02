import type { LucideIcon } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export type Category = {
  id: string;
  name: string;
  icon: string; // Icon name as a string
  color: string;
};

// For Firestore, we often deal with Timestamps
export type Expense_DB = Omit<Expense, 'date' | 'id'> & { date: Timestamp };
export type Expense = {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  date: Date;
};

export type Earning_DB = Omit<Earning, 'date' | 'id'> & { date: Timestamp };
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

export type Shortcut = {
  id: string;
  name: string;
  description: string;
  amount: number;
  categoryId: string;
};
