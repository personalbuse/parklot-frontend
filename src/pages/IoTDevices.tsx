import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Cpu,
  Camera,
  Radio,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff
} from 'lucide-react'
import { iotApi } from '../services/api'

interface IoTDevice {
  id: number
  device_id: string
  device_type: string
  name: string
  location: string
  status: string
  last_ping: string
}

export default function IoTDevices() {
  const { data: devices } = useQuery({
    queryKey: ['iot-devices'],
    queryFn: () => iotApi.getAll(),
    refetchInterval: 10000
  })

  const { data: status } = useQuery({
    queryKey: ['iot-status'],
    queryFn: () => iotApi.getStatus(),
    refetchInterval: 10000
  })

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'camera': return Camera
      case 'sensor': return Radio
      case 'barrier': return Cpu
      default: return Cpu
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'offline': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'error': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Dispositivos IoT</h1>
        <p className="text-gray-400">Monitoreo de sensores y dispositivos conectados</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-5 h-5 text-primary" />
            <span className="text-gray-400">Total</span>
          </div>
          <p className="text-3xl font-bold">{status?.data?.total || 0}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-gray-400">En línea</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{status?.data?.online || 0}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-gray-400">Fuera de línea</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{status?.data?.offline || 0}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-400">Con errores</span>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{status?.data?.error || 0}</p>
        </div>
      </div>

      {/* Device Types Summary */}
      {status?.data?.by_type && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Estado por Tipo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(status.data.by_type).map(([type, data]: [string, unknown]) => {
              const deviceData = data as { total: number; online: number }
              const Icon = getDeviceIcon(type)
              const percentage = deviceData.total > 0 
                ? Math.round((deviceData.online / deviceData.total) * 100) 
                : 0
              
              return (
                <div key={type} className="p-4 bg-dark-200/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                    <span className="font-medium capitalize">{type}s</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">{deviceData.online}/{deviceData.total}</p>
                      <p className="text-xs text-gray-500">dispositivos activos</p>
                    </div>
                    <div className={`text-sm font-medium ${
                      percentage === 100 ? 'text-green-400' :
                      percentage >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {percentage}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Devices List */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Todos los Dispositivos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(devices?.data || []).map((device: IoTDevice) => {
            const Icon = getDeviceIcon(device.device_type)
            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border ${getStatusColor(device.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-dark-200 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{device.name || device.device_id}</p>
                      <p className="text-xs text-gray-500 capitalize">{device.device_type}</p>
                    </div>
                  </div>
                  {device.status === 'online' ? (
                    <Wifi className="w-5 h-5 text-green-400" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-400" />
                  )}
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ubicación</span>
                    <span className="text-gray-300">{device.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Último ping</span>
                    <span className="text-gray-300">
                      {new Date(device.last_ping).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      device.status === 'online' ? 'status-online animate-pulse' :
                      device.status === 'error' ? 'status-warning' : 'status-offline'
                    }`} />
                    <span className={`text-xs capitalize ${
                      device.status === 'online' ? 'text-green-400' :
                      device.status === 'error' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {device.status === 'online' ? 'En línea' :
                       device.status === 'error' ? 'Error' : 'Desconectado'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {(!devices?.data || devices.data.length === 0) && (
          <div className="text-center py-12">
            <Cpu className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay dispositivos registrados</p>
            <p className="text-sm text-gray-500">Los dispositivos IoT aparecerán aquí cuando se conecten</p>
          </div>
        )}
      </div>
    </div>
  )
}
