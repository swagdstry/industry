'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import './register.css'

export default function RegisterPage() {
  const [form, setForm] = useState({
    nickname: '',
    realName: '',
    email: '',
    password: '',
    repeatPassword: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    if (!form.nickname.trim()) {
      return setError('Никнейм обязателен')
    }

    if (form.password !== form.repeatPassword) {
      return setError('Пароли не совпадают')
    }

    setLoading(true)

    // 🔍 Проверка уникальности ника
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('nickname', form.nickname)
      .single()

    if (existing) {
      setLoading(false)
      return setError('Этот никнейм уже занят')
    }

    // 🔐 Регистрация
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nickname: form.nickname,
          real_name: form.realName,
        },
      },
    })

    if (signUpError) {
      setLoading(false)
      return setError(signUpError.message)
    }

    setSuccess('Мы отправили письмо для подтверждения почты 📩')
    setLoading(false)
  }

  return (
    <div className="register-root">
      <div className="register-card">
        <h1>Регистрация</h1>

        <input name="nickname" placeholder="Никнейм" onChange={handleChange} />
        <input name="realName" placeholder="Имя" onChange={handleChange} />
        <input name="email" placeholder="Почта" onChange={handleChange} />
        <input type="password" name="password" placeholder="Пароль" onChange={handleChange} />
        <input
          type="password"
          name="repeatPassword"
          placeholder="Повтор пароля"
          onChange={handleChange}
        />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Создание...' : 'Создать аккаунт'}
        </button>
      </div>
    </div>
  )
}
