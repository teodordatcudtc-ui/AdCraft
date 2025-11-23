'use client'

export const ADMIN_PASSWORD = 'Teodor_200710'

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  
  const authStatus = localStorage.getItem('admin_authenticated')
  const authTimestamp = localStorage.getItem('admin_auth_timestamp')
  
  if (!authStatus || authStatus !== 'true' || !authTimestamp) {
    return false
  }
  
  // Verifică dacă autentificarea nu e mai veche de 30 de zile
  const timestamp = parseInt(authTimestamp, 10)
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
  const now = Date.now()
  
  if (now - timestamp > thirtyDaysInMs) {
    // Autentificarea a expirat
    localStorage.removeItem('admin_authenticated')
    localStorage.removeItem('admin_auth_timestamp')
    return false
  }
  
  return true
}

export function setAdminAuthenticated(): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('admin_authenticated', 'true')
  localStorage.setItem('admin_auth_timestamp', Date.now().toString())
}

export function clearAdminAuth(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('admin_authenticated')
  localStorage.removeItem('admin_auth_timestamp')
}

