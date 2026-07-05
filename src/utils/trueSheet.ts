type SheetHandle = {
  present(index?: number): Promise<void> | void
  dismiss(): Promise<void> | void
}

const isMissingSheetError = (err: unknown) => {
  return err instanceof Error && /No sheet found with tag/.test(err.message)
}

const handleSheetError = (err: unknown) => {
  if (isMissingSheetError(err)) {
    return
  }

  if (__DEV__) {
    console.warn('TrueSheet action failed', err)
  }
}

// All present/dismiss calls run through a single serial queue. Triggering a
// native present/dismiss while another sheet's animation is still in flight
// fails silently and can leave a sheet stuck on screen (e.g. dismissing the
// stacked conversation + user-info sheets when navigating away from a topic).
let sheetActionQueue: Promise<void> = Promise.resolve()

const enqueueSheetAction = (action: () => Promise<void> | void) => {
  sheetActionQueue = sheetActionQueue.then(() => {
    try {
      return Promise.resolve(action()).catch(handleSheetError)
    } catch (err) {
      handleSheetError(err)
    }
  })
}

export const presentSheet = (
  sheet: SheetHandle | null | undefined,
  index?: number,
) => {
  enqueueSheetAction(() => sheet?.present(index))
}

export const dismissSheet = (sheet: SheetHandle | null | undefined) => {
  enqueueSheetAction(() => sheet?.dismiss())
}
