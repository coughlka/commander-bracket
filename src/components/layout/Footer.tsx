export default function Footer() {
  const discordUrl = import.meta.env.VITE_DISCORD_INVITE

  return (
    <footer className="border-t border-gray-800 mt-auto py-6 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>CommanderBracket &mdash; Free Commander deck bracket analysis</p>
        <div className="flex items-center gap-4">
          {discordUrl && (
            <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
              Discord
            </a>
          )}
          <span className="text-gray-700">&middot;</span>
          <p>Powered by Scryfall data</p>
        </div>
      </div>
    </footer>
  )
}
