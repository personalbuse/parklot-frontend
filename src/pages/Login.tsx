import { useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../services/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setToken, setUser } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authApi.login(username, password)
      setToken(response.data.access_token)
      
      // Get user info
      const userResponse = await authApi.getMe()
      setUser(userResponse.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      setError(error.response?.data?.detail || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center grid-pattern p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 mb-4 neon-cyan animate-float"
          >
            <Cpu className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold neon-text-cyan mb-2">ParkIoT</h1>
          <p className="text-gray-400">Sistema Inteligente de Parqueadero</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold mb-6">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-dark-200 border border-primary/20 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white placeholder-gray-500 transition-all"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-200 border border-primary/20 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-white placeholder-gray-500 transition-all pr-12"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-500 disabled:bg-primary/50 text-dark-300 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 neon-cyan"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar al Sistema'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Centro de Control IoT v1.0</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
