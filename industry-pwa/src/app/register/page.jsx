'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './register.module.css'  // ← подключи свой CSS-модуль

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
    // ... твоя логика регистрации с Supabase (как раньше)
    // ...
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Регистрация</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* Никнейм */}
          <div className={styles.inputGroup}>
            <img 
              src="https://cdn-icons-png.freepik.com/512/6543/6543037.png?ga=GA1.1.1203493570.1768999323" 
              alt="User" 
              className={styles.inputIcon} 
              width={20} 
              height={20} 
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

          {/* Имя */}
          <div className={styles.inputGroup}>
            <img 
              src="https://cdn-icons-png.freepik.com/512/6102/6102898.png?ga=GA1.1.1203493570.1768999323  " 
              alt="Person" 
              className={styles.inputIcon} 
              width={20} 
              height={20} 
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

          {/* Email */}
          <div className={styles.inputGroup}>
            <img 
              src="https://cdn-icons-png.freepik.com/512/14034/14034513.png?ga=GA1.1.1203493570.1768999323" 
              alt="Email" 
              className={styles.inputIcon} 
              width={20} 
              height={20} 
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

          {/* Пароль */}
          <div className={styles.inputGroup}>
            <img 
              src="https://cdn-icons-png.freepik.com/512/10976/10976481.png?ga=GA1.1.1203493570.1768999323" 
              alt="Lock" 
              className={styles.inputIcon} 
              width={20} 
              height={20} 
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

          {/* Повтор пароля */}
          <div className={styles.inputGroup}>
            <img 
              src="https://cdn-icons-png.freepik.com/512/10976/10976481.png?ga=GA1.1.1203493570.1768999323" 
              alt="Lock" 
              className={styles.inputIcon} 
              width={20} 
              height={20} 
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
            {loading ? 'Создание...' : 'Создать аккаунт'}
          </button>
        </form>
      </div>
    </div>
  )
}