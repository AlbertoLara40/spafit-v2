import { useState } from 'react'
import { Save, DollarSign, RefreshCw } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import { formatCurrency } from '../utils/helpers'

export default function Settings() {
  const { settings, loading, updateSettings, getMonthlyPrice } = useSettings()

  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const result = await updateSettings({
      monthly_price: parseFloat(price) || getMonthlyPrice()
    })

    setSaving(false)

    if (result.success) {
      setMessage('✅ Configuración guardada correctamente')
      setPrice('')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage('❌ Error: ' + result.error)
    }
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="page-container max-w-2xl">
      <h1 className="page-title flex items-center gap-3">
        <RefreshCw className="w-8 h-8 text-accent" />
        Configuración
      </h1>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-accent" />
          Precio del Plan Mensual
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="input-label">Precio Actual</label>
            <div className="p-4 bg-dark-900 rounded-lg border border-dark-700">
              <p className="text-3xl font-bold text-white">
                {formatCurrency(getMonthlyPrice())}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Este precio se usa para calcular los pagos automáticamente
              </p>
            </div>
          </div>

          <div>
            <label className="input-label">Nuevo Precio</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field pl-8"
                placeholder="Ej: 35.00"
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('✅') 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {message}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving || !price}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-white mb-4">Información del Sistema</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-dark-700">
            <span className="text-gray-400">Versión</span>
            <span className="text-white">2.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-dark-700">
            <span className="text-gray-400">Base de Datos</span>
            <span className="text-green-400">Supabase PostgreSQL</span>
          </div>
          <div className="flex justify-between py-2 border-b border-dark-700">
            <span className="text-gray-400">Frontend</span>
            <span className="text-accent">React + Vite + Tailwind</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-400">Hosting</span>
            <span className="text-white">Vercel</span>
          </div>
        </div>
      </div>
    </div>
  )
}