import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/members', label: 'Miembros', icon: Users },
  { to: '/payments', label: 'Pagos', icon: CreditCard },
  { to: '/settings', label: 'Configuración', icon: Settings },
]

export default function Sidebar({ closeSidebar }) {
  const handleExit = () => {
    if (window.confirm('¿Estás seguro de que quieres salir de la aplicación?')) {
      window.close()
    }
  }

  return (
    <aside className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#1a1a1a]">
        <div className="flex flex-col items-center">
          <img 
            src="/images/logo.jpg" 
            alt="SPAFIT Logo" 
            className="w-20 h-20 object-contain mb-2 rounded-lg"
          />
          <p className="text-xs text-[#888888]">v2.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'sidebar-nav-item-active font-semibold' 
                  : 'sidebar-nav-item-inactive'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Exit Button */}
      <div className="p-4 border-t border-[#1a1a1a]">
        <button
          onClick={handleExit}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-[#888888] hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Salir</span>
        </button>
      </div>
    </aside>
  )
}