'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDataContext } from '@/context/data-context';

const formSchema = z.object({
  description: z.string().min(2, { message: 'Description must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
});

type AddEarningFormValues = z.infer<typeof formSchema>;

export function AddEarning() {
  const { addEarning } = useDataContext();
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<AddEarningFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: '' as any,
    },
  });

  function onSubmit(values: AddEarningFormValues) {
    addEarning(values);
    toast({
      title: 'Earning Added',
      description: `Successfully added "${values.description}".`,
    });
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <DollarSign className="mr-2 h-4 w-4" />
          Add Earning
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Earning</DialogTitle>
          <DialogDescription>
            Enter the details of your income. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Monthly allowance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (Tk)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Earning</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
