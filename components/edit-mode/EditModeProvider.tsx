'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

type EditModeContextValue = {
  isAdmin: boolean;
  editMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (v: boolean) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
};

const EditModeContext = createContext<EditModeContextValue>({
  isAdmin: false,
  editMode: false,
  toggleEditMode: () => {},
  setEditMode: () => {},
  isEditing: false,
  setIsEditing: () => {},
});

export function useEditMode() {
  return useContext(EditModeContext);
}

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isAdmin = !!session?.user?.isAdmin;
  const [editMode, setEditModeState] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const setEditMode = useCallback(
    (v: boolean) => {
      if (!isAdmin) return setEditModeState(false);
      setEditModeState(v);
    },
    [isAdmin],
  );

  const toggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    if (editMode && isEditing) {
      if (!confirm('You have unsaved changes. Discard and exit edit mode?')) return;
      setIsEditing(false);
    }
    setEditModeState((m) => !m);
  }, [isAdmin, editMode, isEditing]);

  // Manage <body> classes
  useEffect(() => {
    if (isAdmin) document.body.classList.add('has-edit-toolbar');
    else document.body.classList.remove('has-edit-toolbar');
  }, [isAdmin]);

  useEffect(() => {
    if (editMode) document.body.classList.add('edit-mode-active');
    else document.body.classList.remove('edit-mode-active');
  }, [editMode]);

  // Warn before unload while editing
  useEffect(() => {
    if (!isEditing) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isEditing]);

  return (
    <EditModeContext.Provider
      value={{ isAdmin, editMode, toggleEditMode, setEditMode, isEditing, setIsEditing }}
    >
      {children}
    </EditModeContext.Provider>
  );
}
