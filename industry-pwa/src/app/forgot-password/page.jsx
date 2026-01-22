'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import styles from './forgot-password.module.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0) // секунды до повторной отправки

  const handleReset = async (e) => {
    e.preventDefault()

    if (cooldown > 0) {
      toast.info(`Подождите ${cooldown} сек перед повторной отправкой`)
      return
    }

    setLoading(true)

    const trimmedEmail = email.trim()

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      toast.error('Введите корректный email')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      console.error('Ошибка сброса:', error)
      toast.error('Не удалось отправить', {
        description: error.message.includes('rate limit')
          ? 'Слишком много попыток. Подождите 1–2 минуты'
          : error.message || 'Попробуйте позже',
      })

      // Если rate limit — ставим кулдаун 60 сек
      if (error.message.includes('rate limit')) {
        setCooldown(60)
        const interval = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } else {
      toast.success('Ссылка отправлена!', {
        description: `Проверьте ${trimmedEmail} (и Спам)`,
        duration: 8000,
      })
      // Кулдаун после успешной отправки — 90 сек
      setCooldown(90)
      const interval = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Сброс пароля</h1>

        <p className={styles.subtitle}>
          Введите email. Мы отправим ссылку для сброса.
        </p>

        <form onSubmit={handleReset} className={styles.form}>
          <input
            type="email"
            placeholder="Ваш email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            disabled={loading || cooldown > 0}
          />

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className={styles.button}
          >
            {loading
              ? 'Отправляем...'
              : cooldown > 0
              ? `Подождите ${cooldown} сек`
              : 'Получить ссылку'}
          </button>
        </form>

        <p className={styles.backLink}>
          <a href="/login">Вернуться ко входу</a>
        </p>
      </div>
    </div>
  )
}