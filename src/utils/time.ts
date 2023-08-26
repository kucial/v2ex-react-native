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
