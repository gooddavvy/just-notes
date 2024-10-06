import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FileText } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
}

interface NoteEditorProps {
  activeNote: Note | undefined;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  updateNote: (id: string, content: string) => void;
  editRef: React.RefObject<HTMLTextAreaElement>;
}

function NoteEditor({
  activeNote,
  isEditing,
  setIsEditing,
  updateNote,
  editRef,
}: NoteEditorProps) {
  if (!activeNote) {
    return (
      <div className="flex items-center justify-center h-screen w-full text-gray-500">
        <div className="inline-flex flex-col items-center">
          <FileText size={100} className="mb-4" />
          <p className="text-xl">Select a note or make a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="prose prose-invert max-w-none min-h-full"
      onClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <textarea
          ref={editRef}
          className="w-full h-full bg-gray-900 text-white p-4 focus:outline-none resize-none"
          value={activeNote.content}
          onChange={(e) => updateNote(activeNote.id, e.target.value)}
          onBlur={() => setIsEditing(false)}
          autoFocus
          style={{ minHeight: "calc(100vh - 2rem)" }}
        />
      ) : (
        <div className="w-full min-h-full">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {activeNote.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default NoteEditor;
