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

export const initialExpenses: Expense[] = [
  { id: 'exp-1', description: 'Groceries', amount: 75.43, categoryId: 'cat-1', date: new Date('2024-07-20T10:00:00Z') },
  { id: 'exp-2', description: 'Gasoline', amount: 45.00, categoryId: 'cat-2', date: new Date('2024-07-20T12:30:00Z') },
  { id: 'exp-3', description: 'Electricity Bill', amount: 120.00, categoryId: 'cat-3', date: new Date('2024-07-19T09:00:00Z') },
  { id: 'exp-4', description: 'Movie tickets', amount: 30.00, categoryId: 'cat-4', date: new Date('2024-07-18T20:00:00Z') },
  { id: 'exp-5', description: 'Pharmacy', amount: 25.50, categoryId: 'cat-5', date: new Date('2024-07-18T15:00:00Z') },
  { id: 'exp-6', description: 'Dinner out', amount: 60.20, categoryId: 'cat-1', date: new Date('2024-07-17T19:00:00Z') },
  { id: 'exp-7', description: 'New shoes', amount: 99.99, categoryId: 'cat-6', date: new Date('2024-07-16T16:45:00Z') },
  { id: 'exp-8', description: 'Coffee shop', amount: 5.75, categoryId: 'cat-1', date: new Date('2024-07-21T08:30:00Z') },
  { id: 'exp-9', description: 'Public transport pass', amount: 55.00, categoryId: 'cat-2', date: new Date('2024-07-01T08:00:00Z')},
];

export const initialBudgets: Budget[] = [
  { categoryId: 'cat-1', limit: 500 },
  { categoryId: 'cat-2', limit: 150 },
  { categoryId: 'cat-3', limit: 200 },
  { categoryId: 'cat-4', limit: 100 },
  { categoryId: 'cat-5', limit: 80 },
  { categoryId: 'cat-6', limit: 250 },
];

export const spendingSummary = {
  title: "Your Financial Health: Good!",
  analysis: "You're doing a great job staying within your budget this month. Your spending on 'Food' is slightly higher than usual, but you're saving significantly in 'Transportation'. Keep it up!",
};

export const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
