import { useAuth as useAuthContext } from '../context/AuthContext'

export function useAuth() {
  // Use the AuthContext instead of managing auth state locally
  return useAuthContext()
}
