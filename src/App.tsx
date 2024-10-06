import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  FileText,
  Plus,
  Folder,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
}

interface Folder {
  id: string;
  name: string;
  isOpen: boolean;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const nameEditRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    const savedFolders = localStorage.getItem('folders');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedFolders) setFolders(JSON.parse(savedFolders));
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('folders', JSON.stringify(folders));
  }, [folders]);

  const createNote = (folderId: string | null = null) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      folderId,
    };
    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
    setIsEditing(true);
  };

  const createFolder = () => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: 'New Folder',
      isOpen: true,
    };
    setFolders([...folders, newFolder]);
    setEditingItemId(newFolder.id);
  };

  const updateNote = (id: string, content: string) => {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, content } : note))
    );
  };

  const updateNoteTitle = (id: string, title: string) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, title } : note)));
  };

  const updateFolderName = (id: string, name: string) => {
    setFolders(
      folders.map((folder) => (folder.id === id ? { ...folder, name } : folder))
    );
  };

  const toggleFolder = (id: string) => {
    setFolders(
      folders.map((folder) =>
        folder.id === id ? { ...folder, isOpen: !folder.isOpen } : folder
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  const deleteFolder = (id: string) => {
    setFolders(folders.filter((folder) => folder.id !== id));
    setNotes(notes.filter((note) => note.folderId !== id));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same list
      const items = Array.from(notes);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setNotes(items);
    } else {
      // Moving between lists
      const noteId = result.draggableId;
      const newFolderId =
        destination.droppableId === 'root' ? null : destination.droppableId;
      setNotes(
        notes.map((note) =>
          note.id === noteId ? { ...note, folderId: newFolderId } : note
        )
      );
    }
  };

  const activeNote = notes.find((note) => note.id === activeNoteId);

  const handleNameEdit = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: 'note' | 'folder'
  ) => {
    if (e.key === 'Enter') {
      const newName = e.currentTarget.value.trim();
      if (newName && editingItemId) {
        if (type === 'note') {
          updateNoteTitle(editingItemId, newName);
        } else {
          updateFolderName(editingItemId, newName);
        }
      }
      setEditingItemId(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="w-64 p-4 border-r border-gray-700 overflow-y-auto">
          <button
            className="w-full mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center"
            onClick={() => createNote()}
          >
            <Plus size={18} className="mr-2" /> New Note
          </button>
          <button
            className="w-full mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center"
            onClick={createFolder}
          >
            <Folder size={18} className="mr-2" /> New Folder
          </button>
          <Droppable droppableId="root">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {notes
                  .filter((note) => !note.folderId)
                  .map((note, index) => (
                    <Draggable
                      key={note.id}
                      draggableId={note.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-2 p-2 rounded cursor-pointer flex items-center ${
                            activeNoteId === note.id
                              ? 'bg-gray-700'
                              : 'hover:bg-gray-800'
                          }`}
                          onClick={() => setActiveNoteId(note.id)}
                        >
                          <FileText size={18} className="mr-2" />
                          {editingItemId === note.id ? (
                            <input
                              ref={nameEditRef}
                              className="bg-gray-800 text-white p-1 rounded w-full"
                              defaultValue={note.title}
                              onKeyDown={(e) => handleNameEdit(e, 'note')}
                              onBlur={() => setEditingItemId(null)}
                              autoFocus
                            />
                          ) : (
                            <>
                              <span className="flex-grow">{note.title}</span>
                              <Edit2
                                size={14}
                                className="ml-2 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingItemId(note.id);
                                }}
                              />
                              <Trash2
                                size={14}
                                className="ml-2 cursor-pointer text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote(note.id);
                                }}
                              />
                            </>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {folders.map((folder) => (
            <div key={folder.id} className="mb-2">
              <div
                className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-800"
                onClick={() => toggleFolder(folder.id)}
              >
                {folder.isOpen ? (
                  <ChevronDown size={18} className="mr-2" />
                ) : (
                  <ChevronRight size={18} className="mr-2" />
                )}
                <Folder size={18} className="mr-2" />
                {editingItemId === folder.id ? (
                  <input
                    ref={nameEditRef}
                    className="bg-gray-800 text-white p-1 rounded w-full"
                    defaultValue={folder.name}
                    onKeyDown={(e) => handleNameEdit(e, 'folder')}
                    onBlur={() => setEditingItemId(null)}
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="flex-grow">{folder.name}</span>
                    <Edit2
                      size={14}
                      className="ml-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItemId(folder.id);
                      }}
                    />
                    <Trash2
                      size={14}
                      className="ml-2 cursor-pointer text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFolder(folder.id);
                      }}
                    />
                  </>
                )}
              </div>
              {folder.isOpen && (
                <Droppable droppableId={folder.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="ml-4"
                    >
                      <button
                        className="w-full mb-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          createNote(folder.id);
                        }}
                      >
                        <Plus size={14} className="mr-1" /> New Note
                      </button>
                      {notes
                        .filter((note) => note.folderId === folder.id)
                        .map((note, index) => (
                          <Draggable
                            key={note.id}
                            draggableId={note.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-2 p-2 rounded cursor-pointer flex items-center ${
                                  activeNoteId === note.id
                                    ? 'bg-gray-700'
                                    : 'hover:bg-gray-800'
                                }`}
                                onClick={() => setActiveNoteId(note.id)}
                              >
                                <FileText size={18} className="mr-2" />
                                {editingItemId === note.id ? (
                                  <input
                                    ref={nameEditRef}
                                    className="bg-gray-800 text-white p-1 rounded w-full"
                                    defaultValue={note.title}
                                    onKeyDown={(e) => handleNameEdit(e, 'note')}
                                    onBlur={() => setEditingItemId(null)}
                                    autoFocus
                                  />
                                ) : (
                                  <>
                                    <span className="flex-grow">
                                      {note.title}
                                    </span>
                                    <Edit2
                                      size={14}
                                      className="ml-2 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingItemId(note.id);
                                      }}
                                    />
                                    <Trash2
                                      size={14}
                                      className="ml-2 cursor-pointer text-red-500 hover:text-red-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNote(note.id);
                                      }}
                                    />
                                  </>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          ))}
        </div>
      </DragDropContext>
      <div className="flex-1 p-4 overflow-y-auto">
        {activeNote && (
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
                style={{ minHeight: 'calc(100vh - 2rem)' }}
              />
            ) : (
              <div className="w-full min-h-full">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={atomDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
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
        )}
      </div>
    </div>
  );
}

export default App;
