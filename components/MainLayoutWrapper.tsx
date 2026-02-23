'use client';

import React from 'react';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main 
      className="flex-1 flex flex-col min-h-screen h-screen overflow-hidden relative"
      style={{ width: '100%' }}
    >
      {/* FIX: Removed hardcoded hex class. bg-white is handled by globals.css for dark mode */}
      <div className="flex-1 overflow-y-auto bg-white">
        {children}
      </div>
    </main>
  );
}