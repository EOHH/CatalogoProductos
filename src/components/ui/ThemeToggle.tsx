import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'

export function ThemeToggle({ showLabel = true }: { showLabel?: boolean }) {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-colors flex flex-col items-center group relative"
      title="Cambiar tema"
    >
      <div className="relative">
        {theme === 'dark' ? (
          <Sun className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.2} />
        ) : (
          <Moon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.2} />
        )}
      </div>
      {showLabel && (
        <span className="hidden lg:block text-[9px] font-medium uppercase tracking-widest mt-1.5 text-zinc-500 dark:text-zinc-500 group-hover:text-primary dark:group-hover:text-primary">
          Tema
        </span>
      )}
    </button>
  )
}
