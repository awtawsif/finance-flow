
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { collection, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy, onSnapshot, writeBatch, getDocs, where, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { initialCategories as defaultCategories } from '@/lib/data';
import type { Expense, Category, Earning } from '@/lib/definitions';
import {
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { getIcon } from '@/lib/icons';

function restoreCategoryIcons(storedCategories: Omit<Category, 'icon'>[]): Category[] {
    const initialCategoryMap = new Map(defaultCategories.map(cat => [cat.id, cat.icon]));
    return storedCategories.map(cat => {
        const iconName = (cat as any).iconName || cat.icon || initialCategoryMap.get(cat.id);
        return {
          ...cat,
          icon: iconName || 'Shapes',
        };
    });
}

function processFirestoreTimestamp(item: any) {
  if (item.date && item.date instanceof Timestamp) {
    return { ...item, date: item.date.toDate() };
  }
  // For local data that might be stringified
  if (item.date && typeof item.date === 'string') {
    return { ...item, date: new Date(item.date) };
  }
  return item;
}

interface DataContextProps {
  isClient: boolean;
  expenses: Expense[];
  earnings: Earning[];
  categories: Category[];
  budgets: Record<string, number>;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addEarning: (earning: Omit<Earning, 'id' | 'date'>) => void;
  updateEarning: (earning: Earning) => void;
  deleteEarning: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  setBudget: (categoryId: string, limit: number) => void;
  expenseToEdit: Expense | null;
  setExpenseToEdit: (expense: Expense | null) => void;
  earningToEdit: Earning | null;
  setEarningToEdit: (earning: Earning | null) => void;
  categoryToEdit: Category | null;
  setCategoryToEdit: (category: Category | null) => void;
  handleExportData: () => void;
  handleImportClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showImportConfirm: boolean;
  setShowImportConfirm: (show: boolean) => void;
  confirmImport: () => void;
  showNukeConfirm: boolean;
  setShowNukeConfirm: (show: boolean) => void;
  confirmNuke: () => void;
  importedData: any;
  setImportedData: (data: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [earningToEdit, setEarningToEdit] = useState<Earning | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showNukeConfirm, setShowNukeConfirm] = useState(false);
  const [importedData, setImportedData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { firestore, user, isUserLoading } = useFirebase();
  const userId = user?.uid;

  // Effect to manage local storage loading
  useEffect(() => {
    setIsClient(true);
    if (isUserLoading || userId) return;

    const localExpenses = localStorage.getItem('expenses');
    if (localExpenses) {
      setExpenses(JSON.parse(localExpenses).map(processFirestoreTimestamp));
    }
    const localEarnings = localStorage.getItem('earnings');
    if (localEarnings) {
      setEarnings(JSON.parse(localEarnings).map(processFirestoreTimestamp));
    }
    const localCategories = localStorage.getItem('categories');
    if (localCategories) {
      setCategories(restoreCategoryIcons(JSON.parse(localCategories)));
    } else {
      setCategories(defaultCategories);
    }
    const localBudgets = localStorage.getItem('budgets');
    if (localBudgets) {
      setBudgets(JSON.parse(localBudgets));
    }
  }, [isUserLoading, userId]);

  // Effect to manage local storage saving
  useEffect(() => {
    if (isClient && !userId) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
      localStorage.setItem('earnings', JSON.stringify(earnings));
      localStorage.setItem('categories', JSON.stringify(categories));
      localStorage.setItem('budgets', JSON.stringify(budgets));
    }
  }, [expenses, earnings, categories, budgets, isClient, userId]);


  // Firebase refs
  const expensesRef = useMemo(() => userId ? collection(firestore, 'users', userId, 'expenses') : null, [firestore, userId]);
  const earningsRef = useMemo(() => userId ? collection(firestore, 'users', userId, 'earnings') : null, [firestore, userId]);
  const categoriesRef = useMemo(() => userId ? collection(firestore, 'users', userId, 'categories') : null, [firestore, userId]);
  const budgetsRef = useMemo(() => userId ? collection(firestore, 'users', userId, 'budgets') : null, [firestore, userId]);

  // Firebase Snapshots
  useEffect(() => {
    if (!expensesRef) return;
    const q = query(expensesRef, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...processFirestoreTimestamp(doc.data()) } as Expense));
      setExpenses(expensesData);
    }, (error) => console.error("Expenses snapshot error: ", error));
    return () => unsubscribe();
  }, [expensesRef]);

  useEffect(() => {
    if (!earningsRef) return;
    const q = query(earningsRef, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const earningsData = snapshot.docs.map(doc => ({ id: doc.id, ...processFirestoreTimestamp(doc.data()) } as Earning));
      setEarnings(earningsData);
    }, (error) => console.error("Earnings snapshot error: ", error));
    return () => unsubscribe();
  }, [earningsRef]);

  useEffect(() => {
    if (!categoriesRef) return;
    const unsubscribe = onSnapshot(categoriesRef, async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(firestore);
        defaultCategories.forEach(category => {
          const docRef = doc(categoriesRef, category.id);
          batch.set(docRef, category);
        });
        await batch.commit();
      } else {
        const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(restoreCategoryIcons(categoriesData));
      }
    }, (error) => console.error("Categories snapshot error: ", error));
    return () => unsubscribe();
  }, [categoriesRef, firestore]);
  
  useEffect(() => {
    if (!budgetsRef) return;
    const unsubscribe = onSnapshot(budgetsRef, (snapshot) => {
      const budgetsData = snapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data().limit;
        return acc;
      }, {} as Record<string, number>);
      setBudgets(budgetsData);
    }, (error) => console.error("Budgets snapshot error: ", error));
    return () => unsubscribe();
  }, [budgetsRef]);

  const addExpense = useCallback((newExpenseData: Omit<Expense, 'id' | 'date'>) => {
    const newId = uuidv4();
    const optimisticExpense = { ...newExpenseData, id: newId, date: new Date() };

    if (expensesRef) {
      setExpenses(prev => [optimisticExpense, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
      
      const docRef = doc(expensesRef, newId);
      const dataForFirestore = { ...newExpenseData, date: serverTimestamp() };
      setDocumentNonBlocking(docRef, dataForFirestore, {});
    } else {
      setExpenses(prev => [optimisticExpense, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
    }
  }, [expensesRef]);

  const updateExpense = useCallback((updatedExpense: Expense) => {
    if (expensesRef) {
      const docRef = doc(expensesRef, updatedExpense.id);
      const { id, ...data } = updatedExpense;
      setDocumentNonBlocking(docRef, data, { merge: true });
    } else {
      setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    }
    setExpenseToEdit(null);
  }, [expensesRef]);

  const deleteExpense = useCallback((expenseId: string) => {
    if (expensesRef) {
      const docRef = doc(expensesRef, expenseId);
      deleteDocumentNonBlocking(docRef);
    } else {
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
    }
  }, [expensesRef]);

  const addEarning = useCallback((newEarningData: Omit<Earning, 'id'|'date'>) => {
    const newId = uuidv4();
    const optimisticEarning = { ...newEarningData, id: newId, date: new Date() };
    if (earningsRef) {
      setEarnings(prev => [optimisticEarning, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));

      const docRef = doc(earningsRef, newId);
      const dataForFirestore = { ...newEarningData, date: serverTimestamp() };
      setDocumentNonBlocking(docRef, dataForFirestore, {});
    } else {
      setEarnings(prev => [optimisticEarning, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
    }
  }, [earningsRef]);

  const updateEarning = useCallback((updatedEarning: Earning) => {
    if (earningsRef) {
      const docRef = doc(earningsRef, updatedEarning.id);
      const { id, ...data } = updatedEarning;
      setDocumentNonBlocking(docRef, data, { merge: true });
    } else {
      setEarnings(prev => prev.map(e => e.id === updatedEarning.id ? updatedEarning : e));
    }
    setEarningToEdit(null);
  }, [earningsRef]);

  const deleteEarning = useCallback((earningId: string) => {
    if (earningsRef) {
      const docRef = doc(earningsRef, earningId);
      deleteDocumentNonBlocking(docRef);
    } else {
      setEarnings(prev => prev.filter(e => e.id !== earningId));
    }
  }, [earningsRef]);

  const setBudget = useCallback((categoryId: string, limit: number) => {
    if (budgetsRef) {
      const docRef = doc(budgetsRef, categoryId);
      setDocumentNonBlocking(docRef, { limit }, { merge: true });
    } else {
      setBudgets(prev => ({ ...prev, [categoryId]: limit }));
    }
  }, [budgetsRef]);

  const addCategory = useCallback((categoryData: Omit<Category, 'id'>) => {
    const newId = uuidv4();
    const newCategory = { ...categoryData, id: newId };
    if (categoriesRef) {
        const docRef = doc(categoriesRef, newId);
        setDocumentNonBlocking(docRef, categoryData, {});
    } else {
      setCategories(prev => [...prev, newCategory]);
    }
  }, [categoriesRef]);

  const updateCategory = useCallback((updatedCategory: Category) => {
    if (categoriesRef) {
      const docRef = doc(categoriesRef, updatedCategory.id);
      const { id, ...data } = updatedCategory;
      setDocumentNonBlocking(docRef, data, { merge: true });
    } else {
      setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    }
    setCategoryToEdit(null);
  }, [categoriesRef]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    if (userId && firestore && categoriesRef && expensesRef && budgetsRef) {
      const categoryDocRef = doc(categoriesRef, categoryId);
      const budgetDocRef = doc(budgetsRef, categoryId);
      const expensesToDeleteQuery = query(expensesRef, where("categoryId", "==", categoryId));
      
      try {
        const batch = writeBatch(firestore);
        
        // Delete the category document
        batch.delete(categoryDocRef);
        
        // Check if the budget document exists before trying to delete it
        const budgetDocSnap = await getDoc(budgetDocRef);
        if (budgetDocSnap.exists()) {
          batch.delete(budgetDocRef);
        }
        
        // Find and delete all expenses associated with the category
        const expenseSnapshot = await getDocs(expensesToDeleteQuery);
        expenseSnapshot.forEach(doc => batch.delete(doc.ref));
        
        await batch.commit();
      } catch (error) {
        console.error("Error deleting category and associated data: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not delete category." });
      }
    } else {
      // Local data deletion
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setExpenses(prev => prev.filter(e => e.categoryId !== categoryId));
      setBudgets(prev => {
        const newBudgets = { ...prev };
        delete newBudgets[categoryId];
        return newBudgets;
      });
    }
  }, [userId, firestore, categoriesRef, expensesRef, budgetsRef, toast]);

  const handleExportData = () => {
    const dataToExport = {
      expenses,
      earnings,
      categories,
      budgets,
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financeflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Data Exported', description: 'Your data has been successfully downloaded.' });
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File is not valid text");
        const parsedData = JSON.parse(text);
        if (parsedData.expenses && parsedData.categories && parsedData.budgets) {
          setImportedData(parsedData);
          setShowImportConfirm(true);
        } else {
          throw new Error("Invalid data structure in JSON file.");
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Import Failed', description: error instanceof Error ? error.message : 'Could not read or parse the file.' });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };
  
  const confirmImport = async () => {
    if (!importedData) return;

    if (userId && firestore) {
      try {
        const batch = writeBatch(firestore);
        // Clear existing data first
        const collections = ['expenses', 'earnings', 'categories', 'budgets'];
        for (const colName of collections) {
          const snapshot = await getDocs(collection(firestore, 'users', userId, colName));
          snapshot.forEach(doc => batch.delete(doc.ref));
        }
        await batch.commit();
        
        // Write new data
        const newBatch = writeBatch(firestore);
        importedData.categories.forEach((cat: any) => newBatch.set(doc(firestore, 'users', userId, 'categories', cat.id), cat));
        importedData.expenses.forEach((exp: any) => newBatch.set(doc(firestore, 'users', userId, 'expenses', exp.id), { ...exp, date: new Date(exp.date) }));
        (importedData.earnings || []).forEach((earn: any) => newBatch.set(doc(firestore, 'users', userId, 'earnings', earn.id), { ...earn, date: new Date(earn.date) }));
        Object.entries(importedData.budgets).forEach(([catId, limit]) => newBatch.set(doc(firestore, 'users', userId, 'budgets', catId), { limit }));
        await newBatch.commit();
        toast({ title: 'Import Successful', description: 'Your data has been restored.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Import Failed', description: 'Could not write data to the database.' });
      }
    } else {
      // Local import
      setExpenses(importedData.expenses.map(processFirestoreTimestamp));
      setEarnings((importedData.earnings || []).map(processFirestoreTimestamp));
      setCategories(restoreCategoryIcons(importedData.categories));
      setBudgets(importedData.budgets);
      toast({ title: 'Import Successful', description: 'Your data has been restored locally.' });
    }
    
    setShowImportConfirm(false);
    setImportedData(null);
  };
  
  const confirmNuke = async () => {
    if (userId && firestore) {
      const collections = ['expenses', 'earnings', 'categories', 'budgets'];
      try {
        const batch = writeBatch(firestore);
        for (const collectionName of collections) {
          const colRef = collection(firestore, 'users', userId, collectionName);
          const snapshot = await getDocs(query(colRef));
          snapshot.forEach(doc => batch.delete(doc.ref));
        }
        await batch.commit();
        toast({ variant: 'destructive', title: 'Cloud Data Cleared', description: 'All your cloud data has been permanently deleted.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to clear cloud data.' });
      }
    } else {
      // Nuke local data
      setExpenses([]);
      setEarnings([]);
      setCategories(defaultCategories);
      setBudgets({});
      localStorage.removeItem('expenses');
      localStorage.removeItem('earnings');
      localStorage.removeItem('categories');
      localStorage.removeItem('budgets');
      toast({ variant: 'destructive', title: 'Local Data Cleared', description: 'All your local data has been deleted.' });
    }
    setShowNukeConfirm(false);
  };
  

  const value = {
    isClient,
    expenses,
    earnings,
    categories,
    budgets,
    addExpense,
    updateExpense,
    deleteExpense,
    addEarning,
    updateEarning,
    deleteEarning,
    addCategory,
    updateCategory,
    deleteCategory,
    setBudget,
    expenseToEdit,
    setExpenseToEdit,
    earningToEdit,
    setEarningToEdit,
    categoryToEdit,
    setCategoryToEdit,
    handleExportData,
    handleImportClick,
    fileInputRef,
    handleFileChange,
    showImportConfirm,
    setShowImportConfirm,
    confirmImport,
    showNukeConfirm,
    setShowNukeConfirm,
    confirmNuke,
    importedData,
    setImportedData,
    searchQuery,
    setSearchQuery,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}
