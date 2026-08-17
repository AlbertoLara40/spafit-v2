import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getMemberStatus } from '../utils/helpers'

export function useMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supaError } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (supaError) throw supaError

      // Actualizar estados basado en fecha de vencimiento
      const updatedMembers = data?.map(member => ({
        ...member,
        status: getMemberStatus(member.due_date)
      })) || []

      setMembers(updatedMembers)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching members:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const addMember = useCallback(async (memberData) => {
    try {
      const { data, error: supaError } = await supabase
        .from('members')
        .insert([memberData])
        .select()
        .single()

      if (supaError) throw supaError

      setMembers(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      console.error('Error adding member:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const updateMember = useCallback(async (id, memberData) => {
    try {
      const { data, error: supaError } = await supabase
        .from('members')
        .update(memberData)
        .eq('id', id)
        .select()
        .single()

      if (supaError) throw supaError

      setMembers(prev => prev.map(m => m.id === id ? data : m))
      return { success: true, data }
    } catch (err) {
      console.error('Error updating member:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const deleteMember = useCallback(async (id) => {
    try {
      const { error: supaError } = await supabase
        .from('members')
        .delete()
        .eq('id', id)

      if (supaError) throw supaError

      setMembers(prev => prev.filter(m => m.id !== id))
      return { success: true }
    } catch (err) {
      console.error('Error deleting member:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const getMemberById = useCallback((id) => {
    return members.find(m => m.id === id)
  }, [members])

  const getMembersByStatus = useCallback((status) => {
    return members.filter(m => m.status === status)
  }, [members])

  const searchMembers = useCallback((query) => {
    if (!query) return members
    const lowerQuery = query.toLowerCase()
    return members.filter(m => 
      m.name?.toLowerCase().includes(lowerQuery) ||
      m.last_name?.toLowerCase().includes(lowerQuery) ||
      m.phone?.includes(lowerQuery) ||
      m.email?.toLowerCase().includes(lowerQuery)
    )
  }, [members])

  return {
    members,
    loading,
    error,
    fetchMembers,
    addMember,
    updateMember,
    deleteMember,
    getMemberById,
    getMembersByStatus,
    searchMembers,
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'activo').length,
    expiringMembers: members.filter(m => m.status === 'por_vencer').length,
    expiredMembers: members.filter(m => m.status === 'vencido').length,
  }
}