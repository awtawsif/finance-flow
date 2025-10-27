import type { Category } from '@/lib/definitions';

// This is now just the default set for NEW users.
// Existing users' categories will be loaded from Firestore.
export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Food', icon: 'UtensilsCrossed', color: '#22C55E' },
  { id: 'cat-2', name: 'Transportation', icon: 'Car', color: '#EF4444' },
  { id: 'cat-3', name: 'Utilities', icon: 'Home', color: '#3B82F6' },
  { id: 'cat-8', name: 'Grocery', icon: 'ShoppingBasket', color: '#F97316' },
  { id: 'cat-4', name: 'Entertainment', icon: 'Ticket', color: '#EAB308' },
  { id: 'cat-5', name: 'Health', icon: 'HeartPulse', color: '#8B5CF6' },
  { id: 'cat-6', name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899' },
  { id: 'cat-7', name: 'Other', icon: 'Ellipsis', color: '#6B7280' },
];
