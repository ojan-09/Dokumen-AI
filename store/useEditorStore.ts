import { create } from 'zustand';

type DocumentItem = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

type EditorState = {
  documents: DocumentItem[];
  activeDocumentId: string | null;
  activeDocument: DocumentItem | null;
  editorContent: string;
  isSaving: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  setDocuments: (items: DocumentItem[]) => void;
  setActiveDocument: (doc: DocumentItem) => void;
  updateEditorContent: (value: string) => void;
  setSavingState: (status: EditorState['saveStatus']) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  documents: [],
  activeDocumentId: null,
  activeDocument: null,
  editorContent: '',
  isSaving: false,
  saveStatus: 'idle',
  setDocuments: (items) => set({ documents: items }),
  setActiveDocument: (doc) =>
    set({
      activeDocumentId: doc.id,
      activeDocument: doc,
      editorContent: doc.content,
      saveStatus: 'idle'
    }),
  updateEditorContent: (value) => set({ editorContent: value, saveStatus: 'saving' }),
  setSavingState: (status) => set({ saveStatus: status, isSaving: status === 'saving' })
}));
