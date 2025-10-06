
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Earning } from '@/lib/definitions';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface RecentEarningsProps {
  earnings: Earning[];
  onEditEarning: (earning: Earning) => void;
  onDeleteEarning: (earningId: string) => void;
}

export function RecentEarnings({ earnings, onEditEarning, onDeleteEarning }: RecentEarningsProps) {
  const { toast } = useToast();

  function handleDelete(earning: Earning) {
    onDeleteEarning(earning.id);
    toast({
      title: 'Earning Deleted',
      description: `"${earning.description}" has been successfully deleted.`,
      variant: 'destructive',
    });
  }

  const groupedEarnings = React.useMemo(() => {
    return earnings.reduce((acc, earning) => {
      const dateKey = format(earning.date, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(earning);
      return acc;
    }, {} as Record<string, Earning[]>);
  }, [earnings]);

  const sortedDates = React.useMemo(() => {
    return Object.keys(groupedEarnings).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [groupedEarnings]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Earnings</CardTitle>
        <CardDescription>Your latest income.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={sortedDates.slice(0, 2)}>
          {sortedDates.map((date) => {
             const dailyTotal = groupedEarnings[date].reduce((sum, earning) => sum + earning.amount, 0);
            return (
            <AccordionItem value={date} key={date}>
              <AccordionTrigger>
                <div className="flex w-full justify-between items-center pr-2">
                   <h3 className="font-semibold text-sm text-muted-foreground">
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
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedEarnings[date].map((earning) => (
                      <TableRow key={earning.id} className="group">
                        <TableCell className="font-medium">{earning.description}</TableCell>
                        <TableCell className="text-right font-mono">{earning.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 md:opacity-100">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditEarning(earning)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit Earning</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete Earning</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the earning for 
                                    <strong> {earning.description}</strong>.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(earning)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          )})}
        </Accordion>
      </CardContent>
    </Card>
  );
}
