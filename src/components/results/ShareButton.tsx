import { useCallback, type RefObject } from 'react'
import { toPng } from 'html-to-image'

interface ShareButtonProps {
  cardRef: RefObject<HTMLDivElement | null>
  bracket: number
  commander?: string | null
}

export default function ShareButton({ cardRef, bracket, commander }: ShareButtonProps) {
  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#030712',
      })
      const link = document.createElement('a')
      link.download = `bracket-${bracket}${commander ? `-${commander.replace(/\s+/g, '-').toLowerCase()}` : ''}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to generate image:', err)
    }
  }, [cardRef, bracket, commander])

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
  }, [])

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
      >
        <span>&#8681;</span> Download Image
      </button>
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
      >
        <span>&#128279;</span> Copy Link
      </button>
    </div>
  )
}
