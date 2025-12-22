import { forwardRef, useRef } from 'react'
import { X, Printer, Eye, Download } from 'lucide-react'
import { motion } from 'framer-motion'

export interface ReceiptData {
  receiptNumber: string
  plate: string
  vehicleType: string
  serviceType: 'parking' | 'wash' | 'both'
  washType?: string
  entryTime: string
  exitTime?: string
  duration?: string
  parkingAmount?: number
  washAmount?: number
  totalAmount: number
  paymentMethod: string
  date: string
}

// Parking business info
const BUSINESS_INFO = {
  name: 'PARQUEADERO PARKIOT',
  nit: '900.123.456-7',
  address: 'Calle 123 #45-67, Local 101',
  city: 'Bogotá, Colombia',
  phone: '(601) 234-5678',
  cell: '310 123 4567'
}

const DISCLAIMER = `
TÉRMINOS Y CONDICIONES:
• El parqueadero no se hace responsable por daños o hurtos que ocurran fuera de las instalaciones.
• No se permite ningún reclamo ni devolución una vez el vehículo haya salido.
• El usuario acepta haber verificado el estado de su vehículo antes de retirarlo.
• Este comprobante es válido únicamente como constancia de pago.
• El establecimiento no se responsabiliza por objetos dejados en el interior del vehículo.
`.trim()

// Receipt content component (for printing)
export const ReceiptContent = forwardRef<HTMLDivElement, { data: ReceiptData }>(
  ({ data }, ref) => {
    const formatCurrency = (value: number) =>
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(value)

    const getServiceLabel = () => {
      if (data.serviceType === 'parking') return 'Parqueadero'
      if (data.serviceType === 'wash') return `Lavado ${data.washType || ''}`
      return 'Parqueadero + Lavado'
    }

    return (
      <div
        ref={ref}
        className="bg-white text-black p-6 max-w-[320px] mx-auto font-mono text-xs"
        style={{ fontFamily: 'monospace' }}
      >
        {/* Header */}
        <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
          <h1 className="text-lg font-bold">{BUSINESS_INFO.name}</h1>
          <p className="text-[10px] mt-1">NIT: {BUSINESS_INFO.nit}</p>
          <p className="text-[10px]">{BUSINESS_INFO.address}</p>
          <p className="text-[10px]">{BUSINESS_INFO.city}</p>
          <p className="text-[10px]">Tel: {BUSINESS_INFO.phone} | Cel: {BUSINESS_INFO.cell}</p>
        </div>

        {/* Receipt Number */}
        <div className="text-center mb-4">
          <p className="text-sm font-bold">COMPROBANTE DE PAGO</p>
          <p className="text-lg font-bold">No. {data.receiptNumber}</p>
          <p className="text-[10px] text-gray-600">{data.date}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-400 my-3"></div>

        {/* Vehicle Info */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between">
            <span>PLACA:</span>
            <span className="font-bold text-sm">{data.plate}</span>
          </div>
          <div className="flex justify-between">
            <span>TIPO VEHÍCULO:</span>
            <span className="capitalize">{data.vehicleType}</span>
          </div>
          <div className="flex justify-between">
            <span>SERVICIO:</span>
            <span className="capitalize">{getServiceLabel()}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-400 my-3"></div>

        {/* Time Info */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between">
            <span>ENTRADA:</span>
            <span>{new Date(data.entryTime).toLocaleString('es-CO', {
              day: '2-digit', month: '2-digit', year: '2-digit',
              hour: '2-digit', minute: '2-digit'
            })}</span>
          </div>
          {data.exitTime && (
            <div className="flex justify-between">
              <span>SALIDA:</span>
              <span>{new Date(data.exitTime).toLocaleString('es-CO', {
                day: '2-digit', month: '2-digit', year: '2-digit',
                hour: '2-digit', minute: '2-digit'
              })}</span>
            </div>
          )}
          {data.duration && (
            <div className="flex justify-between">
              <span>TIEMPO:</span>
              <span className="font-bold">{data.duration}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-400 my-3"></div>

        {/* Amounts */}
        <div className="space-y-1 mb-4">
          {data.parkingAmount !== undefined && data.parkingAmount > 0 && (
            <div className="flex justify-between">
              <span>Parqueadero:</span>
              <span>{formatCurrency(data.parkingAmount)}</span>
            </div>
          )}
          {data.washAmount !== undefined && data.washAmount > 0 && (
            <div className="flex justify-between">
              <span>Lavado:</span>
              <span>{formatCurrency(data.washAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2 mt-2">
            <span>TOTAL:</span>
            <span>{formatCurrency(data.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>MÉTODO:</span>
            <span className="uppercase">{data.paymentMethod}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-dashed border-gray-400 my-4"></div>

        {/* Disclaimer */}
        <div className="text-[8px] text-gray-600 leading-tight whitespace-pre-line">
          {DISCLAIMER}
        </div>

        {/* Footer */}
        <div className="text-center mt-4 pt-3 border-t border-dashed border-gray-400">
          <p className="text-[10px]">¡Gracias por su visita!</p>
          <p className="text-[8px] text-gray-500 mt-1">Sistema ParkIoT v1.0</p>
        </div>
      </div>
    )
  }
)

ReceiptContent.displayName = 'ReceiptContent'

// Receipt Modal
interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  data: ReceiptData
}

export function ReceiptModal({ isOpen, onClose, data }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return

    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo ${data.receiptNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; }
            .receipt { max-width: 320px; margin: 0 auto; padding: 20px; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .border-dashed { border-style: dashed; }
            .flex { display: flex; justify-content: space-between; }
            .mb-4 { margin-bottom: 16px; }
            .mt-4 { margin-top: 16px; }
            .py-2 { padding: 8px 0; }
            .text-lg { font-size: 16px; }
            .text-sm { font-size: 14px; }
            .text-xs { font-size: 10px; }
            .capitalize { text-transform: capitalize; }
            .uppercase { text-transform: uppercase; }
            .border-t { border-top: 1px dashed #999; }
            .border-b { border-bottom: 1px dashed #999; }
            .space-y > *:not(:first-child) { margin-top: 4px; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-card w-full max-w-lg max-h-[90vh] overflow-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-dark-200/95 backdrop-blur p-4 border-b border-primary/20 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Comprobante de Pago
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="p-4 bg-gray-100">
          <ReceiptContent ref={printRef} data={data} />
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-dark-200/95 backdrop-blur p-4 border-t border-primary/20 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-600 text-theme-secondary rounded-xl hover:bg-white/5 font-medium"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-primary hover:bg-primary-500 text-dark-300 font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Imprimir
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Helper to generate receipt number
export function generateReceiptNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `${year}${month}${day}-${random}`
}
