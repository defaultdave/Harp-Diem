import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportAsPNG, exportAsPDF, printView } from './exportLazy'
import type { ExportOptions } from './export'

// Mock dynamic imports
vi.mock('html2canvas', () => ({
  default: vi.fn(),
}))

vi.mock('jspdf', () => ({
  default: class {
    internal = {
      pageSize: {
        getWidth: () => 297,
        getHeight: () => 210,
      },
    }
    addImage = vi.fn()
    save = vi.fn()
  },
}))

describe('lazy export utilities', () => {
  const mockOptions: ExportOptions = {
    harmonicaKey: 'C',
    songKey: 'G',
    scaleType: 'major',
    position: 2,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportAsPNG', () => {
    it('should throw error if no element provided', async () => {
      await expect(exportAsPNG(null, mockOptions)).rejects.toThrow('No element provided for export')
    })

    it('should dynamically import html2canvas', async () => {
      const mockElement = document.createElement('div')
      const mockCanvas = {
        toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
          callback(new Blob(['test'], { type: 'image/png' }))
        }),
      }

      const html2canvas = (await import('html2canvas')).default
      vi.mocked(html2canvas).mockResolvedValue(mockCanvas as any)

      // Mock URL.createObjectURL and related DOM methods
      global.URL.createObjectURL = vi.fn(() => 'blob:test')
      global.URL.revokeObjectURL = vi.fn()
      const clickMock = vi.fn()
      const appendChildMock = vi.fn()
      const removeChildMock = vi.fn()
      
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const element = {
          click: clickMock,
          href: '',
          download: '',
        }
        return element as any
      })
      
      vi.spyOn(document.body, 'appendChild').mockImplementation(appendChildMock)
      vi.spyOn(document.body, 'removeChild').mockImplementation(removeChildMock)

      await exportAsPNG(mockElement, mockOptions)

      expect(html2canvas).toHaveBeenCalledWith(mockElement, expect.any(Object))
    })

    it('should handle errors gracefully', async () => {
      const mockElement = document.createElement('div')
      const html2canvas = (await import('html2canvas')).default
      vi.mocked(html2canvas).mockRejectedValue(new Error('Canvas error'))

      await expect(exportAsPNG(mockElement, mockOptions)).rejects.toThrow('Failed to export as PNG')
    })
  })

  describe('exportAsPDF', () => {
    it('should throw error if no element provided', async () => {
      await expect(exportAsPDF(null, mockOptions)).rejects.toThrow('No element provided for export')
    })

    it('should dynamically import both html2canvas and jspdf', async () => {
      const mockElement = document.createElement('div')
      const mockCanvas = {
        toDataURL: vi.fn(() => 'data:image/png;base64,test'),
        width: 800,
        height: 600,
      }

      const html2canvas = (await import('html2canvas')).default
      
      vi.mocked(html2canvas).mockResolvedValue(mockCanvas as any)

      await exportAsPDF(mockElement, mockOptions)

      expect(html2canvas).toHaveBeenCalledWith(mockElement, expect.any(Object))
    })

    it('should handle errors gracefully', async () => {
      const mockElement = document.createElement('div')
      const html2canvas = (await import('html2canvas')).default
      vi.mocked(html2canvas).mockRejectedValue(new Error('Canvas error'))

      await expect(exportAsPDF(mockElement, mockOptions)).rejects.toThrow('Failed to export as PDF')
    })
  })

  describe('printView', () => {
    it('should call window.print', () => {
      const printMock = vi.fn()
      window.print = printMock

      printView()

      expect(printMock).toHaveBeenCalled()
    })
  })
})
