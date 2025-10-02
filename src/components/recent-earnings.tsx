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
import type { Earning } from '@/lib/definitions';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface RecentEarningsProps {
  earnings: Earning[];
  onEditEarning: (earning: Earning) => void;
  onDeleteEarning: (earningId: string) => void;
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Earnings</CardTitle>
        <CardDescription>Your latest income.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden pr-0 md:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {earnings.map((earning) => (
                <TableRow key={earning.id} className="group">
                  <TableCell className="font-medium">{earning.description}</TableCell>
                  <TableCell className="text-right font-mono">{earning.amount.toFixed(2)}</TableCell>
                  <TableCell className="hidden pr-0 md:table-cell"><FormattedDate date={earning.date} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 transition-opacity md:opacity-0 md:group-hover:opacity-100">
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
      </CardContent>
    </Card>
  );
}
