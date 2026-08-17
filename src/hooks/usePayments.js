import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supaError } = await supabase
        .from('payments')
        .select('*, members(name, last_name)')
        .order('payment_date', { ascending: false })

      if (supaError) throw supaError
      setPayments(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching payments:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const addPayment = useCallback(async (paymentData) => {
    try {
      const { data, error: supaError } = await supabase
        .from('payments')
        .insert([paymentData])
        .select('*, members(name, last_name)')
        .single()

      if (supaError) throw supaError

      setPayments(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      console.error('Error adding payment:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const updatePayment = useCallback(async (id, paymentData) => {
    try {
      const { data, error: supaError } = await supabase
        .from('payments')
        .update(paymentData)
        .eq('id', id)
        .select('*, members(name, last_name)')
        .single()

      if (supaError) throw supaError

      setPayments(prev => prev.map(p => p.id === id ? data : p))
      return { success: true, data }
    } catch (err) {
      console.error('Error updating payment:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const deletePayment = useCallback(async (id) => {
    try {
      const { error: supaError } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)

      if (supaError) throw supaError

      setPayments(prev => prev.filter(p => p.id !== id))
      return { success: true }
    } catch (err) {
      console.error('Error deleting payment:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const getPaymentsByMember = useCallback((memberId) => {
    return payments.filter(p => p.member_id === memberId)
  }, [payments])

  const getRecentPayments = useCallback((limit = 5) => {
    return payments.slice(0, limit)
  }, [payments])

  const getTotalIncome = useCallback((period = 'all') => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    let filtered = payments

    if (period === 'week') {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
      filtered = payments.filter(p => new Date(p.payment_date) >= weekAgo)
    } else if (period === 'month') {
      filtered = payments.filter(p => {
        const date = new Date(p.payment_date)
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth
      })
    } else if (period === 'year') {
      filtered = payments.filter(p => new Date(p.payment_date).getFullYear() === currentYear)
    }

    return filtered.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  }, [payments])

  const getIncomeByMonth = useCallback(() => {
    const months = {}
    const now = new Date()

    // Inicializar últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months[key] = 0
    }

    payments.forEach(p => {
      const date = new Date(p.payment_date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (months[key] !== undefined) {
        months[key] += parseFloat(p.amount) || 0
      }
    })

    return Object.entries(months).map(([month, amount]) => ({
      month: month.slice(5),
      amount: Math.round(amount * 100) / 100,
    }))
  }, [payments])

  return {
    payments,
    loading,
    error,
    fetchPayments,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsByMember,
    getRecentPayments,
    getTotalIncome,
    getIncomeByMonth,
  }
}