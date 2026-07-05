type SheetHandle = {
  present(index?: number): Promise<void> | void
  dismiss(): Promise<void> | void
}

const isMissingSheetError = (err: unknown) => {
  return err instanceof Error && /No sheet found with tag/.test(err.message)
}

const handleSheetResult = (result: Promise<void> | void | undefined) => {
  if (!result) {
    return
  }

  result.catch((err: unknown) => {
    if (isMissingSheetError(err)) {
      return
    }

    if (__DEV__) {
      console.warn('TrueSheet action failed', err)
    }
  })
}

export const presentSheet = (
  sheet: SheetHandle | null | undefined,
  index?: number,
) => {
  handleSheetResult(sheet?.present(index))
}

export const dismissSheet = (sheet: SheetHandle | null | undefined) => {
  handleSheetResult(sheet?.dismiss())
}
