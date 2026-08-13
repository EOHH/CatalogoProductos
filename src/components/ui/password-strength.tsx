import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password?: string
}

export function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  const requirements = [
    { label: '8+ caracteres', regex: /.{8,}/ },
    { label: 'Mayúsculas', regex: /[A-Z]/ },
    { label: 'Números', regex: /[0-9]/ },
    { label: 'Símbolos', regex: /[^A-Za-z0-9]/ },
  ]

  const validations = requirements.map((req) => ({
    label: req.label,
    passed: req.regex.test(password),
  }))

  const score = validations.filter((v) => v.passed).length
  const total = requirements.length

  let strengthLabel = 'Débil'
  let progressColor = 'bg-primary/40' // Soft primary

  if (score === total) {
    strengthLabel = 'Fuerte'
    progressColor = 'bg-primary'
  } else if (score >= 2) {
    strengthLabel = 'Buena'
    progressColor = 'bg-primary/70'
  } else if (score === 0) {
    strengthLabel = ''
    progressColor = 'bg-zinc-200'
  }



  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center text-[13px] font-medium font-sans">
        <span className="text-zinc-600 mr-2">Fuerza:</span>
        <span className="transition-colors duration-300 font-bold text-primary">
          {strengthLabel}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden flex gap-1">
         {/* Split into 4 segments visually */}
         {[...Array(4)].map((_, i) => (
           <div key={i} className="h-full flex-1 bg-zinc-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full transition-all duration-500 ease-out', 
                  i < score ? progressColor : 'bg-transparent'
                )}
                style={{ width: '100%' }}
              />
           </div>
         ))}
      </div>

      {/* Requirements Checks */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
        {validations.map((val) => (
          <div
            key={val.label}
            className={cn(
              'flex items-center text-[12px] font-medium transition-colors duration-300 font-sans',
              val.passed ? 'text-primary' : 'text-zinc-400'
            )}
          >
            {val.passed ? (
              <Check className="h-3 w-3 text-primary mr-1" strokeWidth={3} />
            ) : (
              <Check className="h-3 w-3 text-zinc-300 mr-1" strokeWidth={3} />
            )}
            {val.label}
          </div>
        ))}
      </div>
    </div>
  )
}

