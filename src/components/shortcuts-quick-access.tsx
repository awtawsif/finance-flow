'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDataContext } from '@/context/data-context';
import { useToast } from '@/hooks/use-toast';
import { getIcon } from '@/lib/icons';

export function ShortcutsQuickAccess() {
  const { shortcuts, categories, addExpense } = useDataContext();
  const { toast } = useToast();

  const categoryMap = React.useMemo(() => {
    return new Map(categories.map(cat => [cat.id, cat]));
  }, [categories]);

  const handleShortcutClick = (shortcutId: string) => {
    const shortcut = shortcuts.find(s => s.id === shortcutId);
    if (!shortcut) return;

    addExpense({
      description: shortcut.description,
      amount: shortcut.amount,
      categoryId: shortcut.categoryId,
    });

    toast({
      title: 'Expense Added',
      description: `Added "${shortcut.description}" from your shortcuts.`,
    });
  };

  if (shortcuts.length === 0) {
    return null; // Don't render the card if there are no shortcuts
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick-add Shortcuts</CardTitle>
        <CardDescription>
          Click a shortcut to add an expense instantly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {shortcuts.map(shortcut => {
            const category = categoryMap.get(shortcut.categoryId);
            const Icon = getIcon(category?.icon);
            return (
              <Button
                key={shortcut.id}
                variant="outline"
                className="flex h-auto flex-col items-start justify-start p-3 gap-1.5"
                onClick={() => handleShortcutClick(shortcut.id)}
              >
                <div className="flex items-center gap-2">
                   <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: `${category?.color}20` }}>
                    <Icon className="h-5 w-5" style={{ color: category?.color }}/>
                   </div>
                   <span className="font-semibold">{shortcut.name}</span>
                </div>
                <div className="pl-10 text-left">
                  <p className="text-xs text-muted-foreground">{shortcut.description}</p>
                  <p className="text-xs font-mono text-muted-foreground">Tk {shortcut.amount.toFixed(2)}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
