'use client';

import * as React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import type { Expense, Category } from '@/lib/definitions';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface RecentExpensesProps {
  expenses: Expense[];
  categoryMap: Map<string, Category>;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

function FormattedDate({ date }: { date: Date }) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <>{format(new Date(date), 'MMM d, yyyy')}</>;
}

export function RecentExpenses({ expenses, categoryMap, onEditExpense, onDeleteExpense }: RecentExpensesProps) {
  const { toast } = useToast();

  function handleDelete(expense: Expense) {
    onDeleteExpense(expense.id);
    toast({
      title: 'Expense Deleted',
      description: `"${expense.description}" has been successfully deleted.`,
      variant: 'destructive',
    });
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>Your latest transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden pr-0 sm:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              const category = categoryMap.get(expense.categoryId);
              return (
                <TableRow key={expense.id} className="group">
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>
                    {category && (
                      <Badge variant="outline" className="flex w-fit items-center gap-2">
                         <category.icon className="h-4 w-4" style={{ color: category.color }} />
                         {category.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">Tk {expense.amount.toFixed(2)}</TableCell>
                  <TableCell className="hidden pr-0 sm:table-cell"><FormattedDate date={expense.date} /></TableCell>
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
      </CardContent>
    </Card>
  );
}
