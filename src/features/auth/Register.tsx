import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Eye, EyeOff, Shirt, Store, Link as LinkIcon, Mail, Lock, ArrowRight } from 'lucide-react'
import { PasswordStrength } from '@/components/ui/password-strength'

const registerSchema = z.object({
  storeName: z.string().min(3, 'El nombre de la tienda es muy corto'),
  slug: z.string().min(3, 'El identificador debe tener al menos 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones (-)'),
  email: z.string().email('Ingresa un correo válido'),
  password: z.string()
    .min(8, 'Debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener mayúsculas')
    .regex(/[a-z]/, 'Debe contener minúsculas')
    .regex(/[0-9]/, 'Debe contener números')
    .regex(/[^A-Za-z0-9]/, 'Debe contener caracteres especiales'),
})

type RegisterForm = z.infer<typeof registerSchema>

export function Register() {
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  })

  const passwordValue = watch('password', '')

  const onSubmit = async (data: RegisterForm) => {
    setError(null)
    
    // 1. Sign up the user in Supabase Auth, passing metadata for the Trigger
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          storeName: data.storeName,
          slug: data.slug
        }
      }
    })

    if (signUpError) {
      if (signUpError.message.includes('User already registered')) {
        setError('Este correo electrónico ya está registrado. Intenta iniciar sesión.')
      } else {
        setError(signUpError.message)
      }
      return
    }

    if (!authData.user) {
      setError('Ocurrió un error creando el usuario. Intenta de nuevo.')
      return
    }

    // Force react-query to refetch the profile and tenant context
    queryClient.invalidateQueries({ queryKey: ['tenant-context'] })

    if (!authData.session) {
      // Supabase Email confirmation is enabled
      setError('¡Cuenta creada! Por favor, revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.')
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="w-full flex flex-col items-center bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Icono superior */}
      <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6">
        <Shirt className="h-7 w-7 text-primary" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col space-y-3 text-center mb-8">
        <h2 className="text-3xl font-serif tracking-tight text-zinc-900">
          Crea tu <span className="text-primary italic">catálogo</span>
        </h2>
        <p className="text-[14px] text-zinc-500 max-w-[300px] leading-relaxed mx-auto font-sans">
          Completa los datos para iniciar tu prueba gratuita y configurar tu tienda.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full font-sans">
        {error && (
          <div className="p-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-zinc-800 ml-1">
              Nombre de la tienda
            </label>
            <div className="relative">
              <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" strokeWidth={2} />
              <Input 
                placeholder="Mi Tienda VIP" 
                {...register('storeName')} 
                className="h-12 pl-11 bg-white border-zinc-200 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 rounded-xl text-[14px]"
              />
            </div>
            {errors.storeName && (
              <p className="text-[11px] text-rose-500 font-medium ml-1">{errors.storeName.message}</p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-zinc-800 ml-1">
              Identificador (URL)
            </label>
            <div className="flex relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400 z-10" strokeWidth={2} />
              <Input 
                placeholder="mi-tienda-vip" 
                {...register('slug')} 
                className="h-12 pl-11 pr-[100px] bg-white border-zinc-200 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 rounded-xl text-[14px]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-zinc-400 pointer-events-none">
                .catalogo.com
              </div>
            </div>
            {errors.slug && (
              <p className="text-[11px] text-rose-500 font-medium ml-1">{errors.slug.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-zinc-800 ml-1">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" strokeWidth={2} />
            <Input 
              type="email" 
              placeholder="tu@email.com" 
              {...register('email')} 
              className="h-12 pl-11 bg-white border-zinc-200 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 rounded-xl text-[14px]"
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-500 font-medium ml-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-zinc-800 ml-1">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" strokeWidth={2} />
            <Input 
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••" 
              {...register('password')} 
              className="h-12 pl-11 pr-11 bg-white border-zinc-200 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 rounded-xl text-[14px] font-medium tracking-wide"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>
          
          <div className="px-1">
            <PasswordStrength password={passwordValue} />
          </div>

          {errors.password && (
            <p className="text-[11px] text-rose-500 font-medium ml-1">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full h-12 text-[15px] font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm border border-primary/20 rounded-xl transition-all duration-300 mt-6 flex items-center justify-center gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Crear mi catálogo
              <ArrowRight className="h-[18px] w-[18px]" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-[13px] text-zinc-500 mt-8 font-sans">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}



