import { PLATFORM_NAMES, EXPORT_GUIDES, type DetectedUrl } from '../../utils/urlDetector'

interface PlatformGuideProps {
  detected: DetectedUrl
  onDismiss: () => void
}

export default function PlatformGuide({ detected, onDismiss }: PlatformGuideProps) {
  const guide = EXPORT_GUIDES[detected.platform]
  if (!guide) return null

  const platformName = PLATFORM_NAMES[detected.platform]

  return (
    <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-yellow-400">
            {platformName} link detected
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {platformName} requires a manual export. Follow these quick steps:
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-gray-300 text-lg leading-none"
        >
          &times;
        </button>
      </div>

      <ol className="space-y-2">
        {guide.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-700 text-gray-400 text-xs flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <p className="text-xs text-gray-500">
        Then clear this field and paste the exported text.
      </p>
    </div>
  )
}
