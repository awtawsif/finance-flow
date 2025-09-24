'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Cog } from 'lucide-react';
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
import type { Budget, Category } from '@/lib/definitions';

const formSchema = z.object({
  limit: z.coerce.number().positive({ message: 'Limit must be a positive number.' }),
  categoryId: z.string().nonempty({ message: 'Please select a category.' }),
});

type SetBudgetFormValues = z.infer<typeof formSchema>;

interface SetBudgetProps {
  budgets: Budget[];
  onSetBudget: (budget: Budget) => void;
  categories: Category[];
}

export function SetBudget({ budgets, onSetBudget, categories }: SetBudgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<SetBudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      limit: '' as any,
      categoryId: '',
    },
  });

  const selectedCategoryId = form.watch('categoryId');

  React.useEffect(() => {
    if (selectedCategoryId) {
      const existingBudget = budgets.find(b => b.categoryId === selectedCategoryId);
      form.setValue('limit', existingBudget ? existingBudget.limit : '' as any);
    } else {
        form.setValue('limit', '' as any);
    }
  }, [selectedCategoryId, budgets, form]);


  function onSubmit(values: SetBudgetFormValues) {
    onSetBudget(values);
    const categoryName = categories.find(c => c.id === values.categoryId)?.name || 'Category';
    toast({
      title: 'Budget Updated',
      description: `Budget for "${categoryName}" set to $${values.limit.toFixed(2)}.`,
    });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Cog className="mr-2 h-4 w-4" />
          Set Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Category Budget</DialogTitle>
          <DialogDescription>
            Set or update the monthly budget for a specific category.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <category.icon className="mr-2 h-4 w-4" />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Limit ($)</FormLabel>
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
              <Button type="submit">Save Budget</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
