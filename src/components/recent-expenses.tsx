'use client';

import * as React from 'react';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { Expense } from '@/lib/definitions';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useDataContext } from '@/context/data-context';
import { getIcon } from '@/lib/icons';

interface RecentExpensesProps {
  onEditExpense: (expense: Expense) => void;
  onAddExpense: () => void;
}

export function RecentExpenses({ onEditExpense, onAddExpense }: RecentExpensesProps) {
  const { expenses, categories, deleteExpense } = useDataContext();
  const { toast } = useToast();
  
  const categoryMap = React.useMemo(() => {
    return new Map(categories.map(cat => [cat.id, cat]));
  }, [categories]);

  function handleDelete(expense: Expense) {
    deleteExpense(expense.id);
    toast({
      title: 'Expense Deleted',
      description: `"${expense.description}" has been successfully deleted.`,
      variant: 'destructive',
    });
  }

  const groupedExpenses = React.useMemo(() => {
    return expenses.reduce((acc, expense) => {
      const dateKey = format(expense.date, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);
  }, [expenses]);
  
  const sortedDates = React.useMemo(() => {
    return Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [groupedExpenses]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>A chronological list of your latest transactions.</CardDescription>
        </div>
        <Button size="icon" variant="outline" onClick={onAddExpense} className="h-8 w-8">
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only">Add Expense</span>
        </Button>
      </CardHeader>
      <CardContent className="max-h-[500px] overflow-y-auto pr-2">
        {sortedDates.length > 0 ? (
          <Accordion type="multiple" defaultValue={sortedDates.slice(0, 3)} className="space-y-2">
            {sortedDates.map((date) => {
              const dailyTotal = groupedExpenses[date].reduce((sum, expense) => sum + expense.amount, 0);
              return (
              <AccordionItem value={date} key={date} className="rounded-lg border-b-0 bg-muted/50 px-3">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex w-full justify-between items-center">
                    <h3 className="font-semibold text-sm">
                      {format(new Date(date), 'MMMM d, yyyy')}
                    </h3>
                    <p className="text-sm font-semibold text-muted-foreground">Tk {dailyTotal.toFixed(2)}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="hidden md:table-cell">Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedExpenses[date].map((expense) => {
                        const category = categoryMap.get(expense.categoryId);
                        const Icon = getIcon(category?.icon);
                        return (
                          <TableRow key={expense.id} className="group">
                            <TableCell className="font-medium">{expense.description}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {category && (
                                <Badge variant="outline" className="flex w-fit items-center gap-2 py-1">
                                  <Icon className="h-4 w-4" style={{ color: category.color }} />
                                  {category.name}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-mono">{expense.amount.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditExpense(expense)}>
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
                </AccordionContent>
              </AccordionItem>
            )})}
          </Accordion>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">No expenses recorded yet.</p>
            <Button variant="link" className="mt-2" onClick={onAddExpense}>Add your first expense</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
