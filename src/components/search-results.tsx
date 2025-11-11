
'use client';

import * as React from 'react';
import { Search, Pencil, Trash2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDataContext } from '@/context/data-context';
import type { Expense } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getIcon } from '@/lib/icons';

export function SearchResults() {
  const { 
    expenses, 
    categories, 
    searchQuery, 
    setSearchQuery, 
    setExpenseToEdit,
    deleteExpense 
  } = useDataContext();
  const { toast } = useToast();

  const categoryMap = React.useMemo(() => {
    return new Map(categories.map((cat) => [cat.id, cat]));
  }, [categories]);

  const filteredExpenses = React.useMemo(() => {
    if (!searchQuery) {
      return [];
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return expenses
      .filter((expense) => {
        const descriptionMatch = expense.description.toLowerCase().includes(lowercasedQuery);
        const category = categoryMap.get(expense.categoryId);
        const categoryMatch = category ? category.name.toLowerCase().includes(lowercasedQuery) : false;
        return descriptionMatch || categoryMatch;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [expenses, categories, searchQuery, categoryMap]);

  const totalSpentInSearch = React.useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const overallTotalSpending = React.useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);
  
  const percentageOfTotal = React.useMemo(() => {
    if (overallTotalSpending === 0) {
      return 0;
    }
    return (totalSpentInSearch / overallTotalSpending) * 100;
  }, [totalSpentInSearch, overallTotalSpending]);


  function handleDelete(expense: Expense) {
    deleteExpense(expense.id);
    toast({
      title: 'Expense Deleted',
      description: `"${expense.description}" has been successfully deleted.`,
      variant: 'destructive',
    });
  }
  
  if (!expenses.length) return null;

  const summaryDescription = `Found ${filteredExpenses.length} transaction(s), representing ${percentageOfTotal.toFixed(1)}% of total spending.`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Expenses</CardTitle>
        <CardDescription>
          Find specific expenses by searching their description or category.
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description or category..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      {searchQuery && (
        <CardContent>
          {filteredExpenses.length > 0 ? (
            <div className="space-y-6">
              <Card className="bg-accent text-accent-foreground">
                <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-foreground/10">
                       <Info className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                        <CardTitle className="text-accent-foreground">
                           Total spent for "{searchQuery}"
                        </CardTitle>
                        <p className="text-2xl font-bold">Tk {totalSpentInSearch.toFixed(2)}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-accent-foreground/80">{summaryDescription}</p>
                </CardContent>
              </Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => {
                    const category = categoryMap.get(expense.categoryId);
                    const Icon = getIcon(category?.icon);
                    return (
                      <TableRow key={expense.id} className="group">
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(expense.date, 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {category && (
                            <Badge variant="outline" className="flex w-fit items-center gap-2">
                              <Icon className="h-4 w-4" style={{ color: category.color }} />
                              {category.name}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">{expense.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpenseToEdit(expense)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit Expense</span>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete Expense</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the expense for 
                                      <strong> {expense.description}</strong>.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(expense)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No expenses found for "{searchQuery}".</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
