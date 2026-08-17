import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  CreditCard, 
  Trash2, 
  Edit2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react'
import { usePayments } from '../hooks/usePayments'
import { formatDate, formatCurrency, getPaymentMethodLabel } from '../utils/helpers'

export default function Payments() {
  const { 
    payments, 
    loading, 
    deletePayment,
    getTotalIncome 
  } = usePayments()

  const [searchQuery, setSearchQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchQuery || 
      `${payment.members?.name} ${payment.members?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter

    return matchesSearch && matchesMethod
  }).sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.payment_date)
      const dateB = new Date(b.payment_date)
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    }
    if (sortBy === 'amount') {
      return sortOrder === 'desc' 
        ? parseFloat(b.amount) - parseFloat(a.amount)
        : parseFloat(a.amount) - parseFloat(b.amount)
    }
    return 0
  })

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este pago?')) {
      await deletePayment(id)
    }
  }

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const methodOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'pago_movil', label: 'Pago Móvil' },
    { value: 'zelle', label: 'Zelle' },
  ]

  // Totales por método
  const totalsByMethod = {}
  payments.forEach(p => {
    totalsByMethod[p.method] = (totalsByMethod[p.method] || 0) + parseFloat(p.amount)
  })

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="page-title flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-accent" />
        Pagos
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-gray-400 mb-1">Total</p>
          <p className="text-lg font-bold text-white">{formatCurrency(getTotalIncome('all'))}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-400 mb-1">Semana</p>
          <p className="text-lg font-bold text-green-400">{formatCurrency(getTotalIncome('week'))}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-400 mb-1">Mes</p>
          <p className="text-lg font-bold text-green-400">{formatCurrency(getTotalIncome('month'))}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-400 mb-1">Año</p>
          <p className="text-lg font-bold text-green-400">{formatCurrency(getTotalIncome('year'))}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-400 mb-1">Transacciones</p>
          <p className="text-lg font-bold text-white">{payments.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o notas..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={methodFilter}
              onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1) }}
              className="input-field w-44"
            >
              {methodOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card overflow-hidden">
        {paginatedPayments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No se encontraron pagos</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="table-header">Miembro</th>
                    <th 
                      className="table-header cursor-pointer hover:text-white"
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Fecha
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="table-header">Método</th>
                    <th className="table-header">Notas</th>
                    <th 
                      className="table-header text-right cursor-pointer hover:text-white"
                      onClick={() => toggleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Monto
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="table-header text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="table-row">
                      <td className="table-cell">
                        <Link 
                          to={`/members/${payment.member_id}`}
                          className="text-white hover:text-accent transition-colors font-medium"
                        >
                          {payment.members?.name} {payment.members?.last_name}
                        </Link>
                      </td>
                      <td className="table-cell">{formatDate(payment.payment_date)}</td>
                      <td className="table-cell">
                        <span className="badge bg-dark-700 text-gray-300 border-dark-600">
                          {getPaymentMethodLabel(payment.method)}
                        </span>
                      </td>
                      <td className="table-cell text-gray-500">{payment.notes || '-'}</td>
                      <td className="table-cell text-right font-semibold text-green-400">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDelete(payment.id)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-dark-700">
                <p className="text-sm text-gray-400">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredPayments.length)} de {filteredPayments.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-gray-400 hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-400 px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-gray-400 hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Totals by Method */}
      {Object.keys(totalsByMethod).length > 0 && (
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Totales por Método de Pago</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(totalsByMethod).map(([method, total]) => (
              <div key={method} className="bg-dark-900 rounded-lg p-4 border border-dark-700">
                <p className="text-xs text-gray-400 mb-1">{getPaymentMethodLabel(method)}</p>
                <p className="text-lg font-bold text-white">{formatCurrency(total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}