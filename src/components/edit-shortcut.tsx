'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Info } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { Shortcut } from '@/lib/definitions';
import { useDataContext } from '@/context/data-context';
import { getIcon } from '@/lib/icons';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Shortcut name must be at least 2 characters.' }),
  includeDescription: z.boolean(),
  description: z.string().optional(),
  includeAmount: z.boolean(),
  amount: z.coerce.number().optional(),
  categoryId: z.string().nonempty({ message: 'Please select a category.' }),
}).refine(data => !data.includeDescription || (data.description && data.description.length >= 2), {
  message: 'Description must be at least 2 characters.',
  path: ['description'],
}).refine(data => !data.includeAmount || (data.amount && data.amount > 0), {
  message: 'Amount must be a positive number.',
  path: ['amount'],
});

type EditShortcutFormValues = z.infer<typeof formSchema>;

interface EditShortcutProps {
  shortcut: Shortcut;
  onClose: () => void;
}

export function EditShortcut({ shortcut, onClose }: EditShortcutProps) {
  const { categories, updateShortcut } = useDataContext();
  const { toast } = useToast();

  const form = useForm<EditShortcutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: shortcut.name,
      includeDescription: shortcut.description !== null,
      description: shortcut.description || '',
      includeAmount: shortcut.amount !== null,
      amount: shortcut.amount || ('' as any),
      categoryId: shortcut.categoryId,
    },
  });

  const watchIncludeDescription = form.watch('includeDescription');
  const watchIncludeAmount = form.watch('includeAmount');

  function onSubmit(values: EditShortcutFormValues) {
    updateShortcut({ 
        ...shortcut,
        name: values.name,
        description: values.includeDescription ? values.description! : null,
        amount: values.includeAmount ? values.amount! : null,
        categoryId: values.categoryId,
     });
    toast({
      title: 'Shortcut Updated',
      description: `Successfully updated "${values.name}".`,
    });
    onClose();
  }

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-full sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Shortcut</DialogTitle>
          <DialogDescription>
             Make changes to your shortcut here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shortcut Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Morning Coffee" {...field} />
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
            <div className="space-y-4 rounded-md border p-4">
                <FormField
                control={form.control}
                name="includeDescription"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                    <FormLabel>Include Description</FormLabel>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
                />
                {watchIncludeDescription && (
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Input placeholder="e.g., Grande Latte" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
            </div>

            <div className="space-y-4 rounded-md border p-4">
                <FormField
                    control={form.control}
                    name="includeAmount"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                        <FormLabel>Include Amount</FormLabel>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
                {watchIncludeAmount && (
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}
            </div>

            {!watchIncludeDescription || !watchIncludeAmount ? (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Using this shortcut will pre-fill the expense form for you to complete.
                    </AlertDescription>
                </Alert>
            ): null}
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
