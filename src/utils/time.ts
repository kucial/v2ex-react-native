import TimeAgo from 'javascript-time-ago'
import zh from 'javascript-time-ago/locale/zh.json'

TimeAgo.addDefaultLocale(zh)
const timeAgo = new TimeAgo('zh')

export const formatTimeAgo = (val: number | string | Date) => {
  if (!val) {
    return ''
  }
  const date =
    typeof val === 'number' && val < 10000000000
      ? new Date(val * 1000)
      : new Date(val)
  return timeAgo.format(date)
}

export const localTime = (val: string | number) => {
  return new Date(val).toLocaleString()
}

export const formatDate = (
  date: Date | string | number,
  format = 'YYYY-MM-DD',
) => {
  const d = new Date(date)
  switch (format) {
    case 'YYYY-MM-DD':
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
  }
}
