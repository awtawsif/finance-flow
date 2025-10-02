
'use client';

import * as React from 'react';
import { initialCategories } from '@/lib/data';
import type { Expense, Category } from '@/lib/definitions';
import { SummaryCard } from '@/components/summary-card';
import { AddExpense } from '@/components/add-expense';
import { RecentExpenses } from '@/components/recent-expenses';
import { BudgetOverview } from '@/components/budget-overview';
import { AddCategory } from '@/components/add-category';
import { Shapes, Download, Upload, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { SetOverallBudget } from '@/components/set-overall-budget';
import { EditExpense } from '@/components/edit-expense';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

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

export default function Dashboard() {
  const [isClient, setIsClient] = React.useState(false);

  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [budgets, setBudgets] = React.useState<Record<string, number>>({});
  const [overallBudget, setOverallBudget] = React.useState<number>(0);
  
  const [categoryMap, setCategoryMap] = React.useState(() => new Map(categories.map(cat => [cat.id, cat])));
  const [expenseToEdit, setExpenseToEdit] = React.useState<Expense | null>(null);
  const [showImportConfirm, setShowImportConfirm] = React.useState(false);
  const [showNukeConfirm, setShowNukeConfirm] = React.useState(false);
  const [importedData, setImportedData] = React.useState<any>(null);

  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load data from localStorage on initial client-side render
  React.useEffect(() => {
    setExpenses(getFromLocalStorage<Expense[]>('expenses', []));
    setCategories(restoreCategoryIcons(getFromLocalStorage<Omit<Category, 'icon'>[]>('categories', initialCategories.map(({ icon, ...rest }) => rest))));
    setBudgets(getFromLocalStorage<Record<string, number>>('budgets', {}));
    setOverallBudget(getFromLocalStorage<number>('overallBudget', 0));
    setIsClient(true);
  }, []);

  
  // Persist state to localStorage whenever it changes
  React.useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses, isClient]);
  
  React.useEffect(() => {
    if (!isClient) return;
    // We create a version of categories for serialization that omits the icon
    const serializableCategories = categories.map(({ icon, ...rest }) => rest);
    localStorage.setItem('categories', JSON.stringify(serializableCategories));
  }, [categories, isClient]);
  
  React.useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets, isClient]);
  
  React.useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('overallBudget', JSON.stringify(overallBudget));
  }, [overallBudget, isClient]);

  React.useEffect(() => {
    setCategoryMap(new Map(categories.map(cat => [cat.id, cat])));
  }, [categories]);

  const handleAddExpense = React.useCallback((newExpenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: `exp-${Date.now()}`,
      date: new Date(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  }, []);
  
  const handleUpdateExpense = React.useCallback((updatedExpense: Expense) => {
    setExpenses((prev) => 
      prev.map((expense) => 
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
    setExpenseToEdit(null);
  }, []);

  const handleDeleteExpense = React.useCallback((expenseId: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
  }, []);
  
  const handleSetBudget = React.useCallback((categoryId: string, limit: number) => {
    setBudgets((prev) => ({ ...prev, [categoryId]: limit }));
  }, []);

  const handleSetOverallBudget = React.useCallback((newBudget: number) => {
    setOverallBudget(newBudget);
  }, []);

  const handleAddCategory = React.useCallback((categoryName: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: categoryName,
      icon: Shapes,
      // Generate a random HSL color
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    };
    setCategories((prev) => [...prev, newCategory]);
  }, []);

  const handleDeleteCategory = React.useCallback((categoryId: string) => {
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
      categories: categories.map(({ icon, ...rest }) => rest), // Don't export icons
      budgets,
      overallBudget,
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
        if (parsedData.expenses && parsedData.categories && parsedData.budgets && parsedData.overallBudget !== undefined) {
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
  
    // This reviver is needed because JSON.parse in getFromLocalStorage won't run here
    const parsedExpenses = importedData.expenses.map((exp: any) => ({
        ...exp,
        date: new Date(exp.date),
    }));

    const restoredCategories = restoreCategoryIcons(importedData.categories);
  
    setExpenses(parsedExpenses);
    setCategories(restoredCategories);
    setBudgets(importedData.budgets);
    setOverallBudget(importedData.overallBudget);
  
    toast({ title: 'Import Successful', description: 'Your data has been restored.' });
    setShowImportConfirm(false);
    setImportedData(null);
  };
  
  const confirmNuke = () => {
    // Clear state
    setExpenses([]);
    setCategories(initialCategories);
    setBudgets({});
    setOverallBudget(0);
    
    // Clear localStorage
    localStorage.removeItem('expenses');
    localStorage.removeItem('categories');
    localStorage.removeItem('budgets');
    localStorage.removeItem('overallBudget');

    toast({
      variant: 'destructive',
      title: 'Data Cleared',
      description: 'All your data has been permanently deleted.',
    });
    setShowNukeConfirm(false);
  };


  const spendingByCategory = React.useMemo(() => {
    return expenses.reduce((acc, expense) => {
      acc[expense.categoryId] = (acc[expense.categoryId] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  const totalAllocatedBudget = React.useMemo(() => {
    return Object.values(budgets).reduce((sum, limit) => sum + limit, 0);
  }, [budgets]);
  
  const { totalSpending, totalBudget } = React.useMemo(() => {
    const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    // If overall budget is set, it's the source of truth. Otherwise, sum category budgets.
    const budget = overallBudget > 0 ? overallBudget : totalAllocatedBudget;
    return { totalSpending, totalBudget: budget };
  }, [expenses, budgets, overallBudget, totalAllocatedBudget]);

  const remainingBudget = totalBudget - totalSpending;

  // Render a loading state or nothing until the component has mounted on the client
  if (!isClient) {
    return null;
  }
  
  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome Back!
          </h1>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
             <AddExpense onAddExpense={handleAddExpense} categories={categories} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => document.getElementById('add-category-trigger')?.click()}>
                    <Shapes className="mr-2 h-4 w-4" />
                    Add Category
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={handleImportClick}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => setShowNukeConfirm(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Clear All Data
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard 
            title="Total Spending (This Month)" 
            value={`Tk ${totalSpending.toFixed(2)}`}
            description="Your total expenditure for the current month." 
          />
          <SummaryCard 
            title="Total Budget (This Month)" 
            value={`Tk ${totalBudget.toFixed(2)}`}
            description={overallBudget > 0 ? 'Your total allocated budget for the month.' : 'Sum of all category budgets.'}
          />
          <SummaryCard 
            title="Remaining Budget" 
            value={`Tk ${remainingBudget.toFixed(2)}`}
            description={remainingBudget >= 0 ? "You are within budget." : "You are over budget."}
            isPositive={remainingBudget >= 0}
          />
           <SummaryCard
            title="Total Allocated"
            value={`Tk ${totalAllocatedBudget.toFixed(2)}`}
            description={`${((totalAllocatedBudget / (overallBudget || 1)) * 100).toFixed(0)}% of total budget`}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BudgetOverview 
            categories={categories} 
            budgets={budgets}
            spending={spendingByCategory}
            onSetBudget={handleSetBudget} 
            onDeleteCategory={handleDeleteCategory}
            overallBudget={overallBudget}
            totalAllocated={totalAllocatedBudget}
            onSetOverallBudget={handleSetOverallBudget}
          />
          <RecentExpenses 
            expenses={expenses} 
            categoryMap={categoryMap}
            onEditExpense={setExpenseToEdit}
            onDeleteExpense={handleDeleteExpense}
          />
        </div>
      </div>
      
      <AddCategory onAddCategory={handleAddCategory} />

      {expenseToEdit && (
        <EditExpense
          expense={expenseToEdit}
          categories={categories}
          onUpdateExpense={handleUpdateExpense}
          onClose={() => setExpenseToEdit(null)}
        />
      )}
      
      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to import data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite all your current expenses, categories, and budgets. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowImportConfirm(false);
              setImportedData(null);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>
              Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showNukeConfirm} onOpenChange={setShowNukeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all of your data, including expenses, categories, and budgets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmNuke}
            >
              Clear Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
