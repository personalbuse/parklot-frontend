import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Car,
  Search,
  LogOut,
  Clock,
  DollarSign,
  CreditCard,
  Banknote,
  Droplets,
  X,
  Sparkles,
  Check
} from 'lucide-react'
import { vehiclesApi, paymentsApi, washApi } from '../services/api'
import { ReceiptModal, ReceiptData, generateReceiptNumber } from '../components/Receipt'

interface Vehicle {
  id: number
  plate: string
  vehicle_type: string
  brand?: string
  model?: string
  color?: string
  is_monthly: boolean
}

interface VehicleEntry {
  id: number
  vehicle_id: number
  space_id?: number
  entry_time: string
  exit_time?: string
  is_active: boolean
  vehicle: Vehicle
}

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

export default function Vehicles() {
  const [searchPlate, setSearchPlate] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showWashModal, setShowWashModal] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<VehicleEntry | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta'>('efectivo')
  const [selectedWashType, setSelectedWashType] = useState('simple')
  const queryClient = useQueryClient()

  const { data: activeEntries, isLoading } = useQuery({
    queryKey: ['active-entries'],
    queryFn: () => vehiclesApi.getActiveEntries(),
    refetchInterval: 10000
  })

  const exitMutation = useMutation({
    mutationFn: (entryId: number) => vehiclesApi.registerExit(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-entries'] })
    }
  })

  const paymentMutation = useMutation({
    mutationFn: (data: { entry_id: number; method: string }) =>
      paymentsApi.process(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['active-entries'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      
      // Generate and show receipt
      if (selectedEntry) {
        const now = new Date()
        const duration = calculateDuration(selectedEntry.entry_time)
        const amount = calculateAmount(selectedEntry.entry_time, selectedEntry.vehicle.vehicle_type)
        
        const receipt: ReceiptData = {
          receiptNumber: generateReceiptNumber(),
          plate: selectedEntry.vehicle.plate,
          vehicleType: selectedEntry.vehicle.vehicle_type,
          serviceType: 'parking',
          entryTime: selectedEntry.entry_time,
          exitTime: now.toISOString(),
          duration: duration,
          parkingAmount: amount,
          totalAmount: amount,
          paymentMethod: variables.method,
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
        setShowPaymentModal(false)
        setShowReceipt(true)
      }
    }
  })

  const washMutation = useMutation({
    mutationFn: (data: { entry_id: number; wash_type: string }) =>
      washApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wash-services'] })
      queryClient.invalidateQueries({ queryKey: ['active-entries'] })
      setShowWashModal(false)
      setSelectedEntry(null)
    }
  })

  const handleExit = (entry: VehicleEntry) => {
    setSelectedEntry(entry)
    setShowPaymentModal(true)
  }

  const handleSendToWash = (entry: VehicleEntry) => {
    setSelectedEntry(entry)
    setSelectedWashType('simple')
    setShowWashModal(true)
  }

  const processPayment = async () => {
    if (!selectedEntry) return
    
    // First register exit
    await exitMutation.mutateAsync(selectedEntry.id)
    
    // Then process payment
    paymentMutation.mutate({
      entry_id: selectedEntry.id,
      method: paymentMethod
    })
  }

  const confirmWash = () => {
    if (!selectedEntry) return
    washMutation.mutate({
      entry_id: selectedEntry.id,
      wash_type: selectedWashType
    })
  }

  const calculateDuration = (entryTime: string) => {
    const entry = new Date(entryTime)
    const now = new Date()
    const diff = now.getTime() - entry.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const calculateAmount = (entryTime: string, vehicleType: string) => {
    const entry = new Date(entryTime)
    const now = new Date()
    const hours = Math.max(1, Math.ceil((now.getTime() - entry.getTime()) / (1000 * 60 * 60)))
    const rate = vehicleType === 'carro' ? 5000 : vehicleType === 'moto' ? 2500 : 1500
    return hours * rate
  }

  const filteredEntries = (activeEntries?.data || []).filter((entry: VehicleEntry) =>
    entry.vehicle.plate.toLowerCase().includes(searchPlate.toLowerCase())
  )

  const handleCloseReceipt = () => {
    setShowReceipt(false)
    setReceiptData(null)
    setSelectedEntry(null)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1">Vehículos Activos</h1>
          <p className="text-sm text-theme-muted">
            {activeEntries?.data?.length || 0} vehículos en el parqueadero
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
        <input
          type="text"
          placeholder="Buscar por placa..."
          value={searchPlate}
          onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
          className="w-full pl-12 pr-4 py-3 bg-dark-200 border border-primary/20 rounded-xl focus:outline-none focus:border-primary"
        />
      </div>

      {/* Vehicles Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEntries.map((entry: VehicleEntry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{entry.vehicle.plate}</p>
                    <p className="text-xs text-theme-muted capitalize">
                      {entry.vehicle.vehicle_type}
                    </p>
                  </div>
                </div>
                {entry.vehicle.is_monthly && (
                  <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full">
                    Mensual
                  </span>
                )}
              </div>

              <div className="space-y-1.5 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-theme-muted" />
                  <span className="text-theme-muted">Entrada:</span>
                  <span>
                    {new Date(entry.entry_time).toLocaleString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-theme-muted" />
                  <span className="text-theme-muted">Tiempo:</span>
                  <span className="text-primary font-medium">
                    {calculateDuration(entry.entry_time)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleSendToWash(entry)}
                  className="flex-1 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Droplets className="w-4 h-4" />
                  Lavado
                </button>
                <button
                  onClick={() => handleExit(entry)}
                  className="flex-1 py-2 bg-accent/20 hover:bg-accent/30 text-accent text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Salida
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredEntries.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-theme-muted">No hay vehículos activos</p>
        </div>
      )}

      {/* Wash Modal */}
      <AnimatePresence>
        {showWashModal && selectedEntry && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-cyan-400" />
                  Enviar a Lavado
                </h3>
                <button
                  onClick={() => setShowWashModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-dark-200 rounded-xl">
                <p className="text-sm text-theme-muted">Vehículo</p>
                <p className="font-bold text-lg">{selectedEntry.vehicle.plate}</p>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-theme-secondary">Tipo de Lavado</p>
                {WASH_TYPES.map((type) => {
                  const Icon = type.icon
                  const isSelected = selectedWashType === type.value
                  return (
                    <button
                      key={type.value}
                      onClick={() => setSelectedWashType(type.value)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${type.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: type.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{type.label}</span>
                          <span className="font-bold text-primary">
                            ${type.price.toLocaleString('es-CO')}
                          </span>
                        </div>
                        <p className="text-xs text-theme-muted mt-1">{type.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowWashModal(false)}
                  className="flex-1 py-3 border border-gray-600 text-theme-secondary rounded-xl hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmWash}
                  disabled={washMutation.isPending}
                  className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {washMutation.isPending ? 'Enviando...' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedEntry && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Procesar Pago</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-dark-200 rounded-xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-theme-muted">Vehículo</span>
                    <span className="font-bold">{selectedEntry.vehicle.plate}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-theme-muted">Tipo</span>
                    <span className="capitalize">{selectedEntry.vehicle.vehicle_type}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-theme-muted">Tiempo</span>
                    <span>{calculateDuration(selectedEntry.entry_time)}</span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-gray-700">
                    <span className="text-theme-muted">Total</span>
                    <span className="font-bold text-primary">
                      ${calculateAmount(selectedEntry.entry_time, selectedEntry.vehicle.vehicle_type).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Método de Pago
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('efectivo')}
                      className={`p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'efectivo'
                          ? 'border-green-500 bg-green-500/20 text-green-400'
                          : 'border-gray-600 text-theme-muted'
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                      Efectivo
                    </button>
                    <button
                      onClick={() => setPaymentMethod('tarjeta')}
                      className={`p-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        paymentMethod === 'tarjeta'
                          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                          : 'border-gray-600 text-theme-muted'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      Tarjeta
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false)
                      setSelectedEntry(null)
                    }}
                    className="flex-1 py-3 border border-gray-600 text-theme-secondary rounded-xl hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={paymentMutation.isPending || exitMutation.isPending}
                    className="flex-1 py-3 bg-primary hover:bg-primary-500 text-dark-300 font-semibold rounded-xl"
                  >
                    {paymentMutation.isPending ? 'Procesando...' : 'Confirmar Pago'}
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
