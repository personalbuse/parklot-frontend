import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Settings,
  Grid3X3,
  Car,
  Bike,
  CircleDot,
  Trash2,
  Check,
  X,
  Sparkles,
  Wand2,
  FileText,
  Download,
  Calendar
} from 'lucide-react'
import { zonesApi, spacesApi, dashboardApi } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import jsPDF from 'jspdf'

interface Zone {
  id: number
  name: string
  description: string
  color: string
  total_spaces: number
  vehicle_type: string
  is_active: boolean
}

const VEHICLE_TYPES = [
  { value: 'carro', label: 'Carros', icon: Car, color: '#22D3EE' },
  { value: 'moto', label: 'Motos', icon: Bike, color: '#F97316' },
  { value: 'cicla', label: 'Bicicletas', icon: CircleDot, color: '#10B981' }
]

const ZONE_COLORS = [
  '#22D3EE', '#F97316', '#10B981', '#8B5CF6', 
  '#EC4899', '#EAB308', '#EF4444', '#3B82F6'
]

export default function AdminConfig() {
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [newZone, setNewZone] = useState({
    name: '',
    description: '',
    vehicle_type: 'carro',
    color: '#22D3EE',
    spaces_count: 10
  })
  const zonesGridRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [showReport, setShowReport] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [reportLoading, setReportLoading] = useState(false)

  const { data: zones, isLoading } = useQuery({
    queryKey: ['zones'],
    queryFn: () => zonesApi.getAll()
  })

  const createZoneMutation = useMutation({
    mutationFn: async (data: typeof newZone) => {
      // First create the zone
      const zoneResponse = await zonesApi.create({
        name: data.name,
        description: data.description,
        vehicle_type: data.vehicle_type,
        color: data.color
      })
      // Then create spaces in bulk
      if (data.spaces_count > 0) {
        await spacesApi.createBulk(zoneResponse.data.id, data.spaces_count)
      }
      return zoneResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] })
      queryClient.invalidateQueries({ queryKey: ['occupancy'] })
      setShowWizard(false)
      setWizardStep(1)
      setNewZone({
        name: '',
        description: '',
        vehicle_type: 'carro',
        color: '#22D3EE',
        spaces_count: 10
      })
    }
  })

  const deleteZoneMutation = useMutation({
    mutationFn: (id: number) => zonesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zones'] })
    }
  })

  const handleCreateZone = () => {
    if (!newZone.name.trim()) return
    createZoneMutation.mutate(newZone)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

  const generateDailyReport = async () => {
    setReportLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await dashboardApi.getDailyReport(today)
      setReportData(res.data)
      setShowReport(true)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setReportLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!reportData) return
    
    const doc = new jsPDF()
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '')
    const filename = `reporte_${dateStr}_${timeStr}.pdf`
    
    // Header
    doc.setFontSize(20)
    doc.setTextColor(0, 217, 255)
    doc.text('PARQUEADERO PARKIOT', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(`Reporte del día: ${reportData.date}`, 105, 28, { align: 'center' })
    doc.text(`Generado: ${now.toLocaleString('es-CO')}`, 105, 34, { align: 'center' })
    
    // Summary boxes
    let y = 50
    doc.setFillColor(240, 240, 240)
    doc.roundedRect(20, y, 50, 25, 3, 3, 'F')
    doc.roundedRect(80, y, 50, 25, 3, 3, 'F')
    doc.roundedRect(140, y, 50, 25, 3, 3, 'F')
    
    doc.setFontSize(18)
    doc.setTextColor(0, 217, 255)
    doc.text(String(reportData.summary?.total_entries || 0), 45, y + 12, { align: 'center' })
    doc.text(String(reportData.summary?.total_exits || 0), 105, y + 12, { align: 'center' })
    doc.text(String(reportData.summary?.total_washes || 0), 165, y + 12, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Entradas', 45, y + 20, { align: 'center' })
    doc.text('Salidas', 105, y + 20, { align: 'center' })
    doc.text('Lavados', 165, y + 20, { align: 'center' })
    
    // Revenue section
    y = 90
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Ingresos del Día', 20, y)
    doc.setDrawColor(0, 217, 255)
    doc.line(20, y + 2, 190, y + 2)
    
    y += 15
    doc.setFontSize(11)
    doc.text('Parqueadero:', 25, y)
    doc.text(`$${(reportData.revenue?.parking || 0).toLocaleString('es-CO')}`, 180, y, { align: 'right' })
    
    y += 8
    doc.text('Lavadero:', 25, y)
    doc.text(`$${(reportData.revenue?.wash || 0).toLocaleString('es-CO')}`, 180, y, { align: 'right' })
    
    y += 10
    doc.setFillColor(232, 245, 233)
    doc.rect(20, y - 5, 170, 10, 'F')
    doc.setFontSize(12)
    doc.setTextColor(16, 185, 129)
    doc.text('TOTAL:', 25, y + 2)
    doc.text(`$${(reportData.revenue?.total || 0).toLocaleString('es-CO')}`, 180, y + 2, { align: 'right' })
    
    // Vehicle types
    y += 25
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Entradas por Tipo de Vehículo', 20, y)
    doc.setDrawColor(0, 217, 255)
    doc.line(20, y + 2, 190, y + 2)
    
    y += 12
    doc.setFontSize(11)
    doc.text('Carros:', 25, y)
    doc.text(String(reportData.entries_by_vehicle_type?.carro || 0), 180, y, { align: 'right' })
    y += 7
    doc.text('Motos:', 25, y)
    doc.text(String(reportData.entries_by_vehicle_type?.moto || 0), 180, y, { align: 'right' })
    y += 7
    doc.text('Bicicletas:', 25, y)
    doc.text(String(reportData.entries_by_vehicle_type?.cicla || 0), 180, y, { align: 'right' })
    
    // Wash types
    y += 20
    doc.setFontSize(14)
    doc.text('Lavados por Tipo', 20, y)
    doc.setDrawColor(0, 217, 255)
    doc.line(20, y + 2, 190, y + 2)
    
    y += 12
    doc.setFontSize(11)
    doc.text('Simple:', 25, y)
    doc.text(String(reportData.washes_by_type?.simple || 0), 180, y, { align: 'right' })
    y += 7
    doc.text('Completo:', 25, y)
    doc.text(String(reportData.washes_by_type?.completo || 0), 180, y, { align: 'right' })
    
    // Footer
    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text('ParkIoT - Sistema de Gestión de Parqueadero', 105, 280, { align: 'center' })
    
    // Save PDF
    doc.save(filename)
  }

  const isAdmin = user?.role === 'admin'

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-400">Acceso Restringido</h2>
          <p className="text-gray-500">Solo administradores pueden configurar el parqueadero</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-primary animate-pulse" />
            Configuración del Parqueadero
          </h1>
          <p className="text-gray-400">Crea y administra las zonas de estacionamiento</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateDailyReport}
            disabled={reportLoading}
            className="flex items-center gap-2 px-4 py-3 bg-green-500/20 text-green-500 font-semibold rounded-xl hover:bg-green-500/30 transition-all"
          >
            {reportLoading ? (
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            Reporte del Día
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-dark-300 font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all"
          >
            <Wand2 className="w-5 h-5" />
            Crear Nueva Zona
          </motion.button>
        </div>
      </div>

      {/* Daily Report Modal */}
      <AnimatePresence>
        {showReport && reportData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Reporte del Día - {reportData.date}
                </h3>
                <button
                  onClick={() => setShowReport(false)}
                  className="p-2 hover:bg-white/5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-theme-secondary p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-primary">{reportData.summary?.total_entries || 0}</div>
                  <div className="text-sm text-theme-muted">Entradas</div>
                </div>
                <div className="bg-theme-secondary p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-orange-400">{reportData.summary?.total_exits || 0}</div>
                  <div className="text-sm text-theme-muted">Salidas</div>
                </div>
                <div className="bg-theme-secondary p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-cyan-400">{reportData.summary?.total_washes || 0}</div>
                  <div className="text-sm text-theme-muted">Lavados</div>
                </div>
              </div>

              {/* Revenue Section */}
              <div className="bg-theme-secondary p-4 rounded-xl mb-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  💰 Ingresos del Día
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-theme-muted">Parqueadero</span>
                    <span className="font-medium">{formatPrice(reportData.revenue?.parking || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-theme-muted">Lavadero</span>
                    <span className="font-medium">{formatPrice(reportData.revenue?.wash || 0)}</span>
                  </div>
                  <div className="border-t border-primary/20 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">TOTAL</span>
                      <span className="text-xl font-bold text-green-500">{formatPrice(reportData.revenue?.total || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Types */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-theme-secondary p-4 rounded-xl">
                  <h4 className="font-semibold mb-3">🚗 Por Tipo de Vehículo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Carros</span>
                      <span className="font-medium">{reportData.entries_by_vehicle_type?.carro || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Motos</span>
                      <span className="font-medium">{reportData.entries_by_vehicle_type?.moto || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bicicletas</span>
                      <span className="font-medium">{reportData.entries_by_vehicle_type?.cicla || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-theme-secondary p-4 rounded-xl">
                  <h4 className="font-semibold mb-3">🧽 Lavados por Tipo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Simple</span>
                      <span className="font-medium">{reportData.washes_by_type?.simple || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completo</span>
                      <span className="font-medium">{reportData.washes_by_type?.completo || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReport(false)}
                  className="flex-1 py-3 border border-gray-600 text-theme-secondary rounded-xl hover:bg-white/5"
                >
                  Cerrar
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex-1 py-3 bg-primary hover:bg-primary/80 text-dark-300 font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Descargar PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zones Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : zones?.data?.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Grid3X3 className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            ¡Tu parqueadero está vacío!
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza creando tu primera zona de estacionamiento
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowWizard(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-600 text-dark-300 font-bold rounded-xl text-lg shadow-lg shadow-primary/40"
          >
            <Plus className="w-6 h-6" />
            Crear Primera Zona
          </motion.button>
        </motion.div>
      ) : (
        <div ref={zonesGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(zones?.data || []).map((zone: Zone) => {
            const vehicleType = VEHICLE_TYPES.find(v => v.value === zone.vehicle_type)
            const VehicleIcon = vehicleType?.icon || Car
            
            return (
              <motion.div
                key={zone.id}
                className="zone-card glass-card overflow-hidden group"
                whileHover={{ y: -5 }}
              >
                {/* Color bar */}
                <div 
                  className="h-2 w-full"
                  style={{ backgroundColor: zone.color }}
                />
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${zone.color}20` }}
                      >
                        <span 
                          className="text-2xl font-bold"
                          style={{ color: zone.color }}
                        >
                          {zone.name}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Zona {zone.name}</h3>
                        <p className="text-sm text-gray-400">{zone.description || 'Sin descripción'}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar esta zona?')) {
                          deleteZoneMutation.mutate(zone.id)
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-200 rounded-lg">
                      <VehicleIcon className="w-4 h-4" style={{ color: vehicleType?.color }} />
                      <span className="text-sm capitalize">{zone.vehicle_type}s</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-200 rounded-lg">
                      <Grid3X3 className="w-4 h-4 text-primary" />
                      <span className="text-sm">{zone.total_spaces} espacios</span>
                    </div>
                  </div>

                  {/* Visual parking grid preview */}
                  <div className="grid grid-cols-10 gap-1 mt-4">
                    {Array.from({ length: Math.min(zone.total_spaces, 20) }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="aspect-square rounded"
                        style={{ 
                          backgroundColor: `${zone.color}40`,
                          border: `1px solid ${zone.color}60`
                        }}
                      />
                    ))}
                    {zone.total_spaces > 20 && (
                      <div className="col-span-10 text-center text-xs text-gray-500 mt-1">
                        +{zone.total_spaces - 20} más
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Creation Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-card w-full max-w-2xl overflow-hidden"
            >
              {/* Progress bar */}
              <div className="h-1 bg-dark-200">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: '33%' }}
                  animate={{ width: `${(wizardStep / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Header */}
              <div className="p-6 border-b border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Wand2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Crear Nueva Zona</h2>
                      <p className="text-sm text-gray-400">Paso {wizardStep} de 3</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowWizard(false)
                      setWizardStep(1)
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 wizard-step-content">
                {wizardStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">1</span>
                      Información Básica
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre de la Zona
                      </label>
                      <input
                        type="text"
                        value={newZone.name}
                        onChange={(e) => setNewZone({ ...newZone, name: e.target.value.toUpperCase() })}
                        placeholder="Ej: A, B, VIP, MOTOS..."
                        maxLength={10}
                        className="w-full px-4 py-3 bg-dark-200 border border-primary/20 rounded-xl focus:outline-none focus:border-primary text-white text-lg uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Descripción (opcional)
                      </label>
                      <input
                        type="text"
                        value={newZone.description}
                        onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                        placeholder="Ej: Zona principal para carros"
                        className="w-full px-4 py-3 bg-dark-200 border border-primary/20 rounded-xl focus:outline-none focus:border-primary text-white"
                      />
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">2</span>
                      Tipo de Vehículo y Color
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        ¿Qué vehículos estacionarán aquí?
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {VEHICLE_TYPES.map((type) => {
                          const Icon = type.icon
                          const isSelected = newZone.vehicle_type === type.value
                          return (
                            <motion.button
                              key={type.value}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setNewZone({ ...newZone, vehicle_type: type.value, color: type.color })}
                              className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                                isSelected
                                  ? 'border-primary bg-primary/10'
                                  : 'border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              <Icon 
                                className="w-10 h-10 transition-colors" 
                                style={{ color: isSelected ? type.color : '#9CA3AF' }}
                              />
                              <span className={isSelected ? 'text-white font-medium' : 'text-gray-400'}>
                                {type.label}
                              </span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Color de la zona
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {ZONE_COLORS.map((color) => (
                          <motion.button
                            key={color}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setNewZone({ ...newZone, color })}
                            className={`w-10 h-10 rounded-xl transition-all ${
                              newZone.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-300' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">3</span>
                      Cantidad de Espacios
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        ¿Cuántos espacios tendrá esta zona?
                      </label>
                      
                      <div className="flex items-center gap-6 mb-6">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setNewZone({ ...newZone, spaces_count: Math.max(1, newZone.spaces_count - 5) })}
                          className="w-14 h-14 rounded-xl bg-dark-200 hover:bg-dark-100 text-2xl font-bold transition-colors"
                        >
                          -
                        </motion.button>
                        <div className="flex-1 text-center">
                          <input
                            type="number"
                            value={newZone.spaces_count}
                            onChange={(e) => setNewZone({ ...newZone, spaces_count: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="w-32 text-center text-4xl font-bold bg-transparent border-none outline-none text-primary"
                          />
                          <p className="text-gray-400 text-sm mt-1">espacios</p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setNewZone({ ...newZone, spaces_count: newZone.spaces_count + 5 })}
                          className="w-14 h-14 rounded-xl bg-dark-200 hover:bg-dark-100 text-2xl font-bold transition-colors"
                        >
                          +
                        </motion.button>
                      </div>

                      {/* Preview grid */}
                      <div className="p-4 bg-dark-200/50 rounded-xl">
                        <p className="text-sm text-gray-400 mb-3">Vista previa:</p>
                        <div className="grid grid-cols-10 gap-1">
                          {Array.from({ length: Math.min(newZone.spaces_count, 50) }).map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.01 }}
                              className="aspect-square rounded"
                              style={{ 
                                backgroundColor: `${newZone.color}40`,
                                border: `1px solid ${newZone.color}60`
                              }}
                            />
                          ))}
                        </div>
                        {newZone.spaces_count > 50 && (
                          <p className="text-center text-xs text-gray-500 mt-2">
                            +{newZone.spaces_count - 50} espacios más
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                      <h4 className="font-medium text-primary mb-2">Resumen de la zona:</h4>
                      <ul className="text-sm space-y-1 text-gray-300">
                        <li>📍 Nombre: <strong>Zona {newZone.name || '?'}</strong></li>
                        <li>🚗 Tipo: <strong className="capitalize">{newZone.vehicle_type}s</strong></li>
                        <li>🎨 Color: <span className="inline-block w-4 h-4 rounded align-middle ml-1" style={{ backgroundColor: newZone.color }} /></li>
                        <li>📐 Espacios: <strong>{newZone.spaces_count}</strong></li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-primary/20 flex justify-between">
                <button
                  onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
                  disabled={wizardStep === 1}
                  className="px-6 py-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                >
                  Atrás
                </button>

                {wizardStep < 3 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setWizardStep(wizardStep + 1)}
                    disabled={wizardStep === 1 && !newZone.name.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-500 disabled:bg-primary/50 text-dark-300 font-medium rounded-xl transition-all"
                  >
                    Siguiente
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateZone}
                    disabled={createZoneMutation.isPending}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-accent text-dark-300 font-bold rounded-xl shadow-lg transition-all"
                  >
                    <Check className="w-5 h-5" />
                    {createZoneMutation.isPending ? 'Creando...' : 'Crear Zona'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
