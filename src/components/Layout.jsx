import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0 sidebar">
        <Sidebar closeSidebar={closeSidebar} />
      </div>

      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Mobile Drawer */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden sidebar
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar closeSidebar={closeSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-black">
          <Outlet />
        </main>
      </div>
    </div>
  )
}