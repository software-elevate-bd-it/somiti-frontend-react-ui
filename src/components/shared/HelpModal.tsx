import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface HelpModalProps {
  title: string;
  description: string;
  steps: string[];
}

export default function HelpModal({ title, description, steps }: HelpModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-heading">{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="space-y-2 mt-3">
          <h4 className="font-heading font-semibold text-sm">Steps:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            {steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}
