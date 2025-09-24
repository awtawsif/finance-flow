import {
  UtensilsCrossed,
  Car,
  Home,
  Ticket,
  HeartPulse,
  ShoppingBag,
  Ellipsis,
} from 'lucide-react';
import type { Category, Expense, Budget } from '@/lib/definitions';

export const categories: Category[] = [
  { id: 'cat-1', name: 'Food', icon: UtensilsCrossed, color: 'hsl(var(--chart-1))' },
  { id: 'cat-2', name: 'Transportation', icon: Car, color: 'hsl(var(--chart-2))' },
  { id: 'cat-3', name: 'Utilities', icon: Home, color: 'hsl(var(--chart-3))' },
  { id: 'cat-4', name: 'Entertainment', icon: Ticket, color: 'hsl(var(--chart-4))' },
  { id: 'cat-5', name: 'Health', icon: HeartPulse, color: 'hsl(var(--chart-5))' },
  { id: 'cat-6', name: 'Shopping', icon: ShoppingBag, color: 'hsl(19.3, 91.1%, 53.3%)' },
  { id: 'cat-7', name: 'Other', icon: Ellipsis, color: 'hsl(210, 40%, 56.1%)' },
];

export const initialExpenses: Expense[] = [];

export const initialBudgets: Budget[] = [];

export const spendingSummary = {
  title: "Your Financial Health",
  analysis: "Start adding expenses and setting budgets to see your financial health analysis.",
};

export const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
