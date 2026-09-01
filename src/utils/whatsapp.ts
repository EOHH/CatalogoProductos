export function getWhatsAppUrl(phone: string | null | undefined, message?: string): string | undefined {
  if (!phone || phone.trim() === '') return undefined

  // Normalizar el número: eliminar espacios, +, guiones y paréntesis
  const cleanedPhone = phone.replace(/[\s+\-()]/g, '')
  
  // Si después de limpiar no quedan números, o es demasiado corto, retornamos null
  if (!cleanedPhone || cleanedPhone.length < 5 || !/^\d+$/.test(cleanedPhone)) {
    return undefined
  }

  let url = `https://wa.me/${cleanedPhone}`
  if (message) {
    url += `?text=${encodeURIComponent(message)}`
  }
  
  return url
}
