import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import {
  FileText,
  Plus,
  Folder,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
} from "lucide-react";

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

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  createNote: (folderId?: string | null) => void;
  createFolder: () => void;
  setActiveNoteId: (id: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  setEditingItemId: (id: string | null) => void;
  handleDelete: (itemType: "note" | "folder", id: string, name: string) => void;
  toggleFolder: (id: string) => void;
  editingItemId: string | null;
  nameEditRef: React.RefObject<HTMLInputElement>;
}

function Sidebar({
  notes,
  folders,
  createNote,
  createFolder,
  setActiveNoteId,
  setIsEditing,
  setEditingItemId,
  handleDelete,
  toggleFolder,
  editingItemId,
  nameEditRef,
}: SidebarProps) {
  const handleNameEdit = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "note" | "folder"
  ) => {
    if (e.key === "Enter") {
      const newName = e.currentTarget.value.trim();
      if (newName && editingItemId) {
        if (type === "note") {
          // Assume updateNoteTitle is passed or handled elsewhere
        } else {
          // Assume updateFolderName is passed or handled elsewhere
        }
      }
      setEditingItemId(null);
    }
  };

  return (
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
                <Draggable key={note.id} draggableId={note.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`mb-2 p-2 rounded cursor-pointer flex items-center ${
                        // Active note styling should be handled via props
                        "bg-gray-700"
                      }`}
                      onClick={() => setActiveNoteId(note.id)}
                    >
                      <FileText size={18} className="mr-2" />
                      {editingItemId === note.id ? (
                        <input
                          ref={nameEditRef}
                          className="bg-gray-800 text-white p-1 rounded w-full"
                          defaultValue={note.title}
                          onKeyDown={(e) => handleNameEdit(e, "note")}
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
                              handleDelete("note", note.id, note.title);
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
                onKeyDown={(e) => handleNameEdit(e, "folder")}
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
                    handleDelete("folder", folder.id, folder.name);
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
                              // Active note styling should be handled via props
                              "bg-gray-700"
                            }`}
                            onClick={() => setActiveNoteId(note.id)}
                          >
                            <FileText size={18} className="mr-2" />
                            {editingItemId === note.id ? (
                              <input
                                ref={nameEditRef}
                                className="bg-gray-800 text-white p-1 rounded w-full"
                                defaultValue={note.title}
                                onKeyDown={(e) => handleNameEdit(e, "note")}
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
                                    handleDelete("note", note.id, note.title);
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
  );
}

export default Sidebar;
