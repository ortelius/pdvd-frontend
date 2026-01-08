'use client';

import React from 'react';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main 
      className="flex-1 flex flex-col min-h-screen h-screen overflow-hidden relative"
      style={{ width: '100%' }}
    >
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0d1117]">
        {children}
      </div>
    </main>
  );
}