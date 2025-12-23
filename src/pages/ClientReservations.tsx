import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, Car, Bike, CircleDot, Droplets, MapPin,
  Plus, X, Check, Trash2, Sparkles, AlertCircle
} from 'lucide-react'
import { reservationsApi } from '../services/api'
import { useAuthStore } from '../stores/authStore'

interface Reservation {
  id: number
  reservation_type: string
  vehicle_type: string
  vehicle_plate: string
  wash_type?: string
  reservation_date: string
  start_time: string
  end_time: string
  status: string
  notes?: string
  created_at: string
}

interface TimeSlot {
  start_time: string
  end_time: string
  is_available: boolean
}

const VEHICLE_TYPES = [
  { value: 'carro', label: 'Carro', icon: Car },
  { value: 'moto', label: 'Moto', icon: Bike },
  { value: 'cicla', label: 'Bicicleta', icon: CircleDot }
]

const SERVICE_TYPES = [
  { value: 'parqueadero', label: 'Parqueadero', icon: MapPin, color: '#22D3EE' },
  { value: 'lavado', label: 'Lavado', icon: Droplets, color: '#F97316' }
]

const WASH_TYPES = [
  { value: 'simple', label: 'Lavado Simple', price: 15000 },
  { value: 'completo', label: 'Lavado Completo', price: 35000 }
]

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pendiente: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pendiente' },
  confirmado: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Confirmado' },
  en_progreso: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'En Progreso' },
  completado: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Completado' },
  cancelado: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelado' }
}

export default function ClientReservations() {
  const { user, logout } = useAuthStore()
  const queryClient = useQueryClient()
  
  const [showModal, setShowModal] = useState(false)
  const [serviceType, setServiceType] = useState<'parqueadero' | 'lavado'>('parqueadero')
  const [vehicleType, setVehicleType] = useState('carro')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [washType, setWashType] = useState('simple')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  // Get user's reservations
  const { data: reservations, isLoading } = useQuery({
    queryKey: ['my-reservations'],
    queryFn: () => reservationsApi.getMyReservations()
  })

  // Get available slots when date is selected
  const { data: slots, isLoading: loadingSlots } = useQuery({
    queryKey: ['available-slots', selectedDate, serviceType],
    queryFn: () => reservationsApi.getAvailableSlots(selectedDate, serviceType),
    enabled: !!selectedDate
  })

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof reservationsApi.create>[0]) => 
      reservationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] })
      closeModal()
    }
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => reservationsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] })
    }
  })

  const closeModal = () => {
    setShowModal(false)
    setSelectedDate('')
    setSelectedSlot(null)
    setVehiclePlate('')
    setServiceType('parqueadero')
    setVehicleType('carro')
    setWashType('simple')
  }

  const handleCreateReservation = () => {
    if (!selectedSlot || !vehiclePlate.trim() || !selectedDate) return

    createMutation.mutate({
      reservation_type: serviceType,
      vehicle_type: vehicleType,
      vehicle_plate: vehiclePlate.toUpperCase(),
      wash_type: serviceType === 'lavado' ? washType : undefined,
      reservation_date: selectedDate,
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5) // "HH:MM:SS" -> "HH:MM"
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const activeReservations = (reservations?.data || []).filter(
    (r: Reservation) => !['completado', 'cancelado'].includes(r.status)
  )
  const pastReservations = (reservations?.data || []).filter(
    (r: Reservation) => ['completado', 'cancelado'].includes(r.status)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1419] to-[#0a0a0f] p-4 md:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Mis Reservas</h1>
            <p className="text-gray-400">Hola, {user?.full_name || user?.username}</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Nueva Reserva
            </motion.button>
            <button
              onClick={logout}
              className="px-4 py-2.5 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 rounded-xl transition-all"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Active Reservations */}
      <div className="max-w-4xl mx-auto space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Reservas Activas
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeReservations.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700/50">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No tienes reservas activas</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-cyan-400 hover:text-cyan-300 text-sm"
              >
                Crear tu primera reserva →
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeReservations.map((reservation: Reservation) => {
                const status = STATUS_COLORS[reservation.status] || STATUS_COLORS.pendiente
                const VehicleIcon = VEHICLE_TYPES.find(v => v.value === reservation.vehicle_type)?.icon || Car
                
                return (
                  <motion.div
                    key={reservation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gray-800/40 rounded-2xl border border-gray-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          reservation.reservation_type === 'parqueadero' 
                            ? 'bg-cyan-500/20' 
                            : 'bg-orange-500/20'
                        }`}>
                          {reservation.reservation_type === 'parqueadero' 
                            ? <MapPin className="w-6 h-6 text-cyan-400" />
                            : <Droplets className="w-6 h-6 text-orange-400" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white capitalize">
                              {reservation.reservation_type}
                            </span>
                            {reservation.wash_type && (
                              <span className="text-xs text-gray-400 capitalize">
                                ({reservation.wash_type})
                              </span>
                            )}
                            <span className={`px-2 py-0.5 text-xs rounded-full ${status.bg} ${status.text}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <VehicleIcon className="w-4 h-4" />
                              {reservation.vehicle_plate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(reservation.reservation_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {reservation.status === 'pendiente' && (
                        <button
                          onClick={() => {
                            if (confirm('¿Cancelar esta reserva?')) {
                              cancelMutation.mutate(reservation.id)
                            }
                          }}
                          disabled={cancelMutation.isPending}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>

        {/* Past Reservations */}
        {pastReservations.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-400 mb-4">Historial</h2>
            <div className="grid gap-3 opacity-60">
              {pastReservations.slice(0, 5).map((reservation: Reservation) => {
                const status = STATUS_COLORS[reservation.status] || STATUS_COLORS.pendiente
                return (
                  <div
                    key={reservation.id}
                    className="p-3 bg-gray-800/20 rounded-xl border border-gray-700/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 capitalize">
                        {reservation.reservation_type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {reservation.vehicle_plate}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(reservation.reservation_date)}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* New Reservation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Nueva Reserva</h3>
                  <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-lg">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Servicio
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {SERVICE_TYPES.map((service) => {
                        const Icon = service.icon
                        const isSelected = serviceType === service.value
                        return (
                          <button
                            key={service.value}
                            onClick={() => {
                              setServiceType(service.value as 'parqueadero' | 'lavado')
                              setSelectedSlot(null)
                            }}
                            className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                              isSelected
                                ? 'border-cyan-500 bg-cyan-500/10'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <Icon className="w-6 h-6" style={{ color: isSelected ? service.color : '#9CA3AF' }} />
                            <span className={isSelected ? 'text-white' : 'text-gray-400'}>
                              {service.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Wash Type (only for lavado) */}
                  {serviceType === 'lavado' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo de Lavado
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {WASH_TYPES.map((wash) => (
                          <button
                            key={wash.value}
                            onClick={() => setWashType(wash.value)}
                            className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                              washType === wash.value
                                ? 'border-orange-500 bg-orange-500/10'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                          >
                            <Sparkles className={`w-5 h-5 ${washType === wash.value ? 'text-orange-400' : 'text-gray-500'}`} />
                            <span className={`text-sm ${washType === wash.value ? 'text-white' : 'text-gray-400'}`}>
                              {wash.label}
                            </span>
                            <span className="text-xs text-cyan-400">
                              ${wash.price.toLocaleString('es-CO')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vehicle Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo Vehículo
                      </label>
                      <div className="flex gap-2">
                        {VEHICLE_TYPES.map((v) => {
                          const Icon = v.icon
                          return (
                            <button
                              key={v.value}
                              onClick={() => setVehicleType(v.value)}
                              className={`flex-1 p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                                vehicleType === v.value
                                  ? 'border-cyan-500 bg-cyan-500/10'
                                  : 'border-gray-700'
                              }`}
                            >
                              <Icon className={`w-4 h-4 ${vehicleType === v.value ? 'text-cyan-400' : 'text-gray-500'}`} />
                              <span className="text-xs">{v.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Placa
                      </label>
                      <input
                        type="text"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                        placeholder="ABC123"
                        maxLength={7}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={getMinDate()}
                      onChange={(e) => {
                        setSelectedDate(e.target.value)
                        setSelectedSlot(null)
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 outline-none"
                    />
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Horario Disponible
                      </label>
                      {loadingSlots ? (
                        <div className="flex justify-center py-6">
                          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                          {(slots?.data || []).map((slot: TimeSlot, idx: number) => (
                            <button
                              key={idx}
                              disabled={!slot.is_available}
                              onClick={() => setSelectedSlot(slot)}
                              className={`px-2 py-2 rounded-lg text-sm transition-all ${
                                selectedSlot?.start_time === slot.start_time
                                  ? 'bg-cyan-500 text-black font-semibold'
                                  : slot.is_available
                                    ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                                    : 'bg-gray-800/50 text-gray-600 cursor-not-allowed border border-gray-800'
                              }`}
                            >
                              {formatTime(slot.start_time)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {createMutation.isError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Error al crear la reserva. Intenta de nuevo.
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-white/5"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateReservation}
                      disabled={!selectedSlot || !vehiclePlate.trim() || createMutation.isPending}
                      className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      {createMutation.isPending ? 'Creando...' : 'Reservar'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
