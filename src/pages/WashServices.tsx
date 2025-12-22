import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Droplets, Play, Check, Clock, User, Plus, X, Car, 
  Sparkles, Bike, CircleDot 
} from 'lucide-react'
import { washApi, vehiclesApi } from '../services/api'
import { ReceiptModal, ReceiptData, generateReceiptNumber } from '../components/Receipt'

interface WashService {
  id: number
  entry_id: number
  washer_id?: number
  wash_type: string
  status: string
  price: number
  start_time?: string
  end_time?: string
  created_at: string
  entry?: {
    vehicle?: {
      plate: string
      vehicle_type: string
    }
    entry_time?: string
  }
}

const VEHICLE_TYPES = [
  { value: 'carro', label: 'Carro', icon: Car },
  { value: 'moto', label: 'Moto', icon: Bike },
  { value: 'cicla', label: 'Bicicleta', icon: CircleDot }
]

const WASH_TYPES = [
  { 
    value: 'simple', 
    label: 'Lavado Simple', 
    price: 15000, 
    description: 'Exterior, aspirado básico',
    icon: Droplets,
    color: '#22D3EE'
  },
  { 
    value: 'completo', 
    label: 'Lavado Completo', 
    price: 35000, 
    description: 'Exterior, interior, motor, aspirado completo',
    icon: Sparkles,
    color: '#F97316'
  }
]

export default function WashServices() {
  const [showModal, setShowModal] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [plate, setPlate] = useState('')
  const [vehicleType, setVehicleType] = useState('carro')
  const [washType, setWashType] = useState('simple')
  
  const queryClient = useQueryClient()

  const { data: pending } = useQuery({
    queryKey: ['wash-pending'],
    queryFn: () => washApi.getPending(),
    refetchInterval: 5000
  })

  const { data: inProgress } = useQuery({
    queryKey: ['wash-inprogress'],
    queryFn: () => washApi.getInProgress(),
    refetchInterval: 5000
  })

  const startMutation = useMutation({
    mutationFn: (id: number) => washApi.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wash-pending'] })
      queryClient.invalidateQueries({ queryKey: ['wash-inprogress'] })
    }
  })

  const completeMutation = useMutation({
    mutationFn: (wash: WashService) => washApi.complete(wash.id),
    onSuccess: (_data, wash) => {
      queryClient.invalidateQueries({ queryKey: ['wash-inprogress'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      
      // Generate receipt for completed wash
      const now = new Date()
      const receipt: ReceiptData = {
        receiptNumber: generateReceiptNumber(),
        plate: wash.entry?.vehicle?.plate || 'N/A',
        vehicleType: wash.entry?.vehicle?.vehicle_type || 'carro',
        serviceType: 'wash',
        washType: wash.wash_type,
        entryTime: wash.start_time || wash.created_at,
        exitTime: now.toISOString(),
        washAmount: wash.price,
        totalAmount: wash.price,
        paymentMethod: 'efectivo',
        date: now.toLocaleDateString('es-CO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      setReceiptData(receipt)
      setShowReceipt(true)
    }
  })

  // Register vehicle for wash only
  const registerWashMutation = useMutation({
    mutationFn: async (data: { plate: string; vehicle_type: string; wash_type: string }) => {
      // Register as wash-only entry (no parking charge)
      const entryRes = await vehiclesApi.registerWashOnlyEntry({
        plate: data.plate,
        vehicle_type: data.vehicle_type
      })
      // Then create wash service
      const entryId = entryRes.data.id
      return washApi.create({
        entry_id: entryId,
        wash_type: data.wash_type
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wash-pending'] })
      queryClient.invalidateQueries({ queryKey: ['active-entries'] })
      setShowModal(false)
      setPlate('')
      setVehicleType('carro')
      setWashType('simple')
    }
  })

  const handleRegisterWash = () => {
    if (!plate.trim()) return
    registerWashMutation.mutate({
      plate: plate.toUpperCase(),
      vehicle_type: vehicleType,
      wash_type: washType
    })
  }

  const handleComplete = (wash: WashService) => {
    completeMutation.mutate(wash)
  }

  const handleCloseReceipt = () => {
    setShowReceipt(false)
    setReceiptData(null)
  }

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">Servicios de Lavado</h1>
          <p className="text-sm text-theme-muted">Gestiona los servicios de lavadero</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-dark-300 rounded-xl font-medium"
        >
          <Plus className="w-5 h-5" />
          Nuevo Lavado
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Pending */}
        <div className="glass-card p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Pendientes</h3>
              <p className="text-sm text-theme-muted">{pending?.data?.length || 0} en cola</p>
            </div>
          </div>

          <div className="space-y-3">
            {(pending?.data || []).map((wash: WashService) => (
              <motion.div
                key={wash.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-theme-secondary rounded-xl border border-yellow-500/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-primary" />
                    <span className="font-medium capitalize">
                      Lavado {wash.wash_type}
                    </span>
                  </div>
                  <span className="text-primary font-semibold text-sm">
                    {formatPrice(wash.price)}
                  </span>
                </div>
                {wash.entry?.vehicle && (
                  <p className="text-sm text-theme-muted mb-2">
                    🚗 {wash.entry.vehicle.plate}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-theme-muted">
                    {new Date(wash.created_at).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <button
                    onClick={() => startMutation.mutate(wash.id)}
                    disabled={startMutation.isPending}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-all text-sm"
                  >
                    <Play className="w-4 h-4" />
                    Iniciar
                  </button>
                </div>
              </motion.div>
            ))}

            {(!pending?.data || pending.data.length === 0) && (
              <div className="text-center py-8 text-theme-muted">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                No hay servicios pendientes
              </div>
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="glass-card p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
              <Droplets className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">En Proceso</h3>
              <p className="text-sm text-theme-muted">{inProgress?.data?.length || 0} activos</p>
            </div>
          </div>

          <div className="space-y-3">
            {(inProgress?.data || []).map((wash: WashService) => (
              <motion.div
                key={wash.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-theme-secondary rounded-xl border border-primary/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-primary animate-pulse" />
                    <span className="font-medium capitalize">
                      Lavado {wash.wash_type}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                    En progreso
                  </span>
                </div>
                
                {wash.entry?.vehicle && (
                  <p className="text-sm text-theme-muted mb-2">
                    🚗 {wash.entry.vehicle.plate}
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-theme-muted mb-3">
                  <User className="w-3 h-3" />
                  <span>Lavador #{wash.washer_id || 'Asignado'}</span>
                  <span className="mx-1">•</span>
                  <span>
                    Inicio: {wash.start_time && new Date(wash.start_time).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <button
                  onClick={() => handleComplete(wash)}
                  disabled={completeMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded-lg transition-all text-sm"
                >
                  <Check className="w-4 h-4" />
                  {completeMutation.isPending ? 'Procesando...' : 'Completar y Cobrar'}
                </button>
              </motion.div>
            ))}

            {(!inProgress?.data || inProgress.data.length === 0) && (
              <div className="text-center py-8 text-theme-muted">
                <Droplets className="w-10 h-10 mx-auto mb-2 opacity-50" />
                No hay servicios en proceso
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Wash Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-primary" />
                  Nuevo Servicio de Lavado
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Plate input */}
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Placa del Vehículo
                  </label>
                  <input
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    placeholder="Ej: ABC123"
                    maxLength={7}
                    className="w-full px-4 py-3 bg-theme-secondary border border-primary/20 rounded-xl focus:border-primary outline-none text-lg font-mono tracking-wider"
                  />
                </div>

                {/* Vehicle type */}
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Tipo de Vehículo
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {VEHICLE_TYPES.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.value}
                          onClick={() => setVehicleType(type.value)}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                            vehicleType === type.value
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${vehicleType === type.value ? 'text-primary' : 'text-theme-muted'}`} />
                          <span className="text-xs">{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Wash type */}
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Tipo de Lavado
                  </label>
                  <div className="space-y-2">
                    {WASH_TYPES.map((type) => {
                      const Icon = type.icon
                      const isSelected = washType === type.value
                      return (
                        <button
                          key={type.value}
                          onClick={() => setWashType(type.value)}
                          className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div 
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${type.color}20` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: type.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{type.label}</span>
                              <span className="font-bold text-primary text-sm">
                                {formatPrice(type.price)}
                              </span>
                            </div>
                            <p className="text-xs text-theme-muted">{type.description}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-gray-600 text-theme-secondary rounded-xl hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRegisterWash}
                    disabled={!plate.trim() || registerWashMutation.isPending}
                    className="flex-1 py-3 bg-primary hover:bg-primary-500 disabled:opacity-50 text-dark-300 font-semibold rounded-xl flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {registerWashMutation.isPending ? 'Registrando...' : 'Registrar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      {receiptData && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={handleCloseReceipt}
          data={receiptData}
        />
      )}
    </div>
  )
}
