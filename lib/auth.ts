export const saveToken = (token: string) => {
  localStorage.setItem('token', token)
  // Also set httpOnly cookie for API calls
  document.cookie = `token=${token}; path=/; secure; samesite=strict`
}

export const getToken = () => {
  return localStorage.getItem('token')
}