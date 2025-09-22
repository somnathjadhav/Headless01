// Session-based auth helpers (no localStorage)
export function getAuthHeaders() {
  // Session-based authentication - no token needed in headers
  return {}
}

export function isAuthenticated() {
  // This should be checked via server-side session verification
  // For now, return false and let the AuthContext handle authentication state
  return false
}

export function logout() {
  // Logout is handled by the AuthContext
  window.location.href = '/'
}
