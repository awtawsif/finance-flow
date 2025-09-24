import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Expense } from '@/lib/definitions';
import { categoryMap } from '@/lib/data';
import { format } from 'date-fns';

interface RecentExpensesProps {
  expenses: Expense[];
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
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
              <TableHead className="hidden sm:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              const category = categoryMap.get(expense.categoryId);
              return (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>
                    {category && (
                      <Badge variant="outline" className="flex w-fit items-center gap-2">
                         <category.icon className="h-4 w-4" style={{ color: category.color }} />
                         {category.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">${expense.amount.toFixed(2)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{format(expense.date, 'MMM d, yyyy')}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
