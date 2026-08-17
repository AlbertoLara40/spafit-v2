import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, User, Calendar, Phone, Mail, CreditCard, Loader2 } from 'lucide-react'
import { useMembers } from '../hooks/useMembers'
import { usePayments } from '../hooks/usePayments'
import { deleteMemberPhoto } from '../lib/storage'

export default function MemberDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { members, deleteMember, loading: membersLoading } = useMembers()
  const { payments, addPayment } = usePayments()
  
  const member = members.find(m => m.id === id)
  const memberPayments = payments.filter(p => p.member_id === id)
  
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [deleting, setDeleting] = useState(false)

  if (membersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#c9a961] animate-spin" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-[#888888]">Miembro no encontrado</p>
        <button
          onClick={() => navigate('/members')}
          className="mt-4 px-4 py-2 bg-[#c9a961] text-black rounded-lg hover:bg-[#d4b978]"
        >
          Volver a Miembros
        </button>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10'
      case 'por_vencer': return 'text-amber-500 bg-amber-500/10'
      case 'vencido': return 'text-red-500 bg-red-500/10'
      default: return 'text-[#888888] bg-[#1a1a1a]'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'por_vencer': return 'Por vencer'
      case 'vencido': return 'Vencido'
      default: return status
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`¿Eliminar a ${member.name} ${member.last_name}? Se eliminarán también todos sus pagos y foto.`)) {
      setDeleting(true)
      try {
        // Eliminar foto primero
        if (member.photo_url) {
          await deleteMemberPhoto(member.photo_url)
        }
        
        await deleteMember(id)
        navigate('/members')
      } catch (err) {
        alert('Error al eliminar: ' + err.message)
        setDeleting(false)
      }
    }
  }

  const handleAddPayment = async (e) => {
    e.preventDefault()
    if (!paymentAmount) return

    const result = await addPayment({
      member_id: id,
      amount: parseFloat(paymentAmount),
      method: paymentMethod,
    })

    if (result.success) {
      setPaymentAmount('')
      setShowPaymentForm(false)
    } else {
      alert('Error al registrar pago: ' + result.error)
    }
  }

  const totalPaid = memberPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/members')}
            className="p-2 rounded-lg bg-[#1a1a1a] border border-[#1a1a1a] hover:border-[#c9a961] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#c9a961]" />
          </button>
          <h1 className="text-2xl font-bold text-white">Detalle del Miembro</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/members/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#c9a961] text-[#c9a961] hover:bg-[#2a2a2a] transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Eliminar
          </button>
        </div>
      </div>

      {/* Info del miembro */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Foto */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-[#1a1a1a] border-2 border-[#c9a961] flex items-center justify-center">
              {member.photo_url ? (
                <img 
                  src={member.photo_url} 
                  alt={`${member.name} ${member.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-[#888888]" />
              )}
            </div>
          </div>

          {/* Datos */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#888888]">Nombre completo</p>
              <p className="text-lg font-semibold text-white">
                {member.name} {member.last_name}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-[#888888]">Estado</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(member.status)}`}>
                {getStatusLabel(member.status)}
              </span>
            </div>

            {member.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#c9a961]" />
                <span className="text-white">{member.email}</span>
              </div>
            )}

            {member.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#c9a961]" />
                <span className="text-white">{member.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#c9a961]" />
              <span className="text-white">
                Registrado: {new Date(member.created_at).toLocaleDateString('es-ES')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#c9a961]" />
              <span className="text-white">
                Total pagado: ${totalPaid.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pagos */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Historial de Pagos</h2>
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="px-4 py-2 rounded-lg bg-[#c9a961] text-black font-medium hover:bg-[#d4b978] transition-colors"
          >
            {showPaymentForm ? 'Cancelar' : 'Registrar Pago'}
          </button>
        </div>

        {showPaymentForm && (
          <form onSubmit={handleAddPayment} className="mb-6 p-4 bg-[#1a1a1a] rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#888888] mb-1">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-white focus:outline-none focus:border-[#c9a961]"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#888888] mb-1">Método</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-white focus:outline-none focus:border-[#c9a961]"
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg bg-[#c9a961] text-black font-medium hover:bg-[#d4b978] transition-colors"
            >
              Guardar Pago
            </button>
          </form>
        )}

        {memberPayments.length === 0 ? (
          <p className="text-[#888888] text-center py-8">No hay pagos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="text-left py-3 px-4 text-[#888888] font-medium">Fecha</th>
                  <th className="text-left py-3 px-4 text-[#888888] font-medium">Monto</th>
                  <th className="text-left py-3 px-4 text-[#888888] font-medium">Método</th>
                </tr>
              </thead>
              <tbody>
                {memberPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]/50">
                    <td className="py-3 px-4 text-white">
                      {new Date(payment.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-4 text-[#c9a961] font-medium">
                      ${payment.amount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-white capitalize">
                      {payment.method === 'cash' ? 'Efectivo' : 
                       payment.method === 'card' ? 'Tarjeta' : 'Transferencia'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}