import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportAsPNG, exportAsPDF, printView } from './export'
import type { ExportOptions } from './export'

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(),
}))

// Mock jspdf - use proper constructor function
vi.mock('jspdf', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MockJsPDF = function (this: any, _options: any) {
    this.internal = {
      pageSize: {
        getWidth: () => 297,
        getHeight: () => 210,
      },
    }
    this.addImage = vi.fn()
    this.save = vi.fn()
  }
  
  return {
    default: MockJsPDF,
  }
})

describe('export utilities', () => {
  let mockElement: HTMLElement
  let mockOptions: ExportOptions

  beforeEach(() => {
    mockElement = document.createElement('div')
    mockOptions = {
      harmonicaKey: 'C',
      songKey: 'G',
      scaleType: 'major',
      position: 2,
    }

    // Reset mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('exportAsPNG', () => {
    it('should create a PNG export with correct file name format', async () => {
      const html2canvas = (await import('html2canvas')).default
      const mockCanvas = {
        toBlob: vi.fn((callback) => {
          const blob = new Blob(['mock'], { type: 'image/png' })
          callback(blob)
        }),
      }

      vi.mocked(html2canvas).mockResolvedValue(mockCanvas as any)

      // Mock URL and DOM operations
      const mockUrl = 'blob:mock-url'
      globalThis.URL.createObjectURL = vi.fn(() => mockUrl)
      globalThis.URL.revokeObjectURL = vi.fn()
      const mockLink = document.createElement('a')
      const appendChildSpy = vi.spyOn(document.body, 'appendChild')
      const removeChildSpy = vi.spyOn(document.body, 'removeChild')
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink)

      await exportAsPNG(mockElement, mockOptions)

      expect(html2canvas).toHaveBeenCalledWith(mockElement, expect.objectContaining({
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      }))

      expect(mockLink.download).toMatch(/^harp-diem_C-harp_G-Major_2nd-pos_\d{4}-\d{2}-\d{2}\.png$/)
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink)
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink)
      expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl)
    })

    it('should handle errors gracefully', async () => {
      const html2canvas = (await import('html2canvas')).default
      vi.mocked(html2canvas).mockRejectedValue(new Error('Canvas error'))

      await expect(exportAsPNG(mockElement, mockOptions)).rejects.toThrow('Failed to export as PNG')
    })
  })

  describe('exportAsPDF', () => {
    it('should create a PDF export with correct configuration', async () => {
      const html2canvas = (await import('html2canvas')).default

      const mockCanvas = {
        toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
        width: 1000,
        height: 500,
      }

      vi.mocked(html2canvas).mockResolvedValue(mockCanvas as any)

      await exportAsPDF(mockElement, mockOptions)

      // Just verify the functions were called - the mock is being invoked
      expect(html2canvas).toHaveBeenCalledWith(mockElement, expect.objectContaining({
        backgroundColor: '#ffffff',
        scale: 2,
      }))
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png')
    })

    it('should handle errors gracefully', async () => {
      const html2canvas = (await import('html2canvas')).default
      vi.mocked(html2canvas).mockRejectedValue(new Error('Canvas error'))

      await expect(exportAsPDF(mockElement, mockOptions)).rejects.toThrow('Failed to export as PDF')
    })
  })

  describe('printView', () => {
    it('should call window.print', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})

      printView()

      expect(printSpy).toHaveBeenCalled()
    })
  })
})
