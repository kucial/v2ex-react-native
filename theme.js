import colors from 'tailwindcss/colors'
export const light = {
  dark: false,
  colors: {
    background: 'rgb(242, 242, 242)',
    border: 'rgb(216, 216, 216)',
    card: 'rgb(255, 255, 255)',
    notification: 'rgb(255, 59, 48)',
    primary: colors.neutral[900],
    text: 'rgb(28, 28, 30)'
  }
}

export const dark = {
  dark: true,
  colors: {
    background: '#101010',
    border: '#525252', // neutral[600]
    card: '#171717', // neutral[900]
    notification: '#f43f5e', // rose[500]
    primary: colors.amber[50], // amber[50]
    text: '#e5e5e5' // neutral[200]
  }
}
