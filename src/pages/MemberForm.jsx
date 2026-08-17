import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useMembers } from '../hooks/useMembers'
import { uploadMemberPhoto, deleteMemberPhoto } from '../lib/storage'

export default function MemberForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { members, addMember, updateMember, loading: membersLoading } = useMembers()
  
  const isEditing = Boolean(id)
  const member = members.find(m => m.id === id)

  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    phone: '',
    photo_url: '',
    due_date: '',
  })
  
  const [photoFile, setPhotoFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEditing && member) {
      setFormData({
        name: member.name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        phone: member.phone || '',
        photo_url: member.photo_url || '',
        due_date: member.due_date ? member.due_date.slice(0, 10) : '',
      })
      setPreviewUrl(member.photo_url || null)
    }
  }, [isEditing, member])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)

    setPhotoFile(file)
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!formData.last_name.trim()) newErrors.last_name = 'El apellido es obligatorio'
    if (!formData.due_date) newErrors.due_date = 'La fecha de vencimiento es obligatoria'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)

    try {
      let photoUrl = formData.photo_url

      if (photoFile) {
        if (isEditing && member?.photo_url) {
          await deleteMemberPhoto(member.photo_url)
        }

        const result = await uploadMemberPhoto(photoFile, id || 'new')
        if (result.error) throw new Error(result.error)
        photoUrl = result.url
      }

      const memberData = {
        ...formData,
        photo_url: photoUrl,
        plan_id: 'plan-mensual',
      }

      const result = isEditing 
        ? await updateMember(id, memberData)
        : await addMember(memberData)

      if (result.success) {
        navigate(isEditing ? `/members/${id}` : '/members')
      } else {
        alert('Error al guardar: ' + result.error)
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (membersLoading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#c9a961] animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-[#1a1a1a] border border-[#1a1a1a] hover:border-[#c9a961] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#c9a961]" />
        </button>
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Editar Miembro' : 'Nuevo Miembro'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto de perfil */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-[#0a0a0a] border-2 border-[#c9a961] flex items-center justify-center">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-12 h-12 text-[#888888]" />
              )}
            </div>
            <label 
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#c9a961] hover:bg-[#d4b978] cursor-pointer transition-colors shadow-lg"
            >
              <Camera className="w-4 h-4 text-black" />
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          <p className="text-sm text-[#888888]">Toca el icono para subir foto (máx. 5MB)</p>
        </div>

        {/* Campos del formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#888888] mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-[#0a0a0a] border ${
                errors.name ? 'border-red-500' : 'border-[#1a1a1a]'
              } text-white placeholder-[#444444] focus:outline-none focus:border-[#c9a961] transition-colors`}
              placeholder="Ej. Juan"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#888888] mb-1">
              Apellido *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-[#0a0a0a] border ${
                errors.last_name ? 'border-red-500' : 'border-[#1a1a1a]'
              } text-white placeholder-[#444444] focus:outline-none focus:border-[#c9a961] transition-colors`}
              placeholder="Ej. Pérez"
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#888888] mb-1">
              Fecha de vencimiento *
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg bg-[#0a0a0a] border ${
                errors.due_date ? 'border-red-500' : 'border-[#1a1a1a]'
              } text-white focus:outline-none focus:border-[#c9a961] transition-colors`}
            />
            {errors.due_date && (
              <p className="mt-1 text-sm text-red-500">{errors.due_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#888888] mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-white placeholder-[#444444] focus:outline-none focus:border-[#c9a961] transition-colors"
              placeholder="ejemplo@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#888888] mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] text-white placeholder-[#444444] focus:outline-none focus:border-[#c9a961] transition-colors"
              placeholder="Ej. 809-555-1234"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#c9a961] text-[#c9a961] hover:bg-[#2a2a2a] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2 rounded-lg bg-[#c9a961] text-black font-medium hover:bg-[#d4b978] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Guardar Cambios' : 'Crear Miembro'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}