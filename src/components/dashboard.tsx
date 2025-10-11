'use client';

import * as React from 'react';
import { SummaryCard } from '@/components/summary-card';
import { AddExpense } from '@/components/add-expense';
import { RecentExpenses } from '@/components/recent-expenses';
import { BudgetOverview } from '@/components/budget-overview';
import { AddCategory } from '@/components/add-category';
import { Shapes, Download, Upload, MoreHorizontal, AlertTriangle } from 'lucide-react';
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
import { AddEarning } from '@/components/add-earning';
import { RecentEarnings } from '@/components/recent-earnings';
import { EditEarning } from '@/components/edit-earning';
import { SpendingOverviewChart } from './spending-overview-chart';
import { EditCategory } from './edit-category';
import { useDataContext } from '@/context/data-context';


export default function Dashboard() {
  const {
    isClient,
    expenses,
    earnings,
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
  } = useDataContext();

  const { toast } = useToast();

  const { totalSpending, totalBudget } = React.useMemo(() => {
    const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalEarnings = earnings.reduce((sum, earn) => sum + earn.amount, 0);
    return { totalSpending, totalBudget: totalEarnings };
  }, [expenses, earnings]);

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
             <AddEarning />
             <AddExpense />
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard 
            title="Total Budget (Earnings)" 
            value={`Tk ${totalBudget.toFixed(2)}`}
            description="Total income recorded for the month."
          />
          <SummaryCard 
            title="Total Spending" 
            value={`Tk ${totalSpending.toFixed(2)}`}
            description="Your total expenditure for the current month." 
          />
          <SummaryCard 
            title="Remaining Cash" 
            value={`Tk ${remainingBudget.toFixed(2)}`}
            description={remainingBudget >= 0 ? "You are in the green." : "You have spent more than you earned."}
            isPositive={remainingBudget >= 0}
          />
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <div className="grid gap-6">
             <RecentExpenses onEditExpense={setExpenseToEdit} />
          </div>
           <div className="grid gap-6">
              <BudgetOverview />
               <RecentEarnings onEditEarning={setEarningToEdit} />
              <SpendingOverviewChart />
            </div>
        </div>
      </div>
      
      <AddCategory />

      {expenseToEdit && (
        <EditExpense
          expense={expenseToEdit}
          onClose={() => setExpenseToEdit(null)}
        />
      )}
      
      {earningToEdit && (
        <EditEarning
          earning={earningToEdit}
          onClose={() => setEarningToEdit(null)}
        />
      )}

      {categoryToEdit && (
        <EditCategory
          category={categoryToEdit}
          onClose={() => setCategoryToEdit(null)}
        />
      )}
      
      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to import data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite all your current expenses, earnings, categories, and budgets. This action cannot be undone.
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
              This action cannot be undone. This will permanently delete all of your data, including expenses, earnings, categories, and budgets.
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
