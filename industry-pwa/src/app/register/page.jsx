'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
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

  // Реал-тайм проверка никнейма
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
          .eq('username', formData.username.trim().toLowerCase())
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
        console.error('Ошибка проверки ника:', err.message || err)
        setUsernameStatus('error')
        setUsernameMessage('Не удалось проверить')
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [formData.username, supabase])

  const validateForm = () => {
    const newErrors = {}

    // username
    if (!formData.username.trim()) newErrors.username = 'Никнейм обязателен'
    else if (formData.username.length < 3) newErrors.username = 'Минимум 3 символа'
    else if (usernameStatus === 'taken') newErrors.username = 'Никнейм уже занят'

    // fullName
    if (!formData.fullName.trim()) newErrors.fullName = 'Имя обязательно'
    else if (formData.fullName.trim().length < 2) newErrors.fullName = 'Имя слишком короткое'

    // email
    if (!formData.email.trim()) newErrors.email = 'Email обязателен'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Некорректный email'

    // password
    if (!formData.password) newErrors.password = 'Пароль обязателен'
    else if (formData.password.length < 6) newErrors.password = 'Минимум 6 символов'

    // confirmPassword
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

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
            username: formData.username.trim().toLowerCase(),
            full_name: formData.fullName.trim(),
          },
        },
      })

      if (error) throw error

      // Создаём профиль в таблице profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: formData.username.trim().toLowerCase(),
          full_name: formData.fullName.trim(),
        })

      if (profileError) {
        console.error('Ошибка создания профиля:', profileError)
        toast.error('Ошибка создания профиля', {
          description: profileError.message || 'Попробуйте позже',
        })
        return
      }

      // Успех
      if (!data.session) {
        toast.success('Письмо отправлено!', {
          description: `Проверьте ${formData.email} (и папку «Спам»)`,
          duration: 8000,
          icon: '📧',
        })
        router.push('/login')
      } else {
        toast.success('Регистрация завершена!', {
          description: 'Добро пожаловать в Industry',
          duration: 5000,
        })
        router.push('/home')
      }
    } catch (error) {
      toast.error('Ошибка регистрации', {
        description: error.message || 'Попробуйте позже',
        duration: 6000,
      })
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
              src="https://cdn-icons-png.freepik.com/512/6543/6543037.png"
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
              src="https://cdn-icons-png.freepik.com/512/6102/6102898.png"
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
              src="https://cdn-icons-png.freepik.com/512/14034/14034513.png"
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
              src="https://cdn-icons-png.freepik.com/512/10976/10976481.png"
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
              src="https://cdn-icons-png.freepik.com/512/10976/10976481.png"
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

        <p className={styles.loginLink}>
          Уже есть аккаунт?{' '}
          <a href="/login" className={styles.link}>
            Войти
          </a>
        </p>
      </div>
    </div>
  )
}