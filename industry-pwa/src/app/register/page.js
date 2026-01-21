'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import '../login/login.css'

export default function Register() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nickname: '',
    realName: '',
    email: '',
    password: '',
    password2: '',
    promo: '',
  })

  const update = (k, v) => setForm({ ...form, [k]: v })

  const register = async () => {
    if (loading) return

    if (!form.nickname || !form.realName || !form.email || !form.password) {
      return alert('Заполни все обязательные поля')
    }

    if (form.password.length < 6) {
      return alert('Пароль минимум 6 символов')
    }

    if (form.password !== form.password2) {
      return alert('Пароли не совпадают')
    }

    setLoading(true)

    // 1️⃣ проверяем никнейм
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('nickname', form.nickname)
      .maybeSingle()

    if (existing) {
      setLoading(false)
      return alert('Никнейм уже занят')
    }

    // 2️⃣ создаём пользователя
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })

    if (signUpError) {
      setLoading(false)
      return alert(signUpError.message)
    }

    const user = signUpData.user
    if (!user) {
      setLoading(false)
      return alert('Ошибка создания пользователя')
    }

    // 3️⃣ создаём профиль
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        nickname: form.nickname,
        real_name: form.realName,
      })

    if (profileError) {
      setLoading(false)
      return alert(profileError.message)
    }

    // 🔜 промокоды подключим тут позже

    router.push('/home')
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <h1>Регистрация</h1>

        <input placeholder="Никнейм" onChange={e => update('nickname', e.target.value)} />
        <input placeholder="Имя" onChange={e => update('realName', e.target.value)} />
        <input placeholder="Email" onChange={e => update('email', e.target.value)} />

        <input type="password" placeholder="Пароль" onChange={e => update('password', e.target.value)} />
        <input type="password" placeholder="Повтор пароля" onChange={e => update('password2', e.target.value)} />

        <details>
          <summary style={{ color: '#aaa', cursor: 'pointer' }}>
            Промокод (если есть)
          </summary>
          <input placeholder="Промокод" onChange={e => update('promo', e.target.value)} />
        </details>

        <button onClick={register} disabled={loading}>
          {loading ? 'Создание...' : 'Создать аккаунт'}
        </button>
      </div>
    </div>
  )
}
