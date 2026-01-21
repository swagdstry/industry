'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './register.module.css'

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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    if (formData.password.length < 6) {
      setError('Пароль минимум 6 символов')
      return
    }

    setLoading(true)

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          username: formData.username.trim(),
          full_name: formData.fullName.trim(),
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message || 'Ошибка регистрации')
      setLoading(false)
      return
    }

    if (!data.session) {
      alert('Письмо с подтверждением отправлено! Проверь почту.')
      router.push('/login')
    } else {
      router.push('/home')
    }

    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Регистрация</h1>

        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.inputGroup}>
            <img
              src="https://cdn-icons-png.freepik.com/512/6543/6543037.png?ga=GA1.1.1203493570.1768999323"
              alt="Никнейм"
              className={styles.inputIcon}
              width={22}
              height={22}
            />
            <input
              name="username"
              placeholder="Никнейм"
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <img
              src="https://cdn-icons-png.freepik.com/512/6102/6102898.png?ga=GA1.1.1203493570.1768999323"
              alt="Имя"
              className={styles.inputIcon}
              width={22}
              height={22}
            />
            <input
              name="fullName"
              placeholder="Имя"
              value={formData.fullName}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <img
              src="https://cdn-icons-png.freepik.com/512/14034/14034513.png?ga=GA1.1.1203493570.1768999323"
              alt="Email"
              className={styles.inputIcon}
              width={22}
              height={22}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <img
              src="https://cdn-icons-png.freepik.com/512/10976/10976481.png?ga=GA1.1.1203493570.1768999323"
              alt="Пароль"
              className={styles.inputIcon}
              width={22}
              height={22}
            />
            <input
              name="password"
              type="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <img
              src="https://cdn-icons-png.freepik.com/512/10976/10976481.png?ga=GA1.1.1203493570.1768999323"
              alt="Повтор пароля"
              className={styles.inputIcon}
              width={22}
              height={22}
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Повтор пароля"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Создаём...' : 'Создать аккаунт'}
          </button>
        </form>
      </div>
    </div>
  )
}