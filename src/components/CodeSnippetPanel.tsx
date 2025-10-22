import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Code2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

  // Mock AI-generated suggestions based on note content
  const generateSuggestions = (content: string): CodeSnippet[] => {
    const suggestions: CodeSnippet[] = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes("sort") || lowerContent.includes("quicksort")) {
      suggestions.push({
        id: "1",
        language: "python",
        code: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)`,
        description: "Quicksort algorithm implementation",
        relevance: 95,
      });
    }

    if (lowerContent.includes("function") || lowerContent.includes("array")) {
      suggestions.push({
        id: "2",
        language: "javascript",
        code: `const sortArray = (arr) => {
  return arr.sort((a, b) => a - b);
};`,
        description: "Simple array sorting in JavaScript",
        relevance: 88,
      });
    }

    if (lowerContent.includes("data structure") || lowerContent.includes("tree")) {
      suggestions.push({
        id: "3",
        language: "java",
        code: `class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    
    TreeNode(int val) {
        this.val = val;
    }
}`,
        description: "Binary tree node structure",
        relevance: 82,
      });
    }

    if (suggestions.length === 0 && content.length > 10) {
      suggestions.push({
        id: "4",
        language: "python",
        code: `# Example code snippet
def hello_world():
    print("Hello, World!")`,
        description: "Basic Python function",
        relevance: 60,
      });
    }

    return suggestions;
  };

  const snippets = generateSuggestions(noteContent);

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
        {snippets.length === 0 ? (
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
