import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  Car,
  Bike,
  CircleDot,
  Clock,
  Calendar,
  CalendarDays,
  CalendarRange,
  Timer,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Sparkles
} from 'lucide-react'
import { tariffsApi } from '../services/api'
import { useAuthStore } from '../stores/authStore'

interface Tariff {
  id: number
  name: string
  vehicle_type: string
  service_type: string
  price: number
  time_unit_minutes: number
  is_active: boolean
}

const VEHICLE_TYPES = [
  { value: 'carro', label: 'Carros', icon: Car, color: '#22D3EE' },
  { value: 'moto', label: 'Motos', icon: Bike, color: '#F97316' },
  { value: 'cicla', label: 'Bicicletas', icon: CircleDot, color: '#10B981' }
]

const SERVICE_TYPES = [
  { value: 'fraccion', label: 'Fracción', icon: Timer, description: 'Por fracción de tiempo' },
  { value: 'hora', label: 'Hora', icon: Clock, description: 'Tarifa por hora' },
  { value: 'dia', label: 'Día', icon: Calendar, description: 'Tarifa diaria' },
  { value: 'semana', label: 'Semana', icon: CalendarDays, description: 'Tarifa semanal' },
  { value: 'mes', label: 'Mes', icon: CalendarRange, description: 'Mensualidad' }
]

export default function Tariffs() {
  const [showModal, setShowModal] = useState(false)
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState('carro')
  const [formData, setFormData] = useState({
    name: '',
    vehicle_type: 'carro',
    service_type: 'hora',
    price: 5000,
    time_unit_minutes: 60
  })
  
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const { data: tariffs, isLoading } = useQuery({
    queryKey: ['tariffs'],
    queryFn: () => tariffsApi.getAll()
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => tariffsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] })
      closeModal()
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<typeof formData> }) => 
      tariffsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] })
      closeModal()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tariffsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] })
    }
  })

  const seedMutation = useMutation({
    mutationFn: () => tariffsApi.seedDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] })
    }
  })

  const closeModal = () => {
    setShowModal(false)
    setEditingTariff(null)
    setFormData({
      name: '',
      vehicle_type: 'carro',
      service_type: 'hora',
      price: 5000,
      time_unit_minutes: 60
    })
  }

  const openEditModal = (tariff: Tariff) => {
    setEditingTariff(tariff)
    setFormData({
      name: tariff.name,
      vehicle_type: tariff.vehicle_type,
      service_type: tariff.service_type,
      price: tariff.price,
      time_unit_minutes: tariff.time_unit_minutes
    })
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (!formData.name.trim() || formData.price <= 0) return

    if (editingTariff) {
      updateMutation.mutate({ id: editingTariff.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const filteredTariffs = (tariffs?.data || []).filter(
    (t: Tariff) => t.vehicle_type === selectedVehicle
  )

  const isAdmin = user?.role === 'admin'

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-400">Acceso Restringido</h2>
          <p className="text-gray-500">Solo administradores pueden configurar tarifas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            Configuración de Tarifas
          </h1>
          <p className="text-sm text-gray-400">Gestiona los precios por tipo de vehículo y tiempo</p>
        </div>
        <div className="flex gap-2">
          {(!tariffs?.data || tariffs.data.length === 0) && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent border border-accent/30 rounded-xl text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              {seedMutation.isPending ? 'Creando...' : 'Cargar Predeterminadas'}
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-dark-300 rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nueva Tarifa
          </motion.button>
        </div>
      </div>

      {/* Vehicle Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {VEHICLE_TYPES.map((type) => {
          const Icon = type.icon
          const isSelected = selectedVehicle === type.value
          const count = (tariffs?.data || []).filter((t: Tariff) => t.vehicle_type === type.value).length

          return (
            <button
              key={type.value}
              onClick={() => setSelectedVehicle(type.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-dark-200/50 text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" style={{ color: isSelected ? type.color : undefined }} />
              <span className="font-medium">{type.label}</span>
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isSelected ? 'bg-primary/30' : 'bg-gray-700'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tariffs Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTariffs.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No hay tarifas para {VEHICLE_TYPES.find(t => t.value === selectedVehicle)?.label}</p>
          <p className="text-sm text-gray-500">Crea una nueva tarifa o carga las predeterminadas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {filteredTariffs.map((tariff: Tariff) => {
            const serviceType = SERVICE_TYPES.find(s => s.value === tariff.service_type)
            const ServiceIcon = serviceType?.icon || Clock
            const vehicleType = VEHICLE_TYPES.find(v => v.value === tariff.vehicle_type)

            return (
              <motion.div
                key={tariff.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${vehicleType?.color}20` }}
                  >
                    <ServiceIcon className="w-5 h-5" style={{ color: vehicleType?.color }} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(tariff)}
                      className="p-1.5 hover:bg-white/10 rounded-lg"
                    >
                      <Pencil className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar esta tarifa?')) {
                          deleteMutation.mutate(tariff.id)
                        }
                      }}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-base mb-1">{tariff.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{serviceType?.description}</p>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      ${tariff.price.toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-gray-500">
                      cada {tariff.time_unit_minutes} min
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingTariff ? 'Editar Tarifa' : 'Nueva Tarifa'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Hora, Día completo, Mensualidad..."
                    className="w-full px-4 py-2.5 bg-dark-200 border border-primary/20 rounded-xl focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo Vehículo
                    </label>
                    <select
                      value={formData.vehicle_type}
                      onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                      className="w-full px-4 py-2.5 bg-dark-200 border border-primary/20 rounded-xl focus:border-primary outline-none"
                    >
                      {VEHICLE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo Servicio
                    </label>
                    <select
                      value={formData.service_type}
                      onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                      className="w-full px-4 py-2.5 bg-dark-200 border border-primary/20 rounded-xl focus:border-primary outline-none"
                    >
                      {SERVICE_TYPES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Precio (COP)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      min={0}
                      step={100}
                      className="w-full px-4 py-2.5 bg-dark-200 border border-primary/20 rounded-xl focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minutos
                    </label>
                    <input
                      type="number"
                      value={formData.time_unit_minutes}
                      onChange={(e) => setFormData({ ...formData, time_unit_minutes: Number(e.target.value) })}
                      min={1}
                      className="w-full px-4 py-2.5 bg-dark-200 border border-primary/20 rounded-xl focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full py-3 bg-primary hover:bg-primary-500 disabled:bg-primary/50 text-dark-300 font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editingTariff ? 'Guardar Cambios' : 'Crear Tarifa'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
