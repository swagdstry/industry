// src/app/layout.jsx
import { Toaster } from 'sonner'
import './globals.css' // или твой глобальный css

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Toaster 
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: '#111',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '16px 24px',
              fontFamily: 'system-ui, sans-serif',
            },
            success: {
              style: {
                borderLeft: '4px solid #4caf50',
              },
            },
            error: {
              style: {
                borderLeft: '4px solid #ff4d4d',
              },
            },
          }}
        />
      </body>
    </html>
  )
}