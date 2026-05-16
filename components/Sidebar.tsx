'use client';

import { useEffect, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import {
  Plus,
  Search,
  Upload,
  File,
  ChevronLeft,
  ChevronRight,
  Trash2,
  FileText,
  Pencil,
} from 'lucide-react';

type FileDto = {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
};

export default function Sidebar() {
  const {
    documents,
    activeDocumentId,
    setDocuments,
    setActiveDocument,
  } = useEditorStore();

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (activeDocumentId) {
      fetchFiles(activeDocumentId);
    }
  }, [activeDocumentId]);

  async function fetchDocuments() {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      const docs = await res.json();
      setDocuments(docs);
      if (docs.length > 0 && !activeDocumentId) {
        setActiveDocument(docs[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFiles(documentId: string) {
    try {
      const res = await fetch(`/api/documents/${documentId}/files`);
      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function createDocument() {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Dokumen Baru', content: '' }),
      });
      const doc = await res.json();
      setDocuments([doc, ...documents]);
      setActiveDocument(doc);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteDocument(id: string) {
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      const updatedDocs = documents.filter((doc) => doc.id !== id);
      setDocuments(updatedDocs);
      if (activeDocumentId === id && updatedDocs.length > 0) {
        setActiveDocument(updatedDocs[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function renameDocument(id: string, newTitle: string) {
    if (!newTitle.trim()) return;
    try {
      const doc = documents.find((d) => d.id === id);
      if (!doc) return;

      await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: doc.content,
        }),
      });

      const updatedDocs = documents.map((d) =>
        d.id === id ? { ...d, title: newTitle } : d
      );
      setDocuments(updatedDocs);
      setEditingId(null);
    } catch (error) {
      console.error(error);
    }
  }

  function startRename(id: string, currentTitle: string) {
    setEditingId(id);
    setEditTitle(currentTitle);
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !activeDocumentId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/documents/${activeDocumentId}/files`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const newFile = await res.json();
        setFiles([newFile, ...files]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="relative flex h-screen">
      {/* Sidebar */}
      <aside
        className={`
          flex h-screen flex-col border-r border-slate-200 bg-white
          transition-all duration-200 ease-in-out
          ${isSidebarOpen ? 'w-[256px]' : 'w-0 overflow-hidden border-r-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-800">Workspace</span>
          </div>
        </div>

        {/* New Doc Button */}
        <div className="px-3 pt-3 pb-2">
          <button
            suppressHydrationWarning
            onClick={createDocument}
            className="
              flex w-full items-center gap-2
              rounded-full bg-blue-50
              px-4 py-2
              text-sm font-medium text-blue-700
              transition hover:bg-blue-100
            "
          >
            <Plus className="h-4 w-4" />
            Dokumen baru
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
            <Search className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <input
              suppressHydrationWarning
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari dokumen..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {loading && (
            <p className="px-3 py-2 text-xs text-slate-400">Memuat dokumen...</p>
          )}
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className={`
                group flex items-center gap-2 rounded-lg px-3 py-2
                transition-colors
                ${doc.id === activeDocumentId
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              <FileText
                className={`h-4 w-4 flex-shrink-0 ${
                  doc.id === activeDocumentId ? 'text-blue-500' : 'text-slate-400'
                }`}
              />
              
              {editingId === doc.id ? (
                <div className="min-w-0 flex-1">
                  <input
                    suppressHydrationWarning
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => renameDocument(doc.id, editTitle)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        renameDocument(doc.id, editTitle);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    className="w-full rounded border border-blue-400 bg-white px-2 py-0.5 text-sm font-medium outline-none"
                  />
                </div>
              ) : (
                <button
                  suppressHydrationWarning
                  onClick={() => setActiveDocument(doc)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-medium">{doc.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatTimestamp(doc.updatedAt)}
                  </p>
                </button>
              )}

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => startRename(doc.id, doc.title)}
                  className="
                    flex h-6 w-6 flex-shrink-0 items-center justify-center
                    rounded text-slate-400
                    transition hover:bg-blue-50 hover:text-blue-600
                  "
                  title="Rename"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => deleteDocument(doc.id)}
                  className="
                    flex h-6 w-6 flex-shrink-0 items-center justify-center
                    rounded text-slate-400
                    transition hover:bg-red-50 hover:text-red-500
                  "
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Attachments */}
        {activeDocumentId && (
          <div className="border-t border-slate-100 px-3 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                File terlampir
              </span>
              <label className="flex items-center gap-1 cursor-pointer rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 transition">
                <Upload className="h-3.5 w-3.5" />
                {uploading ? 'Uploading...' : 'Unggah'}
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <div className="space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition"
                >
                  <File className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-700">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Toggle Button */}
      <button
        suppressHydrationWarning
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="
          absolute -right-3 top-16 z-50
          flex h-6 w-6 items-center justify-center
          rounded-full border border-slate-200
          bg-white shadow-sm
          text-slate-500
          transition hover:bg-slate-50 hover:text-slate-700
        "
      >
        {isSidebarOpen
          ? <ChevronLeft className="h-3.5 w-3.5" />
          : <ChevronRight className="h-3.5 w-3.5" />
        }
      </button>
    </div>
  );
}