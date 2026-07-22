import { redirectImgurOAuthSystemPath } from '@/utils/imgur-oauth'

export function redirectSystemPath({
  path,
}: {
  path: string
  initial: boolean
}) {
  try {
    return redirectImgurOAuthSystemPath(path)
  } catch {
    return path
  }
}
