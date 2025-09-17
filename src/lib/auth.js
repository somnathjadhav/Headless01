// JWT/OAuth helpers for secure queries
export function getAuthHeaders() {
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function isAuthenticated() {
  return !!localStorage.getItem('auth_token')
}

export function logout() {
  localStorage.removeItem('auth_token')
  window.location.href = '/'
}
