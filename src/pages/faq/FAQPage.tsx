import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFAQsStore } from '@/stores/faqStore';
import type { FAQ } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function FAQPage() {
  const { t } = useTranslation();
  const { faqs, isLoading, loadFAQs, createFAQ } = useFAQsStore();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadFAQs();
  }, [loadFAQs]);

  const filtered = faqs.filter(f => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase()));
  const categories = [...new Set(faqs.map(f => f.category).filter(Boolean))];

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createFAQ({
        question: fd.get('question') as string,
        answer: fd.get('answer') as string,
        category: fd.get('category') as string,
      });
      setOpen(false);
      toast.success(t('faq.faqAdded'));
    } catch (error) {
      toast.error(t('faq.faqAddFailed'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-heading font-bold">{t('faq.title')}</h1><p className="text-muted-foreground">{t('faq.subtitle')}</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> {t('faq.addFaq')}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">{t('faq.addFaq')}</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1"><Label>{t('faq.question')} *</Label><Input name="question" required /></div>
              <div className="space-y-1"><Label>{t('faq.answer')} *</Label><Input name="answer" required /></div>
              <div className="space-y-1"><Label>{t('common.category')} *</Label><Input name="category" required /></div>
              <Button type="submit" className="w-full">{t('common.save')}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t('faq.searchFaq')} className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {categories.map(cat => {
        const catFaqs = filtered.filter(f => f.category === cat);
        if (!catFaqs.length) return null;
        return (
          <Card key={cat}>
            <CardContent className="pt-6">
              <Badge className="mb-3">{cat}</Badge>
              <Accordion type="multiple">
                {catFaqs.map(faq => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-sm font-medium">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
