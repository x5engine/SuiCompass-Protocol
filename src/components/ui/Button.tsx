import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = 'px-6 py-3 font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white hover:from-cyan-600 hover:to-teal-700 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30',
    secondary: 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-800/50'
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

