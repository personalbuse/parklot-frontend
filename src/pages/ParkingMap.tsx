import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Car, Plus, X, Check } from 'lucide-react'
import { zonesApi, spacesApi, vehiclesApi } from '../services/api'

interface Zone {
  id: number
  name: string
  color: string
  total_spaces: number
  vehicle_type: string
}

interface Space {
  id: number
  zone_id: number
  space_number: string
  status: string
  vehicle_type: string
  position_x: number
  position_y: number
}

export default function ParkingMap() {
  const [selectedZone, setSelectedZone] = useState<number | null>(null)
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [plate, setPlate] = useState('')
  const [vehicleType, setVehicleType] = useState('carro')
  const queryClient = useQueryClient()

  const { data: zones } = useQuery({
    queryKey: ['zones'],
    queryFn: () => zonesApi.getAll()
  })

  const { data: occupancy } = useQuery({
    queryKey: ['occupancy'],
    queryFn: () => zonesApi.getOccupancy(),
    refetchInterval: 5000
  })

  const { data: spaces } = useQuery({
    queryKey: ['spaces', selectedZone],
    queryFn: () => spacesApi.getAll(selectedZone || undefined),
    enabled: !!selectedZone
  })

  const entryMutation = useMutation({
    mutationFn: (data: { plate: string; vehicle_type: string; space_id?: number }) =>
      vehiclesApi.registerEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] })
      queryClient.invalidateQueries({ queryKey: ['occupancy'] })
      setShowEntryModal(false)
      setPlate('')
      setSelectedSpace(null)
    }
  })

  const handleSpaceClick = (space: Space) => {
    if (space.status === 'disponible') {
      setSelectedSpace(space)
      setShowEntryModal(true)
    }
  }

  const handleEntry = () => {
    if (!plate.trim()) return
    entryMutation.mutate({
      plate: plate.toUpperCase(),
      vehicle_type: vehicleType,
      space_id: selectedSpace?.id
    })
  }

  const getSpaceColor = (status: string) => {
    switch (status) {
      case 'ocupado': return 'bg-red-500/60 border-red-500'
      case 'disponible': return 'bg-green-500/60 border-green-500 hover:bg-green-500/80 cursor-pointer'
      case 'reservado': return 'bg-yellow-500/60 border-yellow-500'
      case 'mantenimiento': return 'bg-gray-500/60 border-gray-500'
      default: return 'bg-gray-500/60 border-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Mapa del Parqueadero</h1>
          <p className="text-gray-400">Vista en tiempo real de ocupación</p>
        </div>
        <button
          onClick={() => {
            setSelectedSpace(null)
            setShowEntryModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-500 text-dark-300 font-medium rounded-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Registrar Entrada
        </button>
      </div>

      {/* Zone Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {(occupancy?.data || []).map((zone: { zone_name: string; total: number; occupied: number; available: number; percentage: number }) => (
          <motion.div
            key={zone.zone_name}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              const z = zones?.data?.find((z: Zone) => z.name === zone.zone_name)
              if (z) setSelectedZone(z.id)
            }}
            className={`glass-card p-4 cursor-pointer transition-all ${
              selectedZone === zones?.data?.find((z: Zone) => z.name === zone.zone_name)?.id
                ? 'border-primary neon-cyan'
                : ''
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="font-bold text-primary">{zone.zone_name}</span>
              </div>
              <span className="text-sm text-gray-400">Zona</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">{zone.occupied}</p>
                <p className="text-xs text-gray-500">de {zone.total}</p>
              </div>
              <div className={`text-sm font-medium ${
                zone.percentage > 80 ? 'text-red-400' :
                zone.percentage > 50 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {Math.round(zone.percentage)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Parking Grid */}
      {selectedZone && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Espacios - Zona {zones?.data?.find((z: Zone) => z.id === selectedZone)?.name}
            </h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/60 border border-green-500"></div>
                <span className="text-gray-400">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500/60 border border-red-500"></div>
                <span className="text-gray-400">Ocupado</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {(spaces?.data || []).map((space: Space) => (
              <motion.div
                key={space.id}
                whileHover={{ scale: space.status === 'disponible' ? 1.1 : 1 }}
                onClick={() => handleSpaceClick(space)}
                className={`aspect-[3/4] rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all ${getSpaceColor(space.status)}`}
              >
                <Car className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{space.space_number}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!selectedZone && (
        <div className="glass-card p-12 text-center">
          <Car className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">Selecciona una zona</h3>
          <p className="text-sm text-gray-500">Haz clic en una zona para ver sus espacios</p>
        </div>
      )}

      {/* Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Registrar Entrada</h3>
              <button
                onClick={() => {
                  setShowEntryModal(false)
                  setSelectedSpace(null)
                }}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedSpace && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm text-primary">
                    Espacio seleccionado: <strong>{selectedSpace.space_number}</strong>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Placa del Vehículo
                </label>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 bg-dark-200 border border-primary/20 rounded-xl focus:outline-none focus:border-primary text-white uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Vehículo
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['carro', 'moto', 'cicla'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setVehicleType(type)}
                      className={`p-3 rounded-xl border transition-all capitalize ${
                        vehicleType === type
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-gray-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleEntry}
                disabled={!plate.trim() || entryMutation.isPending}
                className="w-full py-3 bg-primary hover:bg-primary-500 disabled:bg-primary/50 text-dark-300 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Confirmar Entrada
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
