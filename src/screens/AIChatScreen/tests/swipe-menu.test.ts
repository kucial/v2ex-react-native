import { shouldOpenSwipeMenu } from '../swipe-menu'

const base = {
  currentPosition: 0,
  menuWidth: 320,
  translationX: 0,
  velocityX: 0,
}

describe('shouldOpenSwipeMenu', () => {
  it('opens after crossing the resting position threshold', () => {
    expect(
      shouldOpenSwipeMenu({ ...base, currentPosition: 60 }),
    ).toBe(true)
  })

  it('uses drag direction when the gesture has clear intent', () => {
    expect(
      shouldOpenSwipeMenu({
        ...base,
        currentPosition: 300,
        translationX: -20,
      }),
    ).toBe(false)
    expect(
      shouldOpenSwipeMenu({ ...base, translationX: 20 }),
    ).toBe(true)
  })

  it('uses velocity to finish a short flick', () => {
    expect(
      shouldOpenSwipeMenu({ ...base, velocityX: 200 }),
    ).toBe(true)
    expect(
      shouldOpenSwipeMenu({
        ...base,
        currentPosition: 300,
        velocityX: -200,
      }),
    ).toBe(false)
  })
})
