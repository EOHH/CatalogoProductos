import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Layout, Palette, Globe, User } from 'lucide-react'
import { GeneralSettings } from './components/GeneralSettings'
import { AppearanceSettings } from './components/AppearanceSettings'
import { SEOSettings } from './components/SEOSettings'
import { ProfileSettings } from './components/ProfileSettings'

type Tab = 'profile' | 'general' | 'appearance' | 'seo'

export function SettingsView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) || 'appearance'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  // Sincronizar el estado interno si cambia la URL externamente
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as Tab
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Personaliza tu tienda y gestiona tus preferencias</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <nav className="w-full md:w-64 flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 shrink-0">
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'profile' 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground'
            }`}
          >
            <User className="h-4 w-4 mr-3 shrink-0" />
            Perfil
          </button>
          
          <button
            onClick={() => handleTabChange('appearance')}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'appearance' 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground'
            }`}
          >
            <Palette className="h-4 w-4 mr-3 shrink-0" />
            Apariencia
          </button>
          
          <button
            onClick={() => handleTabChange('general')}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'general' 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground'
            }`}
          >
            <Layout className="h-4 w-4 mr-3 shrink-0" />
            General
          </button>
          
          <button
            onClick={() => handleTabChange('seo')}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'seo' 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground'
            }`}
          >
            <Globe className="h-4 w-4 mr-3 shrink-0" />
            SEO y Dominios
          </button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-card rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 md:p-8">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'seo' && <SEOSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}
