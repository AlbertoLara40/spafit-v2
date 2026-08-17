import { differenceInYears, format, parseISO, isBefore, addDays, isAfter } from 'date-fns'

export const calculateAge = (birthDate) => {
  if (!birthDate) return null
  return differenceInYears(new Date(), parseISO(birthDate))
}

export const formatDate = (date) => {
  if (!date) return '-'
  return format(parseISO(date), 'dd/MM/yyyy')
}

export const formatDateShort = (date) => {
  if (!date) return '-'
  return format(parseISO(date), 'dd/MM/yy')
}

export const formatCurrency = (amount) => {
  if (amount == null) return '$0.00'
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const getStatusColor = (status) => {
  const colors = {
    activo: 'text-green-400 bg-green-500/20 border-green-500/30',
    por_vencer: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    vencido: 'text-red-400 bg-red-500/20 border-red-500/30',
  }
  return colors[status] || colors.activo
}

export const getStatusLabel = (status) => {
  const labels = {
    activo: 'Activo',
    por_vencer: 'Por Vencer',
    vencido: 'Vencido',
  }
  return labels[status] || status
}

export const getPaymentMethodLabel = (method) => {
  const labels = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    pago_movil: 'Pago Móvil',
    zelle: 'Zelle',
  }
  return labels[method] || method
}

export const getPaymentMethodIcon = (method) => {
  const icons = {
    efectivo: 'Banknote',
    transferencia: 'ArrowLeftRight',
    pago_movil: 'Smartphone',
    zelle: 'CreditCard',
  }
  return icons[method] || 'CreditCard'
}

export const calculateDueDate = (joinDate, durationDays = 30) => {
  return addDays(parseISO(joinDate), durationDays)
}

export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = parseISO(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffTime = due - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const getMemberStatus = (dueDate) => {
  if (!dueDate) return 'vencido'
  const daysUntil = getDaysUntilDue(dueDate)
  if (daysUntil < 0) return 'vencido'
  if (daysUntil <= 7) return 'por_vencer'
  return 'activo'
}