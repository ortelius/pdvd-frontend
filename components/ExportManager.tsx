'use client'

import React, { useEffect, useState } from 'react'
import { useExport } from '@/context/ExportContext'
import { useTheme } from '@/context/ThemeContext'
import DownloadIcon from '@mui/icons-material/Download'

export default function ExportManager() {
  const { isExportMode, setExportMode } = useExport()
  const { isDark } = useTheme() // Access theme state
  const [exporting, setExporting] = useState(false)

  // 1. Handle Click Capture
  useEffect(() => {
    if (!isExportMode) return

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      const target = e.target as HTMLElement
      // Enhanced selector to include explicit .export-card class
      const selector = '.export-card, .bg-white:not(tbody):not(tr):not(td), .bg-gray-50, .shadow-sm, .rounded-lg, .rounded-xl'
      
      const exportTarget = target.closest(selector) as HTMLElement || target
      
      handleExport(exportTarget)
    }

    // Capture phase to intercept all clicks
    document.addEventListener('click', handleClick, true)
    
    // Add escape key listener
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExportMode(false)
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isExportMode, setExportMode])

  // 2. Export Logic
  const handleExport = async (element: HTMLElement) => {
    if (exporting) return
    setExporting(true)
    
    try {
        // Temporarily hide the selection ring/outline for the screenshot
        const originalOutline = element.style.outline
        element.style.outline = 'none'

        // Capture dimensions
        const width = element.offsetWidth
        const height = element.offsetHeight

        const domtoimage = (await import('dom-to-image')).default
        
        const svgDataUrl = await domtoimage.toSvg(element, {
            quality: 1,
            // Dynamically set background color based on theme
            bgcolor: isDark ? '#0d1117' : '#ffffff', 
            width: width + 2, 
            height: height + 2,
            style: {
                transform: 'scale(1)',
                transformOrigin: 'top left',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                margin: '0' 
            },
            cacheBust: true,
            filter: (node: any) => {
                // Exclude scripts and the export banner itself
                return node.tagName !== 'SCRIPT' && node.id !== 'export-banner'
            }
        })
        
        const response = await fetch(svgDataUrl)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.download = `ortelius-export-${new Date().toISOString().split('T')[0]}.svg`
        link.href = url
        link.click()
        
        URL.revokeObjectURL(url)

        // Restore outline
        element.style.outline = originalOutline

    } catch (err) {
        console.error('Error exporting SVG:', err)
        alert('Failed to export selection. Try selecting a different container.')
    } finally {
        setExporting(false)
        setExportMode(false)
    }
  }

  if (!isExportMode) return null

  return (
    <>
      {/* Global Styles for Selection Mode */}
      <style jsx global>{`
        body {
          cursor: crosshair !important;
        }
        /* Highlight hoverable areas based on our selector logic */
        .export-card:hover,
        .bg-white:not(tbody):not(tr):not(td):hover, 
        .bg-gray-50:hover, 
        .shadow-sm:hover, 
        .rounded-lg:hover, 
        .rounded-xl:hover {
          outline: 2px dashed #3b82f6;
          outline-offset: -2px;
          cursor: pointer;
        }
        /* Reduce noise from small elements */
        span:hover, p:hover, h1:hover, h2:hover, h3:hover, svg:hover, tr:hover, td:hover {
          outline: none;
        }
      `}</style>

      {/* Selection Banner */}
      <div id="export-banner" className="fixed top-0 left-0 right-0 z-[9999] bg-blue-600 text-white px-6 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DownloadIcon sx={{ fontSize: 24 }} />
            <div>
              <p className="font-semibold">
                {exporting ? 'Generating SVG...' : 'Select an element to export'}
              </p>
              {!exporting && (
                <p className="text-sm text-blue-100">
                  Hover over any section and click to save as SVG
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setExportMode(false)}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Cancel (ESC)
          </button>
        </div>
      </div>
    </>
  )
}