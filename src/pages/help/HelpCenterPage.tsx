import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen } from 'lucide-react';

export default function UserManualPage() {
  const [markdown, setMarkdown] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/user-manual/user-manual.md')
      .then((res) => res.text())
      .then(setMarkdown)
      .catch(() => setMarkdown('# Error loading user manual'));
  }, []);

  const filteredMarkdown = search
    ? markdown
        .split('\n')
        .filter((line, i, arr) => {
          if (line.toLowerCase().includes(search.toLowerCase())) return true;
          for (let j = Math.max(0, i - 3); j <= Math.min(arr.length - 1, i + 3); j++) {
            if (arr[j].toLowerCase().includes(search.toLowerCase())) return true;
          }
          return false;
        })
        .join('\n')
    : markdown;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            How to Work the System
          </h1>
          <p className="text-muted-foreground text-sm">
            Step-by-step user manual for every module in Somitee HQ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">v1.0.0</Badge>
          <Badge variant="outline">User Guide</Badge>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search the manual..."
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
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r
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
