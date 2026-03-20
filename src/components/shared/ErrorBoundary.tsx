import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 space-y-2">
          <p className="text-sm text-red-400 font-medium">Something went wrong displaying the results.</p>
          <p className="text-xs text-red-500/70">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-xs text-gray-400 hover:text-white underline"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
