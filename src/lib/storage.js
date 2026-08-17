import { supabase } from './supabase'

const BUCKET_NAME = 'member-photos'

/**
 * Sube una foto al bucket de Supabase Storage
 * @param {File} file - Archivo de imagen
 * @param {string} memberId - ID del miembro (para nombrar el archivo)
 * @returns {Promise<{url: string, error: string|null}>}
 */
export async function uploadMemberPhoto(file, memberId) {
  try {
    // Crear nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${memberId}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // Subir archivo al bucket
    const { data, error: uploadError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Si existe, lo reemplaza
      })

    if (uploadError) throw uploadError

    // Obtener URL pública
    const { data: { publicUrl } } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return { url: publicUrl, error: null }
  } catch (err) {
    console.error('Error uploading photo:', err)
    return { url: null, error: err.message }
  }
}

/**
 * Elimina una foto del bucket
 * @param {string} photoUrl - URL completa de la foto
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteMemberPhoto(photoUrl) {
  try {
    if (!photoUrl) return { success: true, error: null }

    // Extraer el nombre del archivo de la URL
    const url = new URL(photoUrl)
    const pathParts = url.pathname.split('/')
    const fileName = pathParts[pathParts.length - 1]

    const { error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .remove([fileName])

    if (error) throw error

    return { success: true, error: null }
  } catch (err) {
    console.error('Error deleting photo:', err)
    return { success: false, error: err.message }
  }
}