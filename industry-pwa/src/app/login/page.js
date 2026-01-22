'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const trimmedEmail = email.trim() // ← обязательно!

    console.log('Попытка входа →', { email: trimmedEmail, passwordLength: password.length })

    const supabase = createClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (signInError) {
      console.error('Ошибка Supabase:', signInError)

      let userMessage = 'Неверный email или пароль'
      if (signInError.message.includes('Invalid login credentials')) {
        userMessage = 'Неверный email или пароль'
      } else if (signInError.message.includes('Email not confirmed')) {
        userMessage = 'Почта ещё не подтверждена. Проверьте письмо'
      } else if (signInError.message.includes('rate limit')) {
        userMessage = 'Слишком много попыток. Подождите минуту'
      } else {
        userMessage = signInError.message
      }

      setError(userMessage)
      toast.error('Не удалось войти', {
        description: userMessage,
        duration: 6000,
      })

      setLoading(false)
      return
    }

    // Успех
    console.log('Успешный вход:', data.user?.email)
    toast.success('Вход выполнен!', {
      description: `Добро пожаловать, ${data.user?.email}`,
      duration: 4000,
    })

    router.push('/home')
    router.refresh()
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Вход</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={styles.input}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={styles.input}
            disabled={loading}
          />

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={styles.button}
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <p className={styles.linkText}>
          <a href="/forgot-password" className={styles.link}>
            Забыли пароль?
          </a>
        </p>

        <p className={styles.linkText}>
          Нет аккаунта?{' '}
          <a href="/register" className={styles.link}>
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  )
}