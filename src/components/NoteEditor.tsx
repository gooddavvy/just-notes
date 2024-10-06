import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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
      <div className="flex items-center justify-center h-full">
        <svg
          className="w-24 h-24 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2a4 4 0 014-4h4m0 0H7m4 0v8m0-8a4 4 0 010 8h10"
          />
        </svg>
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
