// Kept apart from `swipe-menu.ts` so the decision can be tested on its own:
// that module pulls in Reanimated, which needs the native runtime.

// Where the surface sits when the finger lifts decides the outcome — past the
// halfway point it settles open — and the momentum still in the gesture counts
// as a bit of extra travel.
const OPEN_POSITION_RATIO = 0.5
const VELOCITY_PROJECTION_SECONDS = 0.06
// A flick this fast reads as an explicit direction, whatever the position is.
const FLICK_VELOCITY = 550

type SwipeEndState = {
  currentPosition: number
  menuWidth: number
  velocityX: number
}

export function shouldOpenSwipeMenu({
  currentPosition,
  menuWidth,
  velocityX,
}: SwipeEndState) {
  'worklet'

  if (Math.abs(velocityX) >= FLICK_VELOCITY) {
    return velocityX > 0
  }

  const projected = currentPosition + velocityX * VELOCITY_PROJECTION_SECONDS
  return projected > menuWidth * OPEN_POSITION_RATIO
}
