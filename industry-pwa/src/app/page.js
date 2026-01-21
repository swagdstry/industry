'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      background: '#000',
      color: '#fff'
    }}>
      <h1>Industry</h1>
      <button onClick={() => router.push('/login')}>
        Войти
      </button>
    </main>
  )
}
