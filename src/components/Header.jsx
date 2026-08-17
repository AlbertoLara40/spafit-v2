import { Menu } from 'lucide-react'

export default function Header({ toggleSidebar }) {
  return (
    <header className="h-16 header flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-[#888888] hover:bg-[#1a1a1a] hover:text-[#c9a961] transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:block">
          <p className="text-sm text-[#888888]">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <img 
          src="/images/logo.jpg" 
          alt="SPAFIT" 
          className="w-8 h-8 object-contain rounded-full"
        />
      </div>
    </header>
  )
}