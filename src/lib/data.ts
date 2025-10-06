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

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Food', icon: UtensilsCrossed, color: '#34D399' }, // Green
  { id: 'cat-2', name: 'Transportation', icon: Car, color: '#F87171' }, // Red
  { id: 'cat-3', name: 'Utilities', icon: Home, color: '#60A5FA' }, // Blue
  { id: 'cat-4', name: 'Entertainment', icon: Ticket, color: '#FBBF24' }, // Amber
  { id: 'cat-5', name: 'Health', icon: HeartPulse, color: '#A78BFA' }, // Purple
  { id: 'cat-6', name: 'Shopping', icon: ShoppingBag, color: '#F472B6' }, // Pink
  { id: 'cat-7', name: 'Other', icon: Ellipsis, color: '#9CA3AF' }, // Gray
];

export const initialExpenses: Expense[] = [];

export const initialBudgets: Budget[] = [];
