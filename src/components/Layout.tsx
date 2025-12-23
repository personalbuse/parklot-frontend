import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Car,
  MapPin,
  Droplets,
  Cpu,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  DollarSign,
  Sun,
  Moon
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/parking', icon: MapPin, label: 'Mapa' },
  { path: '/vehicles', icon: Car, label: 'Vehículos' },
  { path: '/wash', icon: Droplets, label: 'Lavadero' },
  { path: '/agenda', icon: Settings, label: 'Agenda' },
  { path: '/iot', icon: Cpu, label: 'IoT', adminOnly: true },
  { path: '/tariffs', icon: DollarSign, label: 'Tarifas', adminOnly: true },
  { path: '/admin', icon: Settings, label: 'Config', adminOnly: true },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  const filteredNavItems = navItems.filter(
    item => !('adminOnly' in item) || item.adminOnly === false || user?.role === 'admin'
  )

  return (
    <div className="flex h-screen overflow-hidden grid-pattern">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 z-40 h-full w-64 glass border-r border-primary/20"
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center neon-cyan">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-primary">ParkIoT</h1>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-auto max-h-[calc(100vh-180px)]">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary/20 text-primary neon-cyan'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-primary/20 bg-theme-secondary backdrop-blur">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate text-theme-primary">{user?.full_name || user?.username}</p>
              <p className="text-xs text-theme-muted capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen && !isMobile ? 'md:ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="h-14 glass border-b border-primary/20 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-primary" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-green-500 font-medium">Sistema Activo</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 h-[calc(100vh-3.5rem)] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
