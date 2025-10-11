'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/definitions';
import { useDataContext } from '@/context/data-context';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Category name must be at least 2 characters.' }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: 'Please enter a valid hex color.' }),
});

type EditCategoryFormValues = z.infer<typeof formSchema>;

interface EditCategoryProps {
  category: Category;
  onClose: () => void;
}

export function EditCategory({ category, onClose }: EditCategoryProps) {
  const { updateCategory } = useDataContext();
  const { toast } = useToast();

  const form = useForm<EditCategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category.name,
      color: category.color,
    },
  });

  function onSubmit(values: EditCategoryFormValues) {
    updateCategory({ ...category, ...values });
    toast({
      title: 'Category Updated',
      description: `Successfully updated "${values.name}".`,
    });
    onClose();
  }

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-full sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Make changes to your category here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Subscriptions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                       <Input type="color" className="h-10 w-14 p-1" {...field} />
                       <Input type="text" placeholder="#000000" className="flex-1" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
