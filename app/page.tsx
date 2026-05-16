'use client';

import Sidebar from '../components/Sidebar';
import EditorPanel from '../components/EditorPanel';
import AIChatPanel from '../components/AIChatPanel';

export default function HomePage() {
  return (
    <main className="flex h-screen overflow-hidden bg-[#f8f9fa]">
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* MAIN EDITOR */}
      <div className="flex-1 min-w-0">
        <EditorPanel />
      </div>

      {/* RIGHT AI PANEL */}
      <AIChatPanel />
    </main>
  );
}