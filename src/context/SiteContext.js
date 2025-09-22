import { createContext, useContext, useState } from 'react'

const SiteContext = createContext()

export function SiteProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [siteSettings, setSiteSettings] = useState({
    title: 'Headless WordPress',
    description: 'A modern headless WordPress site'
  })
  
  const value = {
    isAuthenticated,
    setIsAuthenticated,
    siteSettings,
    setSiteSettings
  }

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSite() {
  const context = useContext(SiteContext)
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider')
  }
  return context
}
