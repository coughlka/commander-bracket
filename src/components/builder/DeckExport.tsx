import { useState } from 'react'

interface DeckCard {
  name: string
  quantity: number
  role: string
}

interface DeckExportProps {
  commander: string
  cards: DeckCard[]
}

type ExportFormat = 'arena' | 'moxfield' | 'manabox' | 'text'

const FORMAT_LABELS: Record<ExportFormat, string> = {
  arena: 'Arena',
  moxfield: 'Moxfield',
  manabox: 'Manabox',
  text: 'Text',
}

function formatDecklist(commander: string, cards: DeckCard[], format: ExportFormat): string {
  const commanderCards = cards.filter(c => c.role === 'commander')
  const mainboard = cards.filter(c => c.role !== 'commander')

  const lines: string[] = []

  switch (format) {
    case 'arena':
      lines.push('Commander')
      for (const c of commanderCards) {
        lines.push(`${c.quantity} ${c.name}`)
      }
      if (commanderCards.length === 0) {
        lines.push(`1 ${commander}`)
      }
      lines.push('')
      lines.push('Deck')
      for (const c of mainboard) {
        lines.push(`${c.quantity} ${c.name}`)
      }
      break

    case 'moxfield':
      lines.push('// Commander')
      for (const c of commanderCards) {
        lines.push(`${c.quantity}x ${c.name}`)
      }
      if (commanderCards.length === 0) {
        lines.push(`1x ${commander}`)
      }
      lines.push('')
      lines.push('// Mainboard')
      for (const c of mainboard) {
        lines.push(`${c.quantity}x ${c.name}`)
      }
      break

    case 'manabox':
      lines.push('// Commander')
      for (const c of commanderCards) {
        lines.push(`${c.quantity} ${c.name}`)
      }
      if (commanderCards.length === 0) {
        lines.push(`1 ${commander}`)
      }
      lines.push('')
      for (const c of mainboard) {
        lines.push(`${c.quantity} ${c.name}`)
      }
      break

    case 'text':
    default:
      lines.push('// Commander')
      for (const c of commanderCards) {
        lines.push(`${c.quantity} ${c.name}`)
      }
      if (commanderCards.length === 0) {
        lines.push(`1 ${commander}`)
      }
      lines.push('')
      for (const c of mainboard) {
        lines.push(`${c.quantity} ${c.name}`)
      }
      break
  }

  return lines.join('\n')
}

export default function DeckExport({ commander, cards }: DeckExportProps) {
  const [copied, setCopied] = useState<ExportFormat | null>(null)

  const handleCopy = (format: ExportFormat) => {
    const text = formatDecklist(commander, cards, format)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(format)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const handleDownload = () => {
    const text = formatDecklist(commander, cards, 'text')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${commander.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Export Decklist</h3>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map(format => (
          <button
            key={format}
            onClick={() => handleCopy(format)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              copied === format
                ? 'bg-green-900/30 border-green-800/50 text-green-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {copied === format ? 'Copied!' : `Copy ${FORMAT_LABELS[format]}`}
          </button>
        ))}
        <button
          onClick={handleDownload}
          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Download .txt
        </button>
      </div>
    </div>
  )
}
