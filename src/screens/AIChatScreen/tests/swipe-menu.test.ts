import { shouldOpenSwipeMenu } from '../swipe-menu-threshold'

const base = {
  currentPosition: 0,
  menuWidth: 320,
  velocityX: 0,
}

describe('shouldOpenSwipeMenu', () => {
  it('settles by the release position, not the drag direction', () => {
    // Dragged most of the way open and let go: it stays open even though the
    // finger had already started coming back.
    expect(
      shouldOpenSwipeMenu({ ...base, currentPosition: 200, velocityX: -80 }),
    ).toBe(true)
    // A short pull that never reached halfway falls back closed.
    expect(shouldOpenSwipeMenu({ ...base, currentPosition: 120 })).toBe(false)
    expect(shouldOpenSwipeMenu({ ...base, currentPosition: 200 })).toBe(true)
  })

  it('counts leftover momentum as extra travel', () => {
    // 145px is short of the 160px midpoint, but still moving right at 400px/s.
    expect(
      shouldOpenSwipeMenu({ ...base, currentPosition: 145, velocityX: 400 }),
    ).toBe(true)
    expect(
      shouldOpenSwipeMenu({ ...base, currentPosition: 175, velocityX: -400 }),
    ).toBe(false)
  })

  it('lets a decisive flick win from anywhere', () => {
    expect(
      shouldOpenSwipeMenu({ ...base, currentPosition: 30, velocityX: 900 }),
    ).toBe(true)
    expect(
      shouldOpenSwipeMenu({ ...base, currentPosition: 300, velocityX: -900 }),
    ).toBe(false)
  })
})
