import { useState } from 'react'

export default function FeedbackWidget() {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null)
  const discordUrl = import.meta.env.VITE_DISCORD_INVITE

  if (voted) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-400">
          Thanks for the feedback!
          {discordUrl && (
            <>
              {' '}Join our{' '}
              <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                Discord
              </a>{' '}
              for discussion.
            </>
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <span className="text-sm text-gray-500">Was this accurate?</span>
      <button
        onClick={() => setVoted('up')}
        className="px-3 py-1 bg-gray-800 hover:bg-green-900/40 border border-gray-700 rounded-lg text-sm transition-colors"
      >
        &#128077;
      </button>
      <button
        onClick={() => setVoted('down')}
        className="px-3 py-1 bg-gray-800 hover:bg-red-900/40 border border-gray-700 rounded-lg text-sm transition-colors"
      >
        &#128078;
      </button>
    </div>
  )
}
