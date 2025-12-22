import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Car,
  DollarSign,
  MapPin,
  Droplets,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react'
import { dashboardApi } from '../services/api'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  change?: string
  color: 'cyan' | 'orange' | 'green' | 'purple'
}

function StatCard({ title, value, icon: Icon, change, color }: StatCardProps) {
  const colors = {
    cyan: 'from-primary/20 to-primary/5 border-primary/30 text-primary',
    orange: 'from-accent/20 to-accent/5 border-accent/30 text-accent',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 bg-gradient-to-br ${colors[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-theme-muted text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-theme-primary">{value}</p>
          {change && (
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
    refetchInterval: 10000
  })

  const { data: hourlyStats } = useQuery({
    queryKey: ['hourly-stats'],
    queryFn: () => dashboardApi.getHourlyStats()
  })

  const { data: activity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => dashboardApi.getRecentActivity(),
    refetchInterval: 5000
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-theme-muted">Monitoreo en tiempo real del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Espacios Ocupados"
          value={`${stats?.data?.occupied_spaces || 0}/${stats?.data?.total_spaces || 0}`}
          icon={MapPin}
          color="cyan"
        />
        <StatCard
          title="Vehículos Hoy"
          value={stats?.data?.vehicles_today || 0}
          icon={Car}
          change="+12% vs ayer"
          color="orange"
        />
        <StatCard
          title="En Lavado"
          value={stats?.data?.vehicles_in_wash || 0}
          icon={Droplets}
          color="purple"
        />
        <StatCard
          title="Ingresos Hoy"
          value={formatCurrency(stats?.data?.revenue_today || 0)}
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Actividad por Hora</h3>
              <p className="text-sm text-theme-muted">Entradas y salidas de hoy</p>
            </div>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourlyStats?.data || []}>
              <defs>
                <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="hour"
                stroke="#64748B"
                tickFormatter={(h) => `${h}:00`}
              />
              <YAxis stroke="#64748B" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #22D3EE',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="entries"
                stroke="#22D3EE"
                fill="url(#colorEntries)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Actividad Reciente</h3>
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <div className="space-y-3 max-h-[280px] overflow-auto">
            {(activity?.data || []).slice(0, 10).map((item: { plate: string; type: string; time: string; vehicle_type: string }, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-dark-200/50 border border-primary/10"
              >
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'entry' ? 'status-online' : 'status-offline'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.plate}</p>
                  <p className="text-xs text-theme-muted">
                    {item.type === 'entry' ? 'Entrada' : 'Salida'} • {item.vehicle_type}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(item.time).toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <p className="text-theme-muted text-sm mb-2">Ingresos Semana</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(stats?.data?.revenue_week || 0)}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-theme-muted text-sm mb-2">Ingresos Mes</p>
          <p className="text-2xl font-bold text-accent">
            {formatCurrency(stats?.data?.revenue_month || 0)}
          </p>
        </div>
        <div className="glass-card p-6">
          <p className="text-theme-muted text-sm mb-2">Tasa Ocupación</p>
          <p className="text-2xl font-bold text-green-400">
            {stats?.data?.total_spaces
              ? Math.round((stats.data.occupied_spaces / stats.data.total_spaces) * 100)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  )
}
