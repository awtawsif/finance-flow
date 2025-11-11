import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  isPositive?: boolean;
}

export function SummaryCard({ title, value, description, icon, isPositive }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-6 w-6">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold lg:text-3xl">{value}</div>
        <p className={cn("text-xs text-muted-foreground", isPositive === false && "text-destructive")}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
