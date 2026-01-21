'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './register.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Статус проверки username
  const [usernameStatus, setUsernameStatus] = useState('idle') // idle | checking | available | taken | error
  const [usernameMessage, setUsernameMessage] = useState('')

  // Реал-тайм проверка username
  useEffect(() => {
    if (formData.username.length < 3) {
      setUsernameStatus('idle')
      setUsernameMessage('')
      return
    }

    const timer = setTimeout(async () => {
      setUsernameStatus('checking')
      setUsernameMessage('Проверка...')

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', formData.username.trim())
          .maybeSingle()

        if (error) throw error

        if (data) {
          setUsernameStatus('taken')
          setUsernameMessage('Никнейм уже занят')
        } else {
          setUsernameStatus('available')
          setUsernameMessage('Свободен ✓')
        }
      } catch (err) {
        console.error(err)
        setUsernameStatus('error')
        setUsernameMessage('Ошибка проверки')
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [formData.username, supabase])

  const validateForm = () => {
    const newErrors = {}

    // username
    if (!formData.username.trim()) {
      newErrors.username = 'Никнейм обязателен'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Минимум 3 символа'
    } else if (usernameStatus === 'taken') {
      newErrors.username = 'Никнейм уже занят'
    }

    // fullName
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Имя обязательно'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Имя слишком короткое'
    }

    // email
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email'
    }

    // password
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Минимум 6 символов'
    }

    // confirmPassword
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // очищаем ошибку при вводе
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            username: formData.username.trim(),
            full_name: formData.fullName.trim(),
          },
        },
      })

      if (error) throw error

      // Успешная регистрация
      if (!data.session) {
        // Требуется подтверждение почты (по умолчанию в Supabase)
        alert(`Код подтверждения отправлен на ${formData.email}\nПроверьте почту (и папку "Спам")`)
        router.push('/login')
      } else {
        // Если подтверждение отключено в настройках Supabase
        router.push('/home')
      }
    } catch (error) {
      setErrors({ general: error.message || 'Ошибка регистрации. Попробуйте позже.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Регистрация</h1>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* Никнейм */}
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
              className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
              required
              autoComplete="username"
            />
            {usernameStatus !== 'idle' && (
              <span
                className={`${styles.status} ${
                  usernameStatus === 'checking'
                    ? styles.checking
                    : usernameStatus === 'available'
                    ? styles.success
                    : styles.errorInline
                }`}
              >
                {usernameMessage}
              </span>
            )}
            {errors.username && <p className={styles.error}>{errors.username}</p>}
          </div>

          {/* Имя */}
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
              className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
              required
              autoComplete="name"
            />
            {errors.fullName && <p className={styles.error}>{errors.fullName}</p>}
          </div>

          {/* Email */}
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
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              required
              autoComplete="email"
            />
            {errors.email && <p className={styles.error}>{errors.email}</p>}
          </div>

          {/* Пароль */}
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
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              required
              autoComplete="new-password"
            />
            {errors.password && <p className={styles.error}>{errors.password}</p>}
          </div>

          {/* Повтор пароля */}
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
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              required
              autoComplete="new-password"
            />
            {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}
          </div>

          {errors.general && <p className={styles.generalError}>{errors.general}</p>}

          <button
            type="submit"
            disabled={loading || usernameStatus === 'checking'}
            className={styles.button}
          >
            {loading ? 'Создаём...' : 'Создать аккаунт'}
          </button>
        </form>
      </div>
    </div>
  )
}