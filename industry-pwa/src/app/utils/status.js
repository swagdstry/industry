// src/utils/status.js
export function getOnlineStatus(lastSeen) {
  if (!lastSeen) return 'был(а) давно'

  const now = new Date()
  const last = new Date(lastSeen)
  const diffMs = now - last
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 2) {
    return 'онлайн'
  } else if (diffMin < 60) {
    return `был(а) ${diffMin} мин назад`
  } else if (diffMin < 1440) { // меньше суток
    const hours = Math.floor(diffMin / 60)
    return `был(а) ${hours} ч назад`
  } else {
    const days = Math.floor(diffMin / 1440)
    return `был(а) ${days} дн назад`
  }
}