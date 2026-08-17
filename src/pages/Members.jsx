import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react'
import { useMembers } from '../hooks/useMembers'
import { formatDate, formatCurrency, getStatusLabel, getStatusColor } from '../utils/helpers'

export default function Members() {
  const { 
    members, 
    loading, 
    deleteMember, 
    searchMembers,
    activeMembers,
    expiringMembers,
    expiredMembers
  } = useMembers()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredMembers = searchMembers(searchQuery).filter(member => {
    if (statusFilter === 'all') return true
    return member.status === statusFilter
  })

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${name}? Esta acción no se puede deshacer.`)) {
      await deleteMember(id)
    }
  }

  const statusOptions = [
    { value: 'all', label: 'Todos', count: members.length },
    { value: 'activo', label: 'Activos', count: activeMembers },
    { value: 'por_vencer', label: 'Por Vencer', count: expiringMembers },
    { value: 'vencido', label: 'Vencidos', count: expiredMembers },
  ]

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-[#c9a961] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="page-title mb-0">Miembros</h1>
        <Link to="/members/new" className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="w-4 h-4" />
          Nuevo Miembro
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, telefono o email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              className="input-field w-48"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="card overflow-hidden">
        {paginatedMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No se encontraron miembros</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="table-header">Miembro</th>
                    <th className="table-header">Contacto</th>
                    <th className="table-header">Estado</th>
                    <th className="table-header">Vencimiento</th>
                    <th className="table-header text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map((member) => (
                    <tr key={member.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                            {member.photo_url ? (
                              <img 
                                src={member.photo_url} 
                                alt={member.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-gray-300">
                                {member.name?.[0]}{member.last_name?.[0]}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {member.name} {member.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.join_date ? `Desde ${formatDate(member.join_date)}` : 'Nuevo'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="text-sm text-gray-300">{member.phone || '-'}</p>
                          <p className="text-xs text-gray-500">{member.email || '-'}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${getStatusColor(member.status)}`}>
                          {getStatusLabel(member.status)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`text-sm ${
                          member.status === 'vencido' ? 'text-red-400' :
                          member.status === 'por_vencer' ? 'text-amber-400' :
                          'text-green-400'
                        }`}>
                          {formatDate(member.due_date)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/members/${member.id}`}
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-[#c9a961] transition-colors"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/members/${member.id}/edit`}
                            className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-[#c9a961] transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(member.id, `${member.name} ${member.last_name}`)}
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
              <div className="flex items-center justify-between px-4 py-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredMembers.length)} de {filteredMembers.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-400 px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}