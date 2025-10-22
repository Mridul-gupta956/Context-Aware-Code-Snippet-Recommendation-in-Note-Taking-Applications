import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface NoteEditorProps {
  onContentChange: (content: string) => void;
}

export const NoteEditor = ({ onContentChange }: NoteEditorProps) => {
  const [content, setContent] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange(newContent);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Note Editor</h2>
        <p className="text-sm text-muted-foreground">Type your notes and get code suggestions in real-time</p>
      </div>
      <div className="flex-1 p-6">
        <Textarea
          value={content}
          onChange={handleChange}
          placeholder="Start typing your notes here... 

Example: 'Create a function that sorts an array using quicksort algorithm'"
          className="h-full min-h-[500px] bg-secondary border-border focus:ring-primary font-mono text-sm resize-none"
        />
      </div>
    </div>
  );
};
