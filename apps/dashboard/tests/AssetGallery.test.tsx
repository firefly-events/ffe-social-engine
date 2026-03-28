import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AssetGallery from '../src/components/AssetGallery'
import type { AssetGalleryItem } from '../src/components/AssetGallery'

const MOCK_ASSETS: AssetGalleryItem[] = [
  {
    id: 'txt-1',
    type: 'text',
    name: 'Text Asset 1',
    text: 'This is the first text asset.',
    model: 'gemini-1.5-flash',
    generationMs: 840,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'img-1',
    type: 'image',
    name: 'Image Asset 1',
    url: 'http://example.com/img1.jpg',
    model: 'flux-schnell',
    costUsd: 0.003,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vid-1',
    type: 'video',
    name: 'Video Asset 1',
    thumbnailUrl: 'http://example.com/thumb1.jpg',
    durationSeconds: 30,
    model: 'runway-gen3',
    generationMs: 45000,
    createdAt: new Date().toISOString(),
  },
]

describe('AssetGallery', () => {
  it('renders and defaults to the Text tab', () => {
    render(<AssetGallery assets={MOCK_ASSETS} selectedIds={[]} onSelectionChange={() => {}} />)
    expect(screen.getByText('Text Asset 1')).toBeInTheDocument()
    expect(screen.getByText('This is the first text asset.')).toBeInTheDocument()
    // It shouldn't show images or videos by default
    expect(screen.queryByText('Image Asset 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Video Asset 1')).not.toBeInTheDocument()
  })

  it('switches tabs correctly', () => {
    render(<AssetGallery assets={MOCK_ASSETS} selectedIds={[]} onSelectionChange={() => {}} />)
    
    // Click Images tab
    fireEvent.click(screen.getByText('Images'))
    expect(screen.getByText('Image Asset 1')).toBeInTheDocument()
    expect(screen.queryByText('Text Asset 1')).not.toBeInTheDocument()

    // Click Videos tab
    fireEvent.click(screen.getByText('Videos'))
    expect(screen.getByText('Video Asset 1')).toBeInTheDocument()
    expect(screen.queryByText('Image Asset 1')).not.toBeInTheDocument()
  })

  it('handles multi-selection', () => {
    const onSelectionChange = vi.fn()
    render(<AssetGallery assets={MOCK_ASSETS} selectedIds={[]} onSelectionChange={onSelectionChange} />)

    // Select the text item
    const checkbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(checkbox)
    expect(onSelectionChange).toHaveBeenCalledWith(['txt-1'])
  })

  it('handles "Select All" correctly', () => {
    const onSelectionChange = vi.fn()
    render(<AssetGallery assets={MOCK_ASSETS} selectedIds={[]} onSelectionChange={onSelectionChange} />)

    // Click Select All (in Text tab)
    fireEvent.click(screen.getByText('Select All'))
    expect(onSelectionChange).toHaveBeenCalledWith(['txt-1'])
  })

  it('can copy text to clipboard', async () => {
    // Mock clipboard API
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    render(<AssetGallery assets={MOCK_ASSETS} selectedIds={[]} onSelectionChange={() => {}} />)
    
    fireEvent.click(screen.getByText('Copy'))
    expect(writeTextMock).toHaveBeenCalledWith('This is the first text asset.')
    expect(await screen.findByText('Copied!')).toBeInTheDocument()
  })

  it('filters assets by search term', () => {
    render(<AssetGallery assets={MOCK_ASSETS} selectedIds={[]} onSelectionChange={() => {}} />)
    
    const searchInput = screen.getByPlaceholderText(/Search name, model, or text/i)
    
    // Search for "first"
    fireEvent.change(searchInput, { target: { value: 'first' } })
    expect(screen.getByText('Text Asset 1')).toBeInTheDocument()
    
    // Search for something non-existent
    fireEvent.change(searchInput, { target: { value: 'xyz' } })
    expect(screen.queryByText('Text Asset 1')).not.toBeInTheDocument()
    expect(screen.getByText('No matching text assets found.')).toBeInTheDocument()
  })

  it('sorts assets correctly', () => {
    const assets: AssetGalleryItem[] = [
      { id: '1', type: 'text', name: 'Zebra', createdAt: '2020-01-01', text: 'Oldest' },
      { id: '2', type: 'text', name: 'Apple', createdAt: '2026-01-01', text: 'Newest' },
    ]
    render(<AssetGallery assets={assets} selectedIds={[]} onSelectionChange={() => {}} />)
    
    // Default is newest first (Apple is 2026)
    const textElements = screen.getAllByText(/Apple|Zebra/)
    expect(textElements[0]).toHaveTextContent('Apple')
    
    // Switch to oldest first (Zebra is 2020)
    const sortSelect = screen.getByRole('combobox')
    fireEvent.change(sortSelect, { target: { value: 'oldest' } })
    
    const textElementsSorted = screen.getAllByText(/Apple|Zebra/)
    expect(textElementsSorted[0]).toHaveTextContent('Zebra')
  })
})
