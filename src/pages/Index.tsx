import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { CodeSnippetPanel } from "@/components/CodeSnippetPanel";

const Index = () => {
  const [noteContent, setNoteContent] = useState("");

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 shrink-0">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex min-w-0">
        <div className="flex-1 min-w-0 border-r border-border">
          <NoteEditor onContentChange={setNoteContent} />
        </div>
        
        <div className="w-96 shrink-0">
          <CodeSnippetPanel noteContent={noteContent} />
        </div>
      </div>
    </div>
  );
};

export default Index;
