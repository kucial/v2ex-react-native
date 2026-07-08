import {
  getEmojiTextFromImgurUrl,
  getTrueEmojiFromImgurUrl,
  isV2exPolishImgurEmoji,
  replaceImgurImagesWithTrueEmoji,
} from '../v2ex-polish-emojis'

describe('v2ex-polish-emojis utility', () => {
  it('identifies V2EX Polish Imgur emoji URLs correctly', () => {
    expect(isV2exPolishImgurEmoji('https://i.imgur.com/agAJ0Rd.png')).toBe(true)
    expect(isV2exPolishImgurEmoji('https://i.imgur.com/HZL0hOa.png')).toBe(true)
    expect(isV2exPolishImgurEmoji('https://i.imgur.com/notanemoji.png')).toBe(
      false,
    )
  })

  it('maps Imgur URLs back to text emojis and true emojis', () => {
    expect(getEmojiTextFromImgurUrl('https://i.imgur.com/agAJ0Rd.png')).toBe(
      '[doge]',
    )
    expect(getTrueEmojiFromImgurUrl('https://i.imgur.com/agAJ0Rd.png')).toBe(
      '🐶',
    )
    expect(
      getEmojiTextFromImgurUrl('https://i.imgur.com/unknown.png'),
    ).toBeUndefined()
  })

  it('replaces Imgur emoji image tags and anchor wrappers with true Unicode emoji characters', () => {
    const imgHtml = '<p><img src="https://i.imgur.com/agAJ0Rd.png" /></p>'
    expect(replaceImgurImagesWithTrueEmoji(imgHtml)).toBe('<p>🐶</p>')

    const anchorWrapped =
      '<p><a href="https://i.imgur.com/agAJ0Rd.png"><img src="https://i.imgur.com/agAJ0Rd.png" alt="[doge]" /></a></p>'
    expect(replaceImgurImagesWithTrueEmoji(anchorWrapped)).toBe('<p>🐶</p>')
  })

  it('replaces text emojis with true Unicode emoji characters', () => {
    const textHtml = '<p>Hello [doge] and [吃瓜]!</p>'
    const replaced = replaceImgurImagesWithTrueEmoji(textHtml)
    expect(replaced).toBe('<p>Hello 🐶 and 🍉!</p>')
  })
})
