import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Calendar, Clock, Car, Bike, CircleDot, Droplets, MapPin,
  ChevronLeft, ChevronRight, Play, Check, XCircle, User
} from 'lucide-react'
import { reservationsApi } from '../services/api'

interface Reservation {
  id: number
  client_id: number
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

interface DailyAgenda {
  date: string
  reservations: Reservation[]
  total_parking: number
  total_wash: number
}

const VEHICLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  carro: Car,
  moto: Bike,
  cicla: CircleDot
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; next?: string; nextLabel?: string }> = {
  pendiente: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pendiente', next: 'confirmado', nextLabel: 'Confirmar' },
  confirmado: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Confirmado', next: 'en_progreso', nextLabel: 'Iniciar' },
  en_progreso: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'En Progreso', next: 'completado', nextLabel: 'Completar' },
  completado: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Completado' },
  cancelado: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelado' }
}

export default function OperatorAgenda() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const queryClient = useQueryClient()

  const { data: agenda, isLoading } = useQuery<{ data: DailyAgenda }>({
    queryKey: ['agenda', selectedDate],
    queryFn: () => reservationsApi.getAgenda(selectedDate)
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      reservationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] })
    }
  })

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate.toISOString().split('T')[0])
  }

  const formatTime = (timeStr: string) => timeStr.slice(0, 5)

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)
    
    const diffDays = Math.round((dateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Mañana'
    if (diffDays === -1) return 'Ayer'
    
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const reservations = agenda?.data?.reservations || []

  // Group by hour for timeline view
  const groupedByHour: Record<string, Reservation[]> = {}
  reservations.forEach(r => {
    const hour = r.start_time.slice(0, 2) + ':00'
    if (!groupedByHour[hour]) groupedByHour[hour] = []
    groupedByHour[hour].push(r)
  })

  const hours = Object.keys(groupedByHour).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Agenda del Día
          </h1>
          <p className="text-sm text-gray-400">Gestiona las reservas programadas</p>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="glass-card p-4 flex items-center justify-between">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <p className="text-lg font-semibold capitalize">{formatDisplayDate(selectedDate)}</p>
          <p className="text-sm text-gray-400">{selectedDate}</p>
        </div>
        
        <button
          onClick={() => changeDate(1)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{agenda?.data?.total_parking || 0}</p>
          <p className="text-sm text-gray-400">Parqueadero</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">{agenda?.data?.total_wash || 0}</p>
          <p className="text-sm text-gray-400">Lavado</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {reservations.filter(r => r.status === 'completado').length}
          </p>
          <p className="text-sm text-gray-400">Completados</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {reservations.filter(r => !['completado', 'cancelado'].includes(r.status)).length}
          </p>
          <p className="text-sm text-gray-400">Pendientes</p>
        </div>
      </div>

      {/* Timeline View */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-lg text-gray-400">No hay reservas para este día</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hours.map((hour) => (
            <div key={hour} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-semibold">{hour}</span>
                <span className="text-sm text-gray-400">
                  ({groupedByHour[hour].length} reserva{groupedByHour[hour].length > 1 ? 's' : ''})
                </span>
              </div>
              
              <div className="grid gap-3 md:grid-cols-2">
                {groupedByHour[hour].map((reservation) => {
                  const status = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.pendiente
                  const VehicleIcon = VEHICLE_ICONS[reservation.vehicle_type] || Car
                  
                  return (
                    <motion.div
                      key={reservation.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border ${
                        reservation.reservation_type === 'parqueadero'
                          ? 'bg-cyan-500/5 border-cyan-500/20'
                          : 'bg-orange-500/5 border-orange-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {reservation.reservation_type === 'parqueadero' 
                            ? <MapPin className="w-5 h-5 text-cyan-400" />
                            : <Droplets className="w-5 h-5 text-orange-400" />
                          }
                          <span className="font-semibold capitalize">
                            {reservation.reservation_type}
                          </span>
                          {reservation.wash_type && (
                            <span className="text-xs text-gray-400">({reservation.wash_type})</span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <VehicleIcon className="w-4 h-4" />
                          {reservation.vehicle_plate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          #{reservation.client_id}
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      {status.next && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatusMutation.mutate({ 
                              id: reservation.id, 
                              status: status.next! 
                            })}
                            disabled={updateStatusMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm transition-all"
                          >
                            {status.next === 'en_progreso' && <Play className="w-4 h-4" />}
                            {status.next === 'completado' && <Check className="w-4 h-4" />}
                            {status.next === 'confirmado' && <Check className="w-4 h-4" />}
                            {status.nextLabel}
                          </button>
                          
                          {reservation.status !== 'en_progreso' && (
                            <button
                              onClick={() => {
                                if (confirm('¿Cancelar esta reserva?')) {
                                  updateStatusMutation.mutate({ 
                                    id: reservation.id, 
                                    status: 'cancelado' 
                                  })
                                }
                              }}
                              disabled={updateStatusMutation.isPending}
                              className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
