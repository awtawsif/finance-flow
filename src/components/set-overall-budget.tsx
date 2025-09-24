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
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  limit: z.coerce.number().positive({ message: 'Budget must be a positive number.' }),
});

type SetBudgetFormValues = z.infer<typeof formSchema>;

interface SetOverallBudgetProps {
  onSetBudget: (limit: number) => void;
  currentBudget: number;
}

export function SetOverallBudget({ onSetBudget, currentBudget }: SetOverallBudgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<SetBudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      limit: currentBudget || ('' as any),
    },
  });
  
  React.useEffect(() => {
    form.reset({ limit: currentBudget || ('' as any) });
  }, [currentBudget, form, isOpen]);


  function onSubmit(values: SetBudgetFormValues) {
    onSetBudget(values.limit);
    toast({
      title: 'Overall Budget Updated',
      description: `Your monthly budget has been set to Tk ${values.limit.toFixed(2)}.`,
    });
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Cog className="mr-2 h-4 w-4" />
          Set Overall Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Overall Budget</DialogTitle>
          <DialogDescription>
            Set your total monthly budget.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Limit (Tk)</FormLabel>
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
