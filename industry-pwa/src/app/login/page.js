'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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

    const supabase = createClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(
        signInError.message.includes('Invalid login credentials')
          ? 'Неверный email или пароль'
          : signInError.message || 'Ошибка при входе'
      )
      setLoading(false)
      return
    }

    // Успешный вход
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
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={styles.input}
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
          Нет аккаунта?{' '}
          <a href="/register" className={styles.link}>
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  )
}