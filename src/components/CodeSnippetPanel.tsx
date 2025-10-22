import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Code2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CodeSnippet {
  id: string;
  language: string;
  code: string;
  description: string;
  relevance: number;
}

interface CodeSnippetPanelProps {
  noteContent: string;
}

export const CodeSnippetPanel = ({ noteContent }: CodeSnippetPanelProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!noteContent || noteContent.length < 10) {
        setSnippets([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-code-context', {
          body: { noteContent }
        });

        if (error) throw error;

        if (data?.snippets) {
          const formattedSnippets = data.snippets.map((snippet: any, index: number) => ({
            id: `snippet-${index}`,
            language: snippet.language,
            code: snippet.code,
            description: snippet.description,
            relevance: snippet.relevance
          }));
          setSnippets(formattedSnippets);
        }
      } catch (error: any) {
        console.error('Error fetching code suggestions:', error);
        if (error.message?.includes('Rate limit')) {
          toast.error('Rate limit reached. Please wait a moment.');
        } else if (error.message?.includes('credits')) {
          toast.error('AI credits exhausted. Please add credits to continue.');
        } else {
          toast.error('Failed to fetch code suggestions');
        }
        setSnippets([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [noteContent]);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Code Suggestions</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {snippets.length > 0
            ? `${snippets.length} relevant snippet${snippets.length > 1 ? "s" : ""} found`
            : "Start typing to see code suggestions"}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="w-16 h-16 mb-4 animate-spin opacity-50" />
            <p className="text-center">Analyzing your notes...</p>
          </div>
        ) : snippets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Code2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-center">No suggestions yet. Start typing your notes to get relevant code snippets.</p>
          </div>
        ) : (
          snippets.map((snippet) => (
            <Card key={snippet.id} className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {snippet.language}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {snippet.relevance}% match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{snippet.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(snippet.code, snippet.id)}
                  className="ml-2"
                >
                  {copiedId === snippet.id ? (
                    <Check className="w-4 h-4 text-accent" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <pre className="bg-code-bg border border-code-border rounded-md p-3 overflow-x-auto">
                <code className="text-sm text-foreground font-mono">{snippet.code}</code>
              </pre>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
