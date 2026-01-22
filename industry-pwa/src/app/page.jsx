'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './page.module.css'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Уже залогинен → сразу в приложение
        router.replace('/home')
      } else {
        setChecking(false)
      }
    }

    checkSession()
  }, [router])

  if (checking) {
    return (
      <div className={styles.loading}>
        Загрузка...
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Industry</h1>

        <p className={styles.slogan}>
          Личные моменты только для близких.<br />
          Без ленты. Без шума. Мгновенно.
        </p>

        <button
          className={styles.joinButton}
          onClick={() => router.push('/register')}
        >
          Присоединиться
        </button>
      </div>
    </div>
  )
}