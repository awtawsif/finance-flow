
'use client';

import * as React from 'react';
import {
  isWithinInterval,
  startOfMonth, endOfMonth, subMonths, format,
  startOfYear, endOfYear, subYears, getYear,
  startOfWeek, endOfWeek, subWeeks,
} from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDataContext } from '@/context/data-context';
import type { Expense } from '@/lib/definitions';

type Timeframe = 'week' | 'month' | 'year' | 'all';

// Generate recent weeks for the dropdown
const recentWeeks = Array.from({ length: 12 }, (_, i) => {
  const date = subWeeks(new Date(), i);
  const start = startOfWeek(date);
  return {
    value: format(start, 'yyyy-MM-dd'),
    label: `Week of ${format(start, 'MMM d')}`,
  };
});

// Generate recent months for the dropdown
const recentMonths = Array.from({ length: 12 }, (_, i) => {
  const date = subMonths(new Date(), i);
  return {
    value: format(date, 'yyyy-MM'),
    label: format(date, 'MMMM yyyy'),
  };
});

// Generate recent years for the dropdown
const currentYear = getYear(new Date());
const recentYears = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return {
        value: year.toString(),
        label: year.toString(),
    };
});

// --- State Management Context ---
interface DateFilterContextProps {
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  period: string;
  setPeriod: (p: string) => void;
  periodOptions: { value: string, label: string }[];
  filteredExpenses: Expense[];
  filterLabel: string;
}

const DateFilterContext = React.createContext<DateFilterContextProps | undefined>(undefined);

// --- Custom Hook to use the context ---
export const useDateFilter = () => {
  const context = React.useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};

// --- Provider Component ---
export function DateFilterProvider({ children }: { children: React.ReactNode }) {
  const { expenses } = useDataContext();
  const [timeframe, setTimeframe] = React.useState<Timeframe>('month');
  const [period, setPeriod] = React.useState(recentMonths[0].value);

  const { periodOptions, filteredExpenses, filterLabel } = React.useMemo(() => {
    let options: { value: string, label: string }[] = [];
    let label = 'all time';
    let filtered: Expense[] = expenses;

    switch (timeframe) {
      case 'week':
        options = recentWeeks;
        const selectedWeekStart = new Date(period);
        label = `the week of ${format(selectedWeekStart, 'MMM d, yyyy')}`;
        const weekInterval = { start: startOfWeek(selectedWeekStart), end: endOfWeek(selectedWeekStart) };
        filtered = expenses.filter(expense => isWithinInterval(expense.date, weekInterval));
        break;
      case 'month':
        options = recentMonths;
        label = recentMonths.find(m => m.value === period)?.label || 'Selected Month';
        const [year, month] = period.split('-').map(Number);
        const selectedMonthDate = new Date(year, month - 1);
        const interval = { start: startOfMonth(selectedMonthDate), end: endOfMonth(selectedMonthDate) };
        filtered = expenses.filter(expense => isWithinInterval(expense.date, interval));
        break;
      case 'year':
        options = recentYears;
        label = period;
        const selectedYear = parseInt(period, 10);
        const yearInterval = { start: startOfYear(new Date(selectedYear, 0)), end: endOfYear(new Date(selectedYear, 0)) };
        filtered = expenses.filter(expense => isWithinInterval(expense.date, yearInterval));
        break;
      case 'all':
      default:
        options = [{ value: 'all', label: 'All Time' }];
        filtered = expenses;
        label = 'all time';
        break;
    }
    return { periodOptions: options, filteredExpenses: filtered, filterLabel: label };
  }, [timeframe, period, expenses]);
  
  // Reset period when timeframe changes
  React.useEffect(() => {
    if (timeframe === 'week') setPeriod(recentWeeks[0].value);
    else if (timeframe === 'month') setPeriod(recentMonths[0].value);
    else if (timeframe === 'year') setPeriod(currentYear.toString());
    else setPeriod('all');
  }, [timeframe]);

  const value = {
    timeframe,
    setTimeframe,
    period,
    setPeriod,
    periodOptions,
    filteredExpenses,
    filterLabel,
  };

  return (
    <DateFilterContext.Provider value={value}>
      {children}
    </DateFilterContext.Provider>
  );
};


// --- UI Component ---
export function DateFilterControls({ disabled }: { disabled?: boolean }) {
  const {
    timeframe, setTimeframe,
    period, setPeriod,
    periodOptions
  } = useDateFilter();

  return (
    <div className="flex items-center gap-2">
      <Select
        value={timeframe}
        onValueChange={(value) => setTimeframe(value as Timeframe)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Select timeframe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">Week</SelectItem>
          <SelectItem value="month">Month</SelectItem>
          <SelectItem value="year">Year</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>
      
      {timeframe !== 'all' && (
        <Select
          value={period}
          onValueChange={setPeriod}
          disabled={disabled}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
