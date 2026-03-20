export default function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
      </div>
      <p className="text-sm text-gray-400 animate-pulse">
        Analyzing your deck...
      </p>
      <p className="text-xs text-gray-600">
        This may take a few seconds for large decklists
      </p>
    </div>
  )
}
