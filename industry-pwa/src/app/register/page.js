'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'   // ← создай этот файл, если ещё нет (см. ниже)

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Пароль должен быть минимум 6 символов')
      return
    }

    setLoading(true)

    const supabase = createClient()

    // 1. Регистрация в Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {                    // ← кастомные метаданные пользователя
          username: formData.username,
          full_name: formData.fullName,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message) // "User already registered", "Password should be at least 6...", etc.
      setLoading(false)
      return
    }

    // Если email confirmation включён (по умолчанию в Supabase — да)
    // Пользователь получит письмо → после подтверждения сможет логиниться
    if (signUpData.user && !signUpData.session) {
      alert('Письмо с подтверждением отправлено на почту! Проверьте inbox/spam.')
      router.push('/login')
      return
    }

    // Если confirmation выключен → сразу залогинен
    if (signUpData.session) {
      // Можно сразу создать запись в таблице profiles
      await supabase.from('profiles').upsert({
        id: signUpData.user.id,
        username: formData.username,
        full_name: formData.fullName,
        updated_at: new Date().toISOString(),
      })

      router.push('/home') // или /onboarding
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Регистрация</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="username"
            placeholder="Никнейм"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-4 bg-gray-900 rounded-lg"
            required
          />
          <input
            name="fullName"
            placeholder="Имя"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-4 bg-gray-900 rounded-lg"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 bg-gray-900 rounded-lg"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-4 bg-gray-900 rounded-lg"
            required
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Повтор пароля"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-4 bg-gray-900 rounded-lg"
            required
          />

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-white text-black rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Создать аккаунт'}
          </button>
        </form>
      </div>
    </div>
  )
}