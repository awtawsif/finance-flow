
'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { PlusCircle } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useDataContext } from '@/context/data-context';
import { getIcon } from '@/lib/icons';
import type { Shortcut } from '@/lib/definitions';

const formSchema = z.object({
  description: z.string().min(2, { message: 'Description must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be a positive number.' }),
  categoryId: z.string().nonempty({ message: 'Please select a category.' }),
});

type AddExpenseFormValues = z.infer<typeof formSchema>;

interface AddExpenseProps {
    shortcutData?: Partial<Shortcut> | null;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function AddExpense({ shortcutData, isOpen, onOpenChange }: AddExpenseProps) {
  const { categories, addExpense } = useDataContext();
  const { toast } = useToast();

  const form = useForm<AddExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: '' as any,
      categoryId: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      // Reset form with shortcut data or clear it
      form.reset({
        description: shortcutData?.description || '',
        amount: (shortcutData?.amount as any) || '',
        categoryId: shortcutData?.categoryId || '',
      });

      // Set focus on the first empty field if using a shortcut
      const timer = setTimeout(() => {
        if (shortcutData) {
            if (shortcutData.description === null) {
              form.setFocus('description');
            } else if (shortcutData.amount === null) {
              form.setFocus('amount');
            }
        } else {
            // If not a shortcut, focus on description by default
            form.setFocus('description');
        }
      }, 100); // Small delay to ensure dialog is rendered

      return () => clearTimeout(timer);
    }
  }, [shortcutData, isOpen, form]);


  function onSubmit(values: AddExpenseFormValues) {
    addExpense(values);
    toast({
      title: 'Expense Added',
      description: `Successfully added "${values.description}".`,
    });
    onOpenChange(false);
  }
  
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {/* This button is now visually hidden and only used for programmatic trigger */}
        <Button className="hidden">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{shortcutData ? 'Complete Your Expense' : 'Add New Expense'}</DialogTitle>
          <DialogDescription>
            {shortcutData ? 'Fill in the remaining details for your shortcut.' : "Enter the details of your expense. Click save when you're done."}
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
                    <Input placeholder="e.g., Coffee with friends" {...field} />
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
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => {
                        const Icon = getIcon(category.icon);
                        return (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center">
                              <Icon className="mr-2 h-4 w-4" />
                              {category.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
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
              <Button type="submit">Save Expense</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
