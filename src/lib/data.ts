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
  { id: 'cat-1', name: 'Food', icon: UtensilsCrossed, color: '#22C55E' }, // Green
  { id: 'cat-2', name: 'Transportation', icon: Car, color: '#EF4444' }, // Red
  { id: 'cat-3', name: 'Utilities', icon: Home, color: '#3B82F6' }, // Blue
  { id: 'cat-4', name: 'Entertainment', icon: Ticket, color: '#EAB308' }, // Yellow
  { id: 'cat-5', name: 'Health', icon: HeartPulse, color: '#8B5CF6' }, // Purple
  { id: 'cat-6', name: 'Shopping', icon: ShoppingBag, color: '#EC4899' }, // Pink
  { id: 'cat-7', name: 'Other', icon: Ellipsis, color: '#6B7280' }, // Gray
];

export const initialExpenses: Expense[] = [];

export const initialBudgets: Budget[] = [];
