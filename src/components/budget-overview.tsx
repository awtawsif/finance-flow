
'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil, Trash2, Cog } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { SetOverallBudget } from '@/components/set-overall-budget';


interface BudgetOverviewProps {
  categories: Category[];
  budgets: Record<string, number>;
  spending: Record<string, number>;
  onSetBudget: (categoryId: string, limit: number) => void;
  onSetOverallBudget: (limit: number) => void;
  onDeleteCategory: (categoryId: string) => void;
  overallBudget: number;
  totalAllocated: number;
}

const formSchema = z.object({
  limit: z.coerce.number().positive({ message: 'Budget must be a positive number.' }),
});
type SetBudgetFormValues = z.infer<typeof formSchema>;

export function BudgetOverview({ 
  categories, 
  budgets, 
  spending, 
  onSetBudget, 
  onSetOverallBudget,
  onDeleteCategory,
  overallBudget,
  totalAllocated
}: BudgetOverviewProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);

  const form = useForm<SetBudgetFormValues>({
    resolver: zodResolver(formSchema),
  });
  
  React.useEffect(() => {
    if (selectedCategory) {
      form.reset({ limit: budgets[selectedCategory.id] || '' as any });
    }
  }, [selectedCategory, budgets, form]);

  const unallocatedAmount = React.useMemo(() => {
    if (overallBudget <= 0) return 0;
    const currentCategoryBudget = selectedCategory ? (budgets[selectedCategory.id] || 0) : 0;
    return overallBudget - totalAllocated + currentCategoryBudget;
  }, [overallBudget, totalAllocated, selectedCategory, budgets]);


  function handleDialogTrigger(category: Category) {
    if (overallBudget <= 0) {
      toast({
        title: 'Set Overall Budget First',
        description: 'Please set an overall monthly budget before allocating to categories.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedCategory(category);
    setIsDialogOpen(true);
  }

  function onSubmit(values: SetBudgetFormValues) {
    if (selectedCategory) {
      if (overallBudget > 0 && values.limit > unallocatedAmount) {
        toast({
          title: 'Allocation Error',
          description: `You cannot allocate more than the remaining unallocated budget of Tk ${unallocatedAmount.toFixed(2)}.`,
          variant: 'destructive',
        });
        return;
      }
      onSetBudget(selectedCategory.id, values.limit);
      toast({
        title: 'Budget Updated',
        description: `Budget for "${selectedCategory.name}" has been set to Tk ${values.limit.toFixed(2)}.`,
      });
      setIsDialogOpen(false);
      setSelectedCategory(null);
    }
  }
  
  function handleDelete(categoryId: string) {
    onDeleteCategory(categoryId);
    toast({
      title: 'Category Deleted',
      description: 'The category has been successfully deleted.',
      variant: 'destructive',
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Category Budgets</CardTitle>
              <CardDescription>
                Allocate your overall budget across different categories.
              </CardDescription>
            </div>
            <SetOverallBudget onSetBudget={onSetOverallBudget} currentBudget={overallBudget} />
          </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map((category) => {
              const spent = spending[category.id] || 0;
              const budget = budgets[category.id] || 0;
              const isOverBudget = budget > 0 && spent > budget;
              const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

              return (
              <div key={category.id} className="group flex items-center gap-4">
                <div className="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg sm:flex" style={{ backgroundColor: `${category.color}20` }}>
                  <category.icon className="h-6 w-6" style={{ color: category.color }}/>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{category.name}</p>
                    <p className={cn("text-sm text-muted-foreground", isOverBudget && "font-semibold text-destructive")}>
                      <span>Tk {spent.toFixed(2)}</span> / Tk {budget > 0 ? budget.toFixed(2) : '---'}
                    </p>
                  </div>
                  {budget > 0 && <Progress value={progress} className={cn("h-2 mt-1", isOverBudget && "[&>div]:bg-destructive")} />}
                </div>
                <div className="flex gap-2 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDialogTrigger(category)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Budget</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Category</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the 
                          <strong> {category.name}</strong> category and all associated expenses and budgets.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(category.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )})}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Budget for {selectedCategory?.name}</DialogTitle>
            <DialogDescription>
               Enter the monthly budget limit for this category.
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
              {overallBudget > 0 && (
                <p className="text-sm text-muted-foreground">
                  Remaining to allocate: <strong>Tk {unallocatedAmount.toFixed(2)}</strong>
                </p>
              )}
               <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="secondary" onClick={() => setSelectedCategory(null)}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Save Budget</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
