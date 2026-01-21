'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { iconMap, iconList, getIcon } from '@/lib/icons';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const SelectedIcon = getIcon(value);

  const filteredIcons = React.useMemo(() => {
    if (!searchTerm) return iconList;
    return iconList.filter(iconName =>
      iconName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearchTerm('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-between', className)}
        >
          <div className="flex items-center gap-2">
            <SelectedIcon className="h-5 w-5" />
            <span className="truncate">{value}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto p-1">
            {filteredIcons.map((iconName) => {
              const Icon = iconMap[iconName];
              const isSelected = value === iconName;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => handleIconSelect(iconName)}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all hover:border-primary hover:bg-accent relative',
                    isSelected
                      ? 'border-primary bg-accent'
                      : 'border-border bg-background'
                  )}
                >
                  <Icon className="h-6 w-6 mb-1" />
                  <span className="text-xs text-center truncate w-full">
                    {iconName}
                  </span>
                  {isSelected && (
                    <Check className="h-3 w-3 text-primary absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No icons found matching "{searchTerm}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}