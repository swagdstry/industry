export const metadata = {
  title: 'Industry',
  description: 'Фото для друзей',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{
        margin: 0,
        maxWidth: '420px',
        marginInline: 'auto',
        background: '#000',
        color: '#fff',
        fontFamily: 'system-ui',
        minHeight: '100vh'
      }}>
        {children}
      </body>
    </html>
  )
}
