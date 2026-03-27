/**
 * Tests for AssetGallery regenerate/iterate UX (FIR-1320)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AssetGallery } from '../AssetGallery'
import type { AssetGalleryItem } from '../AssetGallery'

const TEXT_ASSET: AssetGalleryItem = {
  id: 'txt-1',
  type: 'text',
  name: 'Test Caption',
  text: 'A sample caption for testing.',
  model: 'gemini-1.5-flash',
  jobId: 'job_abc123',
}

const IMAGE_ASSET: AssetGalleryItem = {
  id: 'img-1',
  type: 'image',
  name: 'Test Image',
  model: 'flux-schnell',
  costUsd: 0.003,
  jobId: 'job_def456',
}

const BASE_PROPS = {
  assets: [TEXT_ASSET, IMAGE_ASSET],
  selectedIds: [],
  onSelectionChange: vi.fn(),
}

describe('AssetGallery — FIR-1320 iteration UX', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('action button rendering', () => {
    it('renders Regenerate buttons when onRegenerate prop is provided', () => {
      render(
        <AssetGallery
          {...BASE_PROPS}
          onRegenerate={vi.fn()}
        />
      )
      // Text tab is default
      const regenButtons = screen.getAllByText('Regenerate')
      expect(regenButtons.length).toBeGreaterThan(0)
    })

    it('does not render Regenerate buttons when onRegenerate is not provided', () => {
      render(<AssetGallery {...BASE_PROPS} />)
      expect(screen.queryByText('Regenerate')).toBeNull()
    })

    it('renders Save Variant buttons when onSaveVariant prop is provided', () => {
      render(
        <AssetGallery
          {...BASE_PROPS}
          onSaveVariant={vi.fn()}
        />
      )
      const saveButtons = screen.getAllByText('Save Variant')
      expect(saveButtons.length).toBeGreaterThan(0)
    })

    it('renders Try Again button in tab header when onTryAgain is provided', () => {
      render(
        <AssetGallery
          {...BASE_PROPS}
          onTryAgain={vi.fn()}
        />
      )
      expect(screen.getByText('Try Again (Full Run)')).toBeTruthy()
    })

    it('does not render action buttons when no callbacks provided', () => {
      render(<AssetGallery {...BASE_PROPS} />)
      expect(screen.queryByText('Regenerate')).toBeNull()
      expect(screen.queryByText('Save Variant')).toBeNull()
      expect(screen.queryByText('Try Again (Full Run)')).toBeNull()
    })
  })

  describe('action callbacks', () => {
    it('calls onRegenerate with the correct item when Regenerate is clicked', () => {
      const onRegenerate = vi.fn()
      render(
        <AssetGallery
          {...BASE_PROPS}
          onRegenerate={onRegenerate}
        />
      )
      const btn = screen.getAllByText('Regenerate')[0]
      fireEvent.click(btn)
      expect(onRegenerate).toHaveBeenCalledOnce()
      expect(onRegenerate).toHaveBeenCalledWith(TEXT_ASSET)
    })

    it('calls onTryAgain when Try Again button is clicked', () => {
      const onTryAgain = vi.fn()
      render(
        <AssetGallery
          {...BASE_PROPS}
          onTryAgain={onTryAgain}
        />
      )
      fireEvent.click(screen.getByText('Try Again (Full Run)'))
      expect(onTryAgain).toHaveBeenCalledOnce()
    })

    it('calls onSaveVariant with the correct item when Save Variant is clicked', () => {
      const onSaveVariant = vi.fn()
      render(
        <AssetGallery
          {...BASE_PROPS}
          onSaveVariant={onSaveVariant}
        />
      )
      const btn = screen.getAllByText('Save Variant')[0]
      fireEvent.click(btn)
      expect(onSaveVariant).toHaveBeenCalledOnce()
      expect(onSaveVariant).toHaveBeenCalledWith(TEXT_ASSET)
    })

    it('shows Saved state after Save Variant is clicked', () => {
      const onSaveVariant = vi.fn()
      render(
        <AssetGallery
          {...BASE_PROPS}
          onSaveVariant={onSaveVariant}
        />
      )
      const btn = screen.getAllByText('Save Variant')[0]
      fireEvent.click(btn)
      // After click the button text changes to "Saved"
      expect(screen.getAllByText('Saved').length).toBeGreaterThan(0)
    })
  })

  describe('AssetGalleryItem interface extensions', () => {
    it('accepts jobId and sessionId on AssetGalleryItem without error', () => {
      const itemWithMeta: AssetGalleryItem = {
        id: 'test-1',
        type: 'text',
        name: 'Test',
        text: 'Hello',
        jobId: 'job_xyz',
        sessionId: 'session_abc',
      }
      render(
        <AssetGallery
          assets={[itemWithMeta]}
          selectedIds={[]}
          onSelectionChange={vi.fn()}
        />
      )
      expect(screen.getByText('Test')).toBeTruthy()
    })
  })

  describe('tab switching with action buttons', () => {
    it('shows Regenerate buttons on Images tab when switching tabs', () => {
      const onRegenerate = vi.fn()
      render(
        <AssetGallery
          {...BASE_PROPS}
          onRegenerate={onRegenerate}
        />
      )
      // Switch to Images tab
      fireEvent.click(screen.getByText('Images'))
      const regenButtons = screen.getAllByText('Regenerate')
      expect(regenButtons.length).toBeGreaterThan(0)
    })
  })
})
