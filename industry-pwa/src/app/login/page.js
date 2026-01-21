'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import './login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAuth = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // если юзера нет — регистрируем
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        alert(signUpError.message)
      } else {
        router.push('/home')
      }
    } else {
      router.push('/home')
    }

    setLoading(false)
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <h1>industry</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button onClick={handleAuth} disabled={loading}>
          {loading ? 'Загрузка…' : 'Войти'}
        </button>
        <p style={{ color: '#888', textAlign: 'center' }}>
          Нет аккаунта? <a href="/register">Регистрация</a>
        </p>

      </div>
    </div>
  )
}
