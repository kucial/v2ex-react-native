interface Color {
  red: number
  green: number
  blue: number
}

interface Config {
  greyscaleDistance: number
}

class PixelTally {
  totalPixelCount: number
  colorPixelCount: number
  red: number
  green: number
  blue: number
  luminosity: number
  config: Config

  constructor(config: Config) {
    this.totalPixelCount = 0
    this.colorPixelCount = 0
    this.red = 0
    this.green = 0
    this.blue = 0
    this.luminosity = 0

    this.config = config
  }

  record(colors: Color): void {
    this.luminosity += this.calculateLuminosity(colors)
    this.totalPixelCount++

    if (this.isGreyscale(colors)) {
      return
    }

    this.red += colors.red
    this.green += colors.green
    this.blue += colors.blue

    this.colorPixelCount++
  }

  getAverage(colorName: 'red' | 'green' | 'blue'): number {
    return this[colorName] / this.colorPixelCount
  }

  getLuminosityAverage(): number {
    return this.luminosity / this.totalPixelCount
  }

  getNormalizingDenominator(): number {
    return Math.max(this.red, this.green, this.blue) / this.colorPixelCount
  }

  calculateLuminosity(colors: Color): number {
    return (colors.red + colors.green + colors.blue) / 3
  }

  isGreyscale(colors: Color): boolean {
    const { red, green, blue } = colors
    const greyscaleDistance = this.config.greyscaleDistance

    return (
      Math.abs(red - green) < greyscaleDistance &&
      Math.abs(red - blue) < greyscaleDistance
    )
  }
}

export default PixelTally
