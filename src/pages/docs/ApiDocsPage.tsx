import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ApiDocsPage() {
  const { t } = useTranslation();
  const [markdown, setMarkdown] = useState('');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api-docs/api-documentation.md')
      .then((res) => res.text())
      .then(setMarkdown)
      .catch(() => setMarkdown('# Error loading documentation'));
  }, []);

  const filteredMarkdown = search
    ? markdown
        .split('\n')
        .filter((line, i, arr) => {
          if (line.toLowerCase().includes(search.toLowerCase())) return true;
          // include surrounding context
          for (let j = Math.max(0, i - 3); j <= Math.min(arr.length - 1, i + 3); j++) {
            if (arr[j].toLowerCase().includes(search.toLowerCase())) return true;
          }
          return false;
        })
        .join('\n')
    : markdown;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            API Documentation
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete REST API reference for SomiteeHQ platform — 65+ endpoints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">v1.0.0</Badge>
          <Badge variant="outline">REST API</Badge>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search endpoints, methods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="p-6 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-220px)]">
          <article className="prose prose-sm max-w-none dark:prose-invert 
            prose-headings:font-heading prose-headings:text-foreground
            prose-h1:text-2xl prose-h1:border-b prose-h1:pb-3 prose-h1:border-border
            prose-h2:text-lg prose-h2:mt-8 prose-h2:text-primary
            prose-h3:text-base
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
            prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:text-xs
            prose-table:text-sm
            prose-th:bg-muted prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-medium
            prose-td:px-3 prose-td:py-2 prose-td:border-b prose-td:border-border
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r
            prose-hr:border-border
            prose-strong:text-foreground
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {filteredMarkdown}
            </ReactMarkdown>
          </article>
        </ScrollArea>
      </Card>
    </div>
  );
}
