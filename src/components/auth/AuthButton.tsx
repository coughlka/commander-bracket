import { useAuth } from '../../hooks/useAuth'

export default function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) return null

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt=""
            className="w-6 h-6 rounded-full"
          />
        )}
        <button
          onClick={signOut}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg px-3 py-1.5 transition-colors"
    >
      Sign in
    </button>
  )
}
