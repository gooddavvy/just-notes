import React, { useState, useEffect, useRef } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ConfirmationModal from "./components/ConfirmationModal";
import Sidebar from "./components/Sidebar";
import NoteEditor from "./components/NoteEditor";

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

interface DeleteConfirmation {
  isOpen: boolean;
  itemType: "note" | "folder";
  itemId: string | null;
  itemName: string;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation>({
      isOpen: false,
      itemType: "note",
      itemId: null,
      itemName: "",
    });
  const editRef = useRef<HTMLTextAreaElement>(null);
  const nameEditRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    const savedFolders = localStorage.getItem("folders");
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedFolders) setFolders(JSON.parse(savedFolders));
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("folders", JSON.stringify(folders));
  }, [folders]);

  function createNote(folderId: string | null = null) {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      folderId,
    };
    setNotes([...notes, newNote]);
    setActiveNoteId(newNote.id);
    setIsEditing(true);
  }

  function createFolder() {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: "New Folder",
      isOpen: true,
    };
    setFolders([...folders, newFolder]);
    setEditingItemId(newFolder.id);
  }

  function updateNote(id: string, content: string) {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, content } : note))
    );
  }

  function updateNoteTitle(id: string, title: string) {
    setNotes(notes.map((note) => (note.id === id ? { ...note, title } : note)));
  }

  function updateFolderName(id: string, name: string) {
    setFolders(
      folders.map((folder) => (folder.id === id ? { ...folder, name } : folder))
    );
  }

  function toggleFolder(id: string) {
    setFolders(
      folders.map((folder) =>
        folder.id === id ? { ...folder, isOpen: !folder.isOpen } : folder
      )
    );
  }

  function deleteNote(id: string) {
    setNotes(notes.filter((note) => note.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }

  function deleteFolder(id: string) {
    setFolders(folders.filter((folder) => folder.id !== id));
    setNotes(notes.filter((note) => note.folderId !== id));
  }

  function onDragEnd(result: any) {
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
        destination.droppableId === "root" ? null : destination.droppableId;
      setNotes(
        notes.map((note) =>
          note.id === noteId ? { ...note, folderId: newFolderId } : note
        )
      );
    }
  }

  const activeNote = notes.find((note) => note.id === activeNoteId);

  function handleNameEdit(
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "note" | "folder"
  ) {
    if (e.key === "Enter") {
      const newName = e.currentTarget.value.trim();
      if (newName && editingItemId) {
        if (type === "note") {
          updateNoteTitle(editingItemId, newName);
        } else {
          updateFolderName(editingItemId, newName);
        }
      }
      setEditingItemId(null);
    }
  }

  function handleDelete(itemType: "note" | "folder", id: string, name: string) {
    setDeleteConfirmation({
      isOpen: true,
      itemType,
      itemId: id,
      itemName: name,
    });
  }

  function confirmDelete() {
    if (deleteConfirmation.itemId) {
      if (deleteConfirmation.itemType === "note") {
        deleteNote(deleteConfirmation.itemId);
      } else {
        deleteFolder(deleteConfirmation.itemId);
      }
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <DragDropContext onDragEnd={onDragEnd}>
        <Sidebar
          notes={notes}
          folders={folders}
          createNote={createNote}
          createFolder={createFolder}
          setActiveNoteId={setActiveNoteId}
          setIsEditing={setIsEditing}
          setEditingItemId={setEditingItemId}
          handleDelete={handleDelete}
          toggleFolder={toggleFolder}
          editingItemId={editingItemId}
          nameEditRef={nameEditRef}
        />
      </DragDropContext>
      <NoteEditor
        activeNote={activeNote}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        updateNote={updateNote}
        editRef={editRef}
      />
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })
        }
        onConfirm={confirmDelete}
        title={`Delete ${deleteConfirmation.itemType}`}
        message={`Are you sure you want to delete "${deleteConfirmation.itemName}"? This action cannot be undone.`}
      />
    </div>
  );
}

export default App;
