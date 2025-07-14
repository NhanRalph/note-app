import React, { createContext, useContext, useState } from "react";
import { NoteType } from "../api/noteAPI";

interface NoteContextType {
  selectedNote: NoteType | null;
  handleSetSelectedNote: (note: NoteType) => void;
  notes: NoteType[];
  setNotes: (notes: NoteType[]) => void;
  handleUpdateNote: (newNotes: NoteType) => void;
  handleSetNotes: (newNotes: NoteType[]) => void;
  handleDeleteNote: (noteId: string) => void;
  handleAddNote: (newNote: NoteType) => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [notes, setNotes] = useState<NoteType[]>([]);

  const handleSetSelectedNote = (note: NoteType) => {
    setSelectedNote(note);
  };

  const handleSetNotes = (newNotes: NoteType[]) => {
    setNotes((prevNotes) => {
      const existingNoteIds = new Set(prevNotes.map((note) => note.id));
      const updatedNotes = newNotes.filter(
        (note) => !existingNoteIds.has(note.id)
      );
      return [...prevNotes, ...updatedNotes];
    });
  };

  const handleAddNote = (newNote: NoteType) => {
    setNotes((prevNotes) => [...prevNotes, newNote]);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(null);
    }
  };

  const handleUpdateNote = (newNotes: NoteType) => {
    handleSetSelectedNote(newNotes);
    setNotes((prevNotes) => {
      const existingNoteIndex = prevNotes.findIndex(
        (note) => note.id === newNotes.id
      );
      if (existingNoteIndex !== -1) {
        // Update existing note
        const updatedNotes = [...prevNotes];
        updatedNotes[existingNoteIndex] = newNotes;
        return updatedNotes;
      } else {
        // Add new note
        return [...prevNotes, newNotes];
      }
    });
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        setNotes,
        handleUpdateNote,
        handleSetNotes,
        handleSetSelectedNote,
        selectedNote,
        handleDeleteNote,
        handleAddNote
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export const useNoteContext = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNoteContext must be used within a NoteProvider");
  }
  return context;
};
