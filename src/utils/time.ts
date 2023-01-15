export const localTime = (val: string | number) => {
  return new Date(val).toLocaleString()
}
