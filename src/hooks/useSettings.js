import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: supaError } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (supaError) throw supaError

      setSettings(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSettings = useCallback(async (newSettings) => {
    try {
      const { data, error: supaError } = await supabase
        .from('settings')
        .update({ ...newSettings, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select()
        .single()

      if (supaError) throw supaError

      setSettings(data)
      return { success: true, data }
    } catch (err) {
      console.error('Error updating settings:', err)
      return { success: false, error: err.message }
    }
  }, [])

  const getMonthlyPrice = useCallback(() => {
    return settings?.monthly_price || 30.00
  }, [settings])

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    getMonthlyPrice,
  }
}