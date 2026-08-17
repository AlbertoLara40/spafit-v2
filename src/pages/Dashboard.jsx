import { useEffect, useState } from 'react'
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  UserX,
  DollarSign,
  Activity
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import StatsCard from '../components/StatsCard'
import { useMembers } from '../hooks/useMembers'
import { usePayments } from '../hooks/usePayments'
import { formatCurrency, formatDate, getPaymentMethodLabel } from '../utils/helpers'

export default function Dashboard() {
  const { 
    members, 
    loading: membersLoading, 
    totalMembers, 
    activeMembers, 
    expiringMembers, 
    expiredMembers,
    fetchMembers 
  } = useMembers()

  const { 
    payments, 
    loading: paymentsLoading,
    getTotalIncome,
    getIncomeByMonth,
    getRecentPayments,
    fetchPayments
  } = usePayments()

  const [incomeData, setIncomeData] = useState([])
  const [recentPayments, setRecentPayments] = useState([])

  useEffect(() => {
    fetchMembers()
    fetchPayments()
  }, [])

  useEffect(() => {
    setIncomeData(getIncomeByMonth())
    setRecentPayments(getRecentPayments(5))
  }, [payments])

  const weeklyIncome = getTotalIncome('week')
  const monthlyIncome = getTotalIncome('month')
  const yearlyIncome = getTotalIncome('year')

  const chartColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  if (membersLoading || paymentsLoading) {
    return (
      <div className="page-container flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="page-title flex items-center gap-3">
        <Activity className="w-8 h-8 text-accent" />
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Miembros"
          value={totalMembers}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Miembros Activos"
          value={activeMembers}
          icon={UserCheck}
          color="green"
        />
        <StatsCard
          title="Por Vencer"
          value={expiringMembers}
          icon={AlertTriangle}
          color="amber"
        />
        <StatsCard
          title="Vencidos"
          value={expiredMembers}
          icon={UserX}
          color="red"
        />
      </div>

      {/* Income Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Ingresos Semana"
          value={formatCurrency(weeklyIncome)}
          icon={DollarSign}
          color="purple"
          subtitle="Últimos 7 días"
        />
        <StatsCard
          title="Ingresos Mes"
          value={formatCurrency(monthlyIncome)}
          icon={DollarSign}
          color="purple"
          subtitle="Mes actual"
        />
        <StatsCard
          title="Ingresos Año"
          value={formatCurrency(yearlyIncome)}
          icon={DollarSign}
          color="purple"
          subtitle="Año actual"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Ingresos por Mes</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickFormatter={(value) => {
                    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
                    return months[parseInt(value) - 1] || value
                  }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Ingresos']}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {incomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Últimos Pagos</h3>
          {recentPayments.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No hay pagos registrados</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {recentPayments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-3 bg-dark-900 rounded-lg border border-dark-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {payment.members?.name} {payment.members?.last_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getPaymentMethodLabel(payment.method)} • {formatDate(payment.payment_date)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-400 ml-4">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Members by Status */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Estado de Miembros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-medium">Activos</span>
              <span className="text-2xl font-bold text-green-400">{activeMembers}</span>
            </div>
            <div className="mt-2 w-full bg-dark-900 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-medium">Por Vencer</span>
              <span className="text-2xl font-bold text-amber-400">{expiringMembers}</span>
            </div>
            <div className="mt-2 w-full bg-dark-900 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${totalMembers > 0 ? (expiringMembers / totalMembers) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center justify-between">
              <span className="text-red-400 font-medium">Vencidos</span>
              <span className="text-2xl font-bold text-red-400">{expiredMembers}</span>
            </div>
            <div className="mt-2 w-full bg-dark-900 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${totalMembers > 0 ? (expiredMembers / totalMembers) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}