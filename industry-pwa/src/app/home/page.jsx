'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import styles from './home.module.css'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAndUpdateUser = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.replace('/login')
      return null
    }

    // Проверяем и создаём профиль если нужно
    let profile = null
    const { data: existing, error: fetchError } = await supabase
      .from('profiles')
      .select('username, full_name, role, last_seen')
      .eq('id', session.user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // записи нет
        console.log('Профиля нет — создаём')
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            username: session.user.user_metadata?.username || 'user_' + session.user.id.slice(0, 8),
            full_name: session.user.user_metadata?.full_name || '',
            role: 'user',
            last_seen: new Date().toISOString()
          })

        if (insertError) {
          console.error('Ошибка создания профиля:', insertError)
          toast.error('Не удалось создать профиль')
          return null
        }

        // Получаем только что созданный профиль
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('username, full_name, role, last_seen')
          .eq('id', session.user.id)
          .single()

        profile = newProfile
      } else {
        console.error('Ошибка загрузки профиля:', fetchError)
        toast.error('Ошибка загрузки профиля')
        return null
      }
    } else {
      profile = existing
    }

    // Обновляем last_seen при каждом вызове функции
    await supabase
      .from('profiles')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', session.user.id)

    return {
      id: session.user.id,
      email: session.user.email,
      username: profile.username || 'Пользователь',
      fullName: profile.full_name || '',
      role: profile.role || 'user',
      avatar: session.user.user_metadata?.avatar_url || null,
      last_seen: new Date().toISOString(), // используем текущее время после обновления
    }
  }

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const userData = await fetchAndUpdateUser()
      if (mounted && userData) {
        setUser(userData)
        setLoading(false)
      }
    }

    init()

    // Автообновление каждые 30 секунд (чтобы last_seen обновлялся и статус "онлайн" работал)
    const interval = setInterval(async () => {
      const userData = await fetchAndUpdateUser()
      if (mounted && userData) {
        setUser(userData)
      }
    }, 30000) // 30 секунд — оптимально для "онлайн"

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error('Ошибка выхода')
    } else {
      toast.success('Вы вышли')
      router.push('/')
      router.refresh()
    }
  }

  // Функция для определения онлайн-статуса
  const isOnline = (lastSeen) => {
    if (!lastSeen) return false
    const now = new Date()
    const last = new Date(lastSeen)
    const diffMs = now - last
    return diffMs < 120000 // 2 минуты
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  const online = isOnline(user.last_seen)

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.welcome}>
          Добро пожаловать, {user.fullName || user.username}!
        </h1>

        <p className={styles.subtitle}>
          Здесь будут твои личные моменты и близкие люди
        </p>

        <div className={styles.placeholder}>
          <p>Пока тут пусто. Скоро появятся фото от друзей и камера.</p>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerLeft}>
          <div className={styles.logoWrapper}>
            <span className={styles.logo}>I</span>
          </div>
        </div>

        <div className={styles.footerRight}>
          <div className={styles.userBlock}>
            <div className={styles.avatarWrapper}>
              {user.avatar ? (
                <img src={user.avatar} alt="Аватар" className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user.username[0].toUpperCase()}
                </div>
              )}
              {online && <span className={styles.onlineDot} />}
            </div>

            <div className={styles.userInfo}>
              <span className={styles.username}>@{user.username}</span>

              {/* Бейдж роли */}
              <div className={styles.roleBadgeContainer}>
                {user.role === 'moderator' && (
                  <img
                    src="https://img.icons8.com/?size=48&id=cR42Mgi2Jndn&format=png"
                    alt="Модератор"
                    className={styles.roleBadge}
                    title="Модератор"
                  />
                )}
                {user.role === 'admin' && (
                  <img
                    src="https://img.icons8.com/?size=48&id=rEbDYTmg9KE6&format=png"
                    alt="Админ"
                    className={styles.roleBadge}
                    title="Администратор"
                  />
                )}
                {user.role === 'premium_user' && (
                  <span className={styles.roleBadge} title="Premium">✨</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.icons}>
            <button className={styles.iconBtn} title="Настройки">⚙️</button>
            <button className={styles.iconBtn} title="FAQ">?</button>
            <button className={styles.iconBtn} title="Выйти" onClick={handleLogout}>🚪</button>
          </div>
        </div>
      </footer>
    </div>
  )
}