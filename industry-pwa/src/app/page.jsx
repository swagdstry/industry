'use client'

import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function Home() {
  const router = useRouter()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Industry</h1>

        <p className={styles.slogan}>
          Личные моменты только для близких.  
          Без ленты. Без шума. Мгновенно.
        </p>

        <button
          className={styles.joinButton}
          onClick={() => router.push('/login')}
        >
          Присоединиться
        </button>
      </div>
    </div>
  )
}