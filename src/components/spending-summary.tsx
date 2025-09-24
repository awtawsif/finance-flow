import { Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

interface SpendingSummaryProps {
  title: string;
  analysis: string;
}

export function SpendingSummary({ title, analysis }: SpendingSummaryProps) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
         <Lightbulb className="h-6 w-6 text-primary" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{analysis}</p>
      </CardContent>
    </Card>
  );
}
