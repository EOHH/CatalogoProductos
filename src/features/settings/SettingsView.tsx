import { useState } from 'react'
import { Layout, Palette, Globe } from 'lucide-react'
import { GeneralSettings } from './components/GeneralSettings'
import { AppearanceSettings } from './components/AppearanceSettings'
import { SEOSettings } from './components/SEOSettings'

type Tab = 'general' | 'appearance' | 'seo'

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<Tab>('appearance')

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
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'appearance' 
                ? 'bg-primary/10 text-primary' 
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Palette className="h-4 w-4 mr-3 shrink-0" />
            Apariencia
          </button>
          
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'general' 
                ? 'bg-primary/10 text-primary' 
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Layout className="h-4 w-4 mr-3 shrink-0" />
            General
          </button>
          
          <button
            onClick={() => setActiveTab('seo')}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'seo' 
                ? 'bg-primary/10 text-primary' 
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Globe className="h-4 w-4 mr-3 shrink-0" />
            SEO y Dominios
          </button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 md:p-8">
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'general' && <GeneralSettings />}
            {activeTab === 'seo' && <SEOSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}
