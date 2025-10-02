import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  isPositive?: boolean;
}

export function SummaryCard({ title, value, description, isPositive }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
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
