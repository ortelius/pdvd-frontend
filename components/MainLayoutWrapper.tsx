'use client';

import React from 'react';
import { useSidebar } from '../context/SidebarContext';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();

  return (
    <main 
      className="flex-1 transition-all duration-300 ease-in-out" // Tailwind classes for smooth animation
      style={{ 
        marginLeft: isExpanded ? '240px' : '64px', // Match your sidebar widths
        width: '100%' 
      }}
    >
      {children}
    </main>
  );
}