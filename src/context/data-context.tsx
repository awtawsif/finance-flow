'use client';

import * as React from 'react';
import { Shapes } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initialCategories } from '@/lib/data';
import type { Expense, Category, Earning } from '@/lib/definitions';

// Helper to get data from localStorage
function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  const storedValue = localStorage.getItem(key);
  if (storedValue) {
    try {
      return JSON.parse(storedValue, (k, v) => {
        // Reviver function to convert date strings back to Date objects
        if (k === 'date' && typeof v === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(v)) {
          return new Date(v);
        }
        return v;
      });
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return defaultValue;
    }
  }
  return defaultValue;
}

// Helper to restore icon functions to categories loaded from localStorage
function restoreCategoryIcons(storedCategories: Omit<Category, 'icon'>[]): Category[] {
  const initialCategoryMap = new Map(initialCategories.map(cat => [cat.id, cat.icon]));
  return storedCategories.map(cat => {
      return {
        ...cat,
        icon: initialCategoryMap.get(cat.id) || Shapes,
      };
  });
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
}

const DataContext = React.createContext<DataContextProps | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = React.useState(false);

  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [earnings, setEarnings] = React.useState<Earning[]>([]);
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [budgets, setBudgets] = React.useState<Record<string, number>>({});
  
  const [expenseToEdit, setExpenseToEdit] = React.useState<Expense | null>(null);
  const [earningToEdit, setEarningToEdit] = React.useState<Earning | null>(null);
  const [categoryToEdit, setCategoryToEdit] = React.useState<Category | null>(null);
  const [showImportConfirm, setShowImportConfirm] = React.useState(false);
  const [showNukeConfirm, setShowNukeConfirm] = React.useState(false);
  const [importedData, setImportedData] = React.useState<any>(null);

  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load data from localStorage on initial client-side render
  React.useEffect(() => {
    setExpenses(getFromLocalStorage<Expense[]>('expenses', []));
    setEarnings(getFromLocalStorage<Earning[]>('earnings', []));
    
    const storedCategories = restoreCategoryIcons(getFromLocalStorage<Omit<Category, 'icon'>[]>('categories', initialCategories.map(({ icon, ...rest }) => rest)));
    setCategories(storedCategories);

    setBudgets(getFromLocalStorage<Record<string, number>>('budgets', {}));
    setIsClient(true);
  }, []);

  
  // Persist state to localStorage whenever it changes
  React.useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses, isClient]);

  React.useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('earnings', JSON.stringify(earnings));
  }, [earnings, isClient]);
  
  React.useEffect(() => {
    if (!isClient) return;
    const serializableCategories = categories.map(({ icon, ...rest }) => rest);
    localStorage.setItem('categories', JSON.stringify(serializableCategories));

  }, [categories, isClient]);
  
  React.useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets, isClient]);

  const addExpense = React.useCallback((newExpenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: `exp-${Date.now()}`,
      date: new Date(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  }, []);
  
  const updateExpense = React.useCallback((updatedExpense: Expense) => {
    setExpenses((prev) => 
      prev.map((expense) => 
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
    setExpenseToEdit(null);
  }, []);

  const deleteExpense = React.useCallback((expenseId: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
  }, []);

  const addEarning = React.useCallback((newEarningData: Omit<Earning, 'id' | 'date'>) => {
    const newEarning: Earning = {
      ...newEarningData,
      id: `earn-${Date.now()}`,
      date: new Date(),
    };
    setEarnings((prev) => [newEarning, ...prev]);
  }, []);
  
  const updateEarning = React.useCallback((updatedEarning: Earning) => {
    setEarnings((prev) => 
      prev.map((earning) => 
        earning.id === updatedEarning.id ? updatedEarning : earning
      )
    );
    setEarningToEdit(null);
  }, []);

  const deleteEarning = React.useCallback((earningId: string) => {
    setEarnings((prev) => prev.filter((earning) => earning.id !== earningId));
  }, []);
  
  const setBudget = React.useCallback((categoryId: string, limit: number) => {
    setBudgets((prev) => ({ ...prev, [categoryId]: limit }));
  }, []);

  const addCategory = React.useCallback((categoryData: { name: string; color: string }) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: categoryData.name,
      icon: Shapes,
      color: categoryData.color,
    };
    setCategories((prev) => [...prev, newCategory]);
  }, []);
  
  const updateCategory = React.useCallback((updatedCategory: Category) => {
    setCategories((prev) => 
      prev.map((category) => 
        category.id === updatedCategory.id ? updatedCategory : category
      )
    );
    setCategoryToEdit(null);
  }, []);

  const deleteCategory = React.useCallback((categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setBudgets((prev) => {
      const newBudgets = { ...prev };
      delete newBudgets[categoryId];
      return newBudgets;
    });
    setExpenses((prev) => prev.filter((e) => e.categoryId !== categoryId));
  }, []);

  const handleExportData = () => {
    const dataToExport = {
      expenses,
      earnings,
      categories: categories.map(({ icon, ...rest }) => rest), // Don't export icons
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

        // Basic validation
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
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };
  
  const confirmImport = () => {
    if (!importedData) return;

    // --- BACKWARD COMPATIBILITY LOGIC ---
    let importedEarnings = [];
    if (importedData.earnings) {
      // New format: has earnings array
      importedEarnings = importedData.earnings.map((earn: any) => ({
        ...earn,
        date: new Date(earn.date),
      }));
    } else if (importedData.overallBudget) {
      // Old format: has overallBudget, convert it to a single earning
      importedEarnings = [{
        id: `earn-${Date.now()}`,
        description: 'Imported Budget',
        amount: importedData.overallBudget,
        date: new Date(),
      }];
    }
  
    // This reviver is needed because JSON.parse in getFromLocalStorage won't run here
    const parsedExpenses = importedData.expenses.map((exp: any) => ({
        ...exp,
        date: new Date(exp.date),
    }));

    const restoredCategories = restoreCategoryIcons(importedData.categories);
  
    setExpenses(parsedExpenses);
    setEarnings(importedEarnings);
    setCategories(restoredCategories);
    setBudgets(importedData.budgets);
  
    toast({ title: 'Import Successful', description: 'Your data has been restored.' });
    setShowImportConfirm(false);
    setImportedData(null);
  };
  
  const confirmNuke = () => {
    // Clear state
    setExpenses([]);
    setEarnings([]);
    setCategories(initialCategories);
    setBudgets({});
    
    // Clear localStorage
    localStorage.removeItem('expenses');
    localStorage.removeItem('earnings');
    localStorage.removeItem('categories');
    localStorage.removeItem('standardizedCategories');
    localStorage.removeItem('budgets');

    toast({
      variant: 'destructive',
      title: 'Data Cleared',
      description: 'All your data has been permanently deleted.',
    });
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
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  const context = React.useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}
