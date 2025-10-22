import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Plus, Search, BookOpen, Code } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Note {
  id: string;
  title: string;
  preview: string;
  lastEdited: string;
}

export const Sidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const mockNotes: Note[] = [
    {
      id: "1",
      title: "Sorting Algorithms",
      preview: "Notes on quicksort and mergesort implementations...",
      lastEdited: "2 hours ago",
    },
    {
      id: "2",
      title: "Data Structures",
      preview: "Binary trees, linked lists, hash tables...",
      lastEdited: "Yesterday",
    },
    {
      id: "3",
      title: "API Design Patterns",
      preview: "REST, GraphQL, and microservices architecture...",
      lastEdited: "3 days ago",
    },
  ];

  const filteredNotes = mockNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Code className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
            CodeNote
          </h1>
        </div>
        <Button className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow">
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-sidebar-accent border-sidebar-border"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {filteredNotes.map((note) => (
            <Button
              key={note.id}
              variant="ghost"
              className="w-full justify-start text-left h-auto py-3 px-3 hover:bg-sidebar-accent"
            >
              <div className="flex gap-3 w-full">
                <FileText className="w-4 h-4 mt-1 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-sidebar-foreground truncate">{note.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{note.preview}</p>
                  <p className="text-xs text-muted-foreground mt-1">{note.lastEdited}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground">
          <BookOpen className="w-4 h-4" />
          Documentation
        </Button>
      </div>
    </div>
  );
};
