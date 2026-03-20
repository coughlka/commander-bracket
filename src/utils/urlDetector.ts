export type Platform = 'archidekt' | 'moxfield' | 'manabox' | 'tappedout' | 'deckstats' | 'unknown' | 'none'

export interface DetectedUrl {
  platform: Platform
  url: string
  deckId?: string
}

const PATTERNS: { platform: Platform; regex: RegExp; idGroup: number }[] = [
  { platform: 'archidekt', regex: /https?:\/\/(?:www\.)?archidekt\.com\/decks\/(\d+)/i, idGroup: 1 },
  { platform: 'moxfield', regex: /https?:\/\/(?:www\.)?moxfield\.com\/decks\/([\w-]+)/i, idGroup: 1 },
  { platform: 'manabox', regex: /https?:\/\/(?:www\.)?manabox\.app\//i, idGroup: 0 },
  { platform: 'tappedout', regex: /https?:\/\/(?:www\.)?tappedout\.net\//i, idGroup: 0 },
  { platform: 'deckstats', regex: /https?:\/\/(?:www\.)?deckstats\.net\//i, idGroup: 0 },
]

export function detectUrl(text: string): DetectedUrl {
  const trimmed = text.trim()

  // Check if the input looks like a URL (first line is a URL)
  const firstLine = trimmed.split('\n')[0].trim()
  if (!firstLine.match(/^https?:\/\//i)) {
    return { platform: 'none', url: '' }
  }

  for (const { platform, regex, idGroup } of PATTERNS) {
    const match = firstLine.match(regex)
    if (match) {
      return {
        platform,
        url: firstLine,
        deckId: idGroup > 0 ? match[idGroup] : undefined,
      }
    }
  }

  return { platform: 'unknown', url: firstLine }
}

export const PLATFORM_NAMES: Record<Platform, string> = {
  archidekt: 'Archidekt',
  moxfield: 'Moxfield',
  manabox: 'Manabox',
  tappedout: 'TappedOut',
  deckstats: 'Deckstats',
  unknown: 'Unknown',
  none: '',
}

export interface ExportGuide {
  platform: string
  steps: string[]
}

export const EXPORT_GUIDES: Partial<Record<Platform, ExportGuide>> = {
  moxfield: {
    platform: 'Moxfield',
    steps: [
      'Open your deck on Moxfield',
      'Click the three dots menu (...) at the top right',
      'Select "Export" then choose "Arena" format',
      'Click "Copy" and paste the text here',
    ],
  },
  manabox: {
    platform: 'Manabox',
    steps: [
      'Open your deck in Manabox',
      'Tap the Share icon',
      'Select "Export Decklist"',
      'Copy to clipboard and paste here',
    ],
  },
  tappedout: {
    platform: 'TappedOut',
    steps: [
      'Open your deck on TappedOut',
      'Click "Export" near the top of the page',
      'Choose "Text" format',
      'Copy the text and paste it here',
    ],
  },
  deckstats: {
    platform: 'Deckstats',
    steps: [
      'Open your deck on Deckstats',
      'Click "Export / Print"',
      'Choose "Copy to Clipboard"',
      'Paste the text here',
    ],
  },
  unknown: {
    platform: 'your deck builder',
    steps: [
      'Open your deck in the app',
      'Look for an "Export" or "Share" option',
      'Export as text/Arena format',
      'Copy and paste the decklist here',
    ],
  },
}
