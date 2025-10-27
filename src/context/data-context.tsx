'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { collection, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy, onSnapshot, writeBatch } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { Shapes } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initialCategories as defaultCategories } from '@/lib/data';
import type { Expense, Category, Earning } from '@/lib/definitions';
import {
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { Timestamp } from 'firebase/firestore';

function restoreCategoryIcons(storedCategories: Omit<Category, 'icon'>[]): Category[] {
    const initialCategoryMap = new Map(defaultCategories.map(cat => [cat.id, cat.icon]));
    return storedCategories.map(cat => {
        return {
          ...cat,
          icon: initialCategoryMap.get(cat.id) || Shapes,
        };
    });
}

function processFirestoreTimestamp(item: any) {
  if (item.date && item.date instanceof Timestamp) {
    return { ...item, date: item.date.toDate() };
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
  addCategory: (category: { name: string, color: string }) => void;
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
  
  const { firestore, user } = useFirebase();
  const userId = user?.uid;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const expensesRef = useMemo(() => userId ? collection(firestore, 'users', userId, 'expenses') : null, [firestore, userId]);
  const earningsRef = useMemo(() => userId ? collection(firestore, 'users', userId, 'earnings') : null, [firestore, userId]);
  const categoriesRef = useMemo(() => userId ? collection(firestore, 'users', userId, 'categories') : null, [firestore, userId]);
  const budgetsRef = useMemo(() => userId ? collection(firestore, 'users', userId, 'budgets') : null, [firestore, userId]);

  useEffect(() => {
    if (!expensesRef) return;
    const q = query(expensesRef, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...processFirestoreTimestamp(doc.data()) } as Expense));
      setExpenses(expensesData);
    });
    return () => unsubscribe();
  }, [expensesRef]);

  useEffect(() => {
    if (!earningsRef) return;
    const q = query(earningsRef, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const earningsData = snapshot.docs.map(doc => ({ id: doc.id, ...processFirestoreTimestamp(doc.data()) } as Earning));
      setEarnings(earningsData);
    });
    return () => unsubscribe();
  }, [earningsRef]);

  useEffect(() => {
    if (!categoriesRef) return;
    const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
      if (snapshot.empty) {
        // If no categories in Firestore, populate with default ones
        const batch = writeBatch(firestore);
        defaultCategories.forEach(category => {
          const { icon, ...serializableCategory } = category;
          const docRef = doc(categoriesRef, category.id);
          batch.set(docRef, serializableCategory);
        });
        batch.commit();
      } else {
        const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Omit<Category, 'icon'>));
        setCategories(restoreCategoryIcons(categoriesData));
      }
    });
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
    });
    return () => unsubscribe();
  }, [budgetsRef]);


  const addExpense = useCallback((newExpenseData: Omit<Expense, 'id' | 'date'>) => {
    if (!expensesRef) return;
    const data = {
      ...newExpenseData,
      date: serverTimestamp(),
    };
    addDocumentNonBlocking(expensesRef, data);
  }, [expensesRef]);

  const updateExpense = useCallback((updatedExpense: Expense) => {
    if (!expensesRef) return;
    const docRef = doc(expensesRef, updatedExpense.id);
    const { id, ...data } = updatedExpense;
    updateDocumentNonBlocking(docRef, data);
    setExpenseToEdit(null);
  }, [expensesRef]);

  const deleteExpense = useCallback((expenseId: string) => {
    if (!expensesRef) return;
    const docRef = doc(expensesRef, expenseId);
    deleteDocumentNonBlocking(docRef);
  }, [expensesRef]);


  const addEarning = useCallback((newEarningData: Omit<Earning, 'id'|'date'>) => {
    if (!earningsRef) return;
    const data = {
      ...newEarningData,
      date: serverTimestamp(),
    };
    addDocumentNonBlocking(earningsRef, data);
  }, [earningsRef]);

  const updateEarning = useCallback((updatedEarning: Earning) => {
    if (!earningsRef) return;
    const docRef = doc(earningsRef, updatedEarning.id);
    const { id, ...data } = updatedEarning;
    updateDocumentNonBlocking(docRef, data);
    setEarningToEdit(null);
  }, [earningsRef]);

  const deleteEarning = useCallback((earningId: string) => {
    if (!earningsRef) return;
    const docRef = doc(earningsRef, earningId);
    deleteDocumentNonBlocking(docRef);
  }, [earningsRef]);

  
  const setBudget = useCallback((categoryId: string, limit: number) => {
    if (!budgetsRef) return;
    const docRef = doc(budgetsRef, categoryId);
    setDocumentNonBlocking(docRef, { limit }, { merge: true });
  }, [budgetsRef]);


  const addCategory = useCallback((categoryData: { name: string; color: string }) => {
    if (!categoriesRef) return;
    addDocumentNonBlocking(categoriesRef, categoryData);
  }, [categoriesRef]);

  const updateCategory = useCallback((updatedCategory: Category) => {
    if (!categoriesRef) return;
    const docRef = doc(categoriesRef, updatedCategory.id);
    const { id, icon, ...data } = updatedCategory;
    updateDocumentNonBlocking(docRef, data);
    setCategoryToEdit(null);
  }, [categoriesRef]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    if (!userId || !firestore) return;
    const categoryDocRef = doc(firestore, 'users', userId, 'categories', categoryId);
    const budgetDocRef = doc(firestore, 'users', userId, 'budgets', categoryId);

    // This is a complex operation (query + multiple deletes), better to handle with care and possibly a backend function in a real app.
    // For client-side, we'll do our best.
    const expensesToDeleteQuery = query(collection(firestore, 'users', userId, 'expenses'), where => where("categoryId", "==", categoryId));
    
    try {
        const batch = writeBatch(firestore);
        
        // Delete the category and budget
        batch.delete(categoryDocRef);
        batch.delete(budgetDocRef);

        // Delete associated expenses
        const expenseSnapshot = await getDocs(expensesToDeleteQuery);
        expenseSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

    } catch (error) {
        console.error("Error deleting category and associated data: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete category and its expenses."
        });
    }

  }, [userId, firestore, toast]);


  const handleExportData = () => {
    const dataToExport = {
      expenses,
      earnings,
      categories: categories.map(({ icon, ...rest }) => rest),
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
        console.error("Import error:", error);
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: error instanceof Error ? error.message : 'Could not read or parse the file.',
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };
  
  const confirmImport = async () => {
    if (!importedData || !userId || !firestore) return;
  
    try {
      const batch = writeBatch(firestore);
  
      // Set Categories
      const importedCategories = importedData.categories;
      importedCategories.forEach((cat: any) => {
        const catRef = doc(firestore, 'users', userId, 'categories', cat.id);
        batch.set(catRef, cat);
      });
  
      // Set Expenses
      importedData.expenses.forEach((exp: any) => {
        const expRef = doc(firestore, 'users', userId, 'expenses', exp.id);
        batch.set(expRef, { ...exp, date: new Date(exp.date) });
      });
  
      // Set Earnings
      const earningsToImport = importedData.earnings || [];
      earningsToImport.forEach((earn: any) => {
        const earnRef = doc(firestore, 'users', userId, 'earnings', earn.id);
        batch.set(earnRef, { ...earn, date: new Date(earn.date) });
      });

      // Set Budgets
      Object.entries(importedData.budgets).forEach(([catId, limit]) => {
        const budgetRef = doc(firestore, 'users', userId, 'budgets', catId);
        batch.set(budgetRef, { limit });
      });
  
      await batch.commit();
  
      toast({ title: 'Import Successful', description: 'Your data has been restored.' });
    } catch (error) {
      console.error('Batch import failed:', error);
      toast({ variant: 'destructive', title: 'Import Failed', description: 'Could not write data to the database.' });
    } finally {
      setShowImportConfirm(false);
      setImportedData(null);
    }
  };
  
  const confirmNuke = async () => {
    if (!userId || !firestore) return;
  
    const collections = ['expenses', 'earnings', 'categories', 'budgets'];
  
    try {
      const batch = writeBatch(firestore);
  
      for (const collectionName of collections) {
        const colRef = collection(firestore, 'users', userId, collectionName);
        const snapshot = await getDocs(query(colRef));
        snapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
      }
  
      await batch.commit();
  
      toast({
        variant: 'destructive',
        title: 'Data Cleared',
        description: 'All your cloud data has been permanently deleted.',
      });
    } catch (error) {
      console.error('Error clearing all data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to clear all data.',
      });
    } finally {
      setShowNukeConfirm(false);
    }
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
