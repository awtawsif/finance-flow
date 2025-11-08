
'use client';

import * as React from 'react';
import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useDataContext } from '@/context/data-context';
import type { Shortcut } from '@/lib/definitions';
import { getIcon } from '@/lib/icons';

export function ManageShortcuts() {
  const { shortcuts, categories, deleteShortcut, setShortcutToEdit } = useDataContext();
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();

  const categoryMap = React.useMemo(() => {
    return new Map(categories.map(cat => [cat.id, cat]));
  }, [categories]);

  function handleDelete(shortcut: Shortcut) {
    deleteShortcut(shortcut.id);
    toast({
      title: 'Shortcut Deleted',
      description: `The "${shortcut.name}" shortcut has been deleted.`,
      variant: 'destructive',
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button id="manage-shortcuts-trigger" variant="outline" className="hidden">
          Manage Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Expense Shortcuts</DialogTitle>
          <DialogDescription>
            Edit or delete your saved shortcuts for quick expense entry.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {shortcuts.length > 0 ? (
            shortcuts.map(shortcut => {
              const category = categoryMap.get(shortcut.categoryId);
              const Icon = getIcon(category?.icon);
              return (
                <div key={shortcut.id} className="group flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <div className="flex items-center gap-3">
                     <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${category?.color}20` }}>
                        <Icon className="h-6 w-6" style={{ color: category?.color }}/>
                     </div>
                     <div>
                        <p className="font-semibold">{shortcut.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {shortcut.description ? shortcut.description : "No description"}
                            {shortcut.amount !== null ? ` - Tk ${shortcut.amount.toFixed(2)}` : ""}
                        </p>
                     </div>
                  </div>
                  <div className="flex gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShortcutToEdit(shortcut)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit Shortcut</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete Shortcut</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the <strong>{shortcut.name}</strong> shortcut. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(shortcut)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-8">You have no shortcuts.</p>
          )}
        </div>
        <DialogFooter className="pt-4 sm:justify-between">
           <Button type="button" variant="outline" onClick={() => document.getElementById('add-shortcut-trigger')?.click()}>
              <PlusCircle className="mr-2 h-4 w-4"/>
              Add New
            </Button>
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
