import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff, Shirt, Mail, Lock, ArrowRight } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      setError('Credenciales inválidas. Por favor intenta de nuevo.')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="w-full flex flex-col items-center bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Icono superior */}
      <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6">
        <Shirt className="h-7 w-7 text-primary" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col space-y-2 text-center mb-8">
        <h2 className="text-3xl font-serif tracking-tight text-zinc-900">
          Inicia sesión
        </h2>
        <div className="flex flex-col items-center gap-1 mt-1">
          <span className="text-primary text-[10px]">♡</span>
          <p className="text-[13px] text-zinc-500 font-sans">
            Nos alegra verte de nuevo
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full font-sans">
        {error && (
          <div className="p-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">
            {error}
          </div>
        )}

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
          {errors.password && (
            <p className="text-[11px] text-rose-500 font-medium ml-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <div 
              className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-colors ${rememberMe ? 'bg-primary border-primary' : 'border border-zinc-300 bg-white'}`}
              onClick={() => setRememberMe(!rememberMe)}
            >
              {rememberMe && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className="text-[12px] font-medium text-zinc-600">Recuérdame</span>
          </label>
          
          <a href="#" className="text-[12px] font-medium text-zinc-500 hover:text-primary transition-colors">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <Button type="submit" className="w-full h-12 text-[15px] font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm border border-primary/20 rounded-xl transition-all duration-300 mt-6 flex items-center justify-center gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Iniciar sesión
              <ArrowRight className="h-[18px] w-[18px]" />
            </>
          )}
        </Button>
        
        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-zinc-100"></div>
          <span className="flex-shrink-0 mx-4 text-[11px] text-zinc-400 font-medium">o continúa con</span>
          <div className="flex-grow border-t border-zinc-100"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="h-11 rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-medium text-[13px]">
            <svg className="w-[18px] h-[18px] mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.745 12.27C23.745 11.48 23.67 10.73 23.55 10H12.255V14.51H18.72C18.435 15.99 17.58 17.26 16.32 18.09V21.09H20.19C22.455 19 23.745 15.92 23.745 12.27Z" fill="#4285F4"/><path d="M12.255 24C15.495 24 18.21 22.92 20.19 21.09L16.32 18.09C15.24 18.81 13.875 19.25 12.255 19.25C9.12 19.25 6.465 17.14 5.52 14.29H1.545V17.38C3.51 21.28 7.56 24 12.255 24Z" fill="#34A853"/><path d="M5.52 14.29C5.28 13.57 5.145 12.8 5.145 12C5.145 11.2 5.28 10.43 5.52 9.71V6.62H1.545C0.735 8.24 0.255 10.06 0.255 12C0.255 13.94 0.735 15.76 1.545 17.38L5.52 14.29Z" fill="#FBBC05"/><path d="M12.255 4.75C14.025 4.75 15.6 5.36 16.845 6.55L20.265 3.13C18.195 1.19 15.495 0 12.255 0C7.56 0 3.51 2.72 1.545 6.62L5.52 9.71C6.465 6.86 9.12 4.75 12.255 4.75Z" fill="#EA4335"/></svg>
            Google
          </Button>
          <Button type="button" variant="outline" className="h-11 rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-medium text-[13px]">
            <svg className="w-[18px] h-[18px] mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M16.365 14.733c-0.015-3.396 2.766-5.011 2.893-5.093-1.57-2.298-3.992-2.607-4.856-2.639-2.062-0.207-4.025 1.217-5.076 1.217-1.05 0-2.67-1.194-4.364-1.161-2.215 0.033-4.263 1.288-5.4 3.26-2.3 3.987-0.587 9.878 1.656 13.123 1.096 1.588 2.392 3.376 4.103 3.31 1.646-0.065 2.272-1.066 4.265-1.066 1.992 0 2.585 1.066 4.301 1.033 1.748-0.033 2.868-1.621 3.963-3.212 1.267-1.848 1.787-3.642 1.815-3.737-0.039-0.017-3.486-1.336-3.5-5.035zM14.931 7.218c0.906-1.096 1.516-2.617 1.349-4.138-1.299 0.052-2.879 0.865-3.81 1.96-0.738 0.865-1.428 2.417-1.235 3.906 1.455 0.113 2.924-0.632 3.696-1.728z"/></svg>
            Apple
          </Button>
        </div>
      </form>

      <p className="text-center text-[13px] text-zinc-500 mt-8 font-sans">
        ¿No tienes una cuenta?{' '}
        <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
          Crear mi catálogo
        </Link>
      </p>
    </div>
  )
}


