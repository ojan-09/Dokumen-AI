git push -u origin main'use client';

import { ReactNode, useMemo, useState } from 'react';
import { Sparkles, Send, Info } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';

type QuickAction = {
  label: string;
  value: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

const quickActions: QuickAction[] = [];

export default function AIChatPanel() {
  const { editorContent, updateEditorContent, activeDocument } = useEditorStore();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = prompt.trim().length > 0;

  const applyToDoc = () => {
    updateEditorContent(response || messages[messages.length - 1]?.text || '');
  };

  const replaceSelection = () => {
    if (!activeDocument) return;
    updateEditorContent(response || messages[messages.length - 1]?.text || '');
  };

  const sendPrompt = async (systemPrompt: string | null = null) => {
    if (!canSubmit || !activeDocument) return;
    setIsLoading(true);
    const userPrompt = systemPrompt || prompt;
    setMessages((prev) => [...prev, { role: 'user', text: userPrompt }]);
    setPrompt('');

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId: activeDocument.id,
        prompt: userPrompt,
        documentContent: editorContent,
      }),
    });

    let data: any = null;

    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Invalid AI response:', error);
    }

    const aiResponse = data?.response || 'AI tidak memberikan balasan.';

    setResponse(aiResponse);
    setMessages((prev) => [...prev, { role: 'assistant', text: aiResponse }]);
    setIsLoading(false);
  };

  const suggestions = useMemo<ReactNode[]>(
    () =>
      quickActions.map((action) => (
        <button
          key={action.label}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-blue-400 hover:bg-blue-50"
          onClick={() => sendPrompt(action.value)}
          type="button"
        >
          <span className="font-medium">{action.label}</span>
          <p className="mt-1 text-xs text-slate-500">{action.value}</p>
        </button>
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <section className="flex h-screen w-[340px] flex-shrink-0 flex-col border-l border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50">
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-slate-800">AI Assistant</span>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          Claude
        </span>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && !response && (
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
            AI akan membantu menulis, merangkum, dan memperbaiki dokumen.
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`
              rounded-xl px-3 py-2.5 text-sm leading-relaxed
              ${
                message.role === 'user'
                  ? 'ml-auto max-w-[85%] rounded-tr-sm bg-blue-50 text-blue-900'
                  : 'mr-auto max-w-[92%] rounded-tl-sm bg-slate-100 text-slate-800'
              }
            `}
          >
            {message.role === 'assistant' && (
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Claude
              </p>
            )}
            <p className="whitespace-pre-line">{message.text}</p>
          </div>
        ))}
      </div>

      {/* Apply buttons */}
      {(messages.length > 0 || response) && (
        <div className="flex gap-2 px-4 pb-2">
          <button
            type="button"
            onClick={applyToDoc}
            className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50 hover:border-blue-400"
          >
            Apply ke dokumen
          </button>
          <button
            type="button"
            onClick={replaceSelection}
            className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50 hover:border-blue-400"
          >
            Replace
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-slate-100 px-4 py-3 space-y-2">
        <textarea
          suppressHydrationWarning
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && canSubmit) {
              e.preventDefault();
              sendPrompt();
            }
          }}
          placeholder="Ketik prompt AI... (mis. 'Perbaiki paragraf ini', 'Buat daftar poin penting')"
          className="
            min-h-[90px] w-full resize-none
            rounded-lg border border-slate-200
            bg-slate-50 px-3 py-2.5
            text-sm text-slate-700
            outline-none
            transition-colors
            placeholder:text-slate-400
            focus:border-blue-400 focus:bg-white
          "
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Info className="h-3.5 w-3.5" />
            <span>AI membaca konteks editor</span>
          </div>
          <button
            type="button"
            onClick={() => sendPrompt()}
            disabled={!canSubmit || isLoading}
            className="
              inline-flex items-center gap-1.5 rounded-md
              bg-blue-600 px-3.5 py-1.5
              text-xs font-medium text-white
              transition-colors
              hover:bg-blue-700
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            <Send className="h-3.5 w-3.5" />
            {isLoading ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </div>
    </section>
  );
}