import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Car, 
  Droplets, 
  Shield, 
  Clock, 
  Bike, 
  CircleDot,
  Menu,
  X,
  Sparkles,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'

// Pricing data from the actual system
const PARKING_PRICES = [
  { type: 'Carros', icon: Car, price: 5000, unit: 'hora', color: '#22D3EE' },
  { type: 'Motos', icon: Bike, price: 3000, unit: 'hora', color: '#F97316' },
  { type: 'Bicicletas', icon: CircleDot, price: 1000, unit: 'hora', color: '#10B981' }
]

const WASH_PRICES = [
  { 
    type: 'Lavado Simple', 
    price: 15000, 
    description: 'Exterior, aspirado básico',
    icon: Droplets
  },
  { 
    type: 'Lavado Completo', 
    price: 35000, 
    description: 'Exterior, interior, motor, aspirado completo',
    icon: Sparkles
  }
]

const SERVICES = [
  {
    icon: Car,
    title: 'Parqueo Inteligente',
    description: 'Reserva y gestiona tu plaza con nuestra app.'
  },
  {
    icon: Droplets,
    title: 'Lavado Ecológico',
    description: 'Tecnología de vapor para acabado perfecto.'
  },
  {
    icon: Shield,
    title: 'Acceso 24/7',
    description: 'Seguridad disponible a toda hora.'
  }
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0 
    }).format(price)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">PARKLOT</span>
                <span className="block text-[10px] text-cyan-400 -mt-1 tracking-widest">PARK & WASH</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('inicio')} 
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Inicio
              </button>
              <button 
                onClick={() => scrollToSection('servicios')} 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Servicios
              </button>
              <button 
                onClick={() => scrollToSection('tarifas')} 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Tarifas
              </button>
              <button 
                onClick={() => scrollToSection('contacto')} 
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Contacto
              </button>
            </nav>

            {/* Login Button */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="hidden sm:flex items-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all"
              >
                Iniciar Sesión
              </motion.button>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-[#0f1419] border-t border-cyan-500/10"
          >
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => scrollToSection('inicio')} className="block w-full text-left text-cyan-400 py-2">Inicio</button>
              <button onClick={() => scrollToSection('servicios')} className="block w-full text-left text-gray-400 py-2">Servicios</button>
              <button onClick={() => scrollToSection('tarifas')} className="block w-full text-left text-gray-400 py-2">Tarifas</button>
              <button onClick={() => scrollToSection('contacto')} className="block w-full text-left text-gray-400 py-2">Contacto</button>
              <button 
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-cyan-500 text-black font-semibold rounded-lg mt-4"
              >
                Iniciar Sesión
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.1)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        </div>

        {/* Animated Grid Floor Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-64 perspective-1000">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(90deg, rgba(34,211,238,0.1) 1px, transparent 1px),
                linear-gradient(rgba(34,211,238,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: 'rotateX(60deg)',
              transformOrigin: 'bottom'
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                SOLUCIONES{' '}
                <span className="text-cyan-400">INTELIGENTES</span>
                <br />
                PARA TU VEHÍCULO
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-lg">
                Sistema integral de parqueadero y lavado con tecnología de punta. 
                Gestión automatizada, seguridad 24/7 y los mejores precios.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection('tarifas')}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all"
                >
                  VER TARIFAS
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection('servicios')}
                  className="px-8 py-3 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-semibold rounded-lg transition-all"
                >
                  Nuestros Servicios
                </motion.button>
              </div>
            </motion.div>

            {/* Car Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
                
                {/* Car placeholder with neon styling */}
                <div className="relative w-full aspect-video rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-500/30 flex items-center justify-center overflow-hidden">
                  <Car className="w-32 h-32 text-cyan-400/50" />
                  
                  {/* Neon floor line */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Nuestros Servicios</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Ofrecemos soluciones completas para el cuidado y estacionamiento de tu vehículo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {SERVICES.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-6 rounded-2xl bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-gray-400">{service.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifas" className="py-20 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Nuestras Tarifas</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Precios competitivos para todos los tipos de vehículos
            </p>
          </motion.div>

          {/* Parking Prices */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Parqueadero
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {PARKING_PRICES.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 hover:border-cyan-500/30 transition-all"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-1">{item.type}</h4>
                    <p className="text-2xl font-bold text-cyan-400">
                      {formatPrice(item.price)}
                      <span className="text-sm font-normal text-gray-500">/{item.unit}</span>
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Wash Prices */}
          <div>
            <h3 className="text-xl font-semibold text-cyan-400 mb-6 flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              Servicios de Lavado
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {WASH_PRICES.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">{item.type}</h4>
                        <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                        <p className="text-2xl font-bold text-cyan-400">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25"
            >
              RESERVAR AHORA
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Contáctanos</h2>
            <p className="text-gray-400">Estamos aquí para ayudarte</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50 text-center"
            >
              <MapPin className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-1">Ubicación</h4>
              <p className="text-sm text-gray-400">Cra 15 #45-67, Bogotá</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50 text-center"
            >
              <Phone className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-1">Teléfono</h4>
              <p className="text-sm text-gray-400">+57 300 123 4567</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50 text-center"
            >
              <Mail className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-1">Email</h4>
              <p className="text-sm text-gray-400">info@parklot.co</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">PARKLOT</span>
            </div>
            
            <p className="text-sm text-gray-500">
              © 2024 ParkLot. Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-4">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
