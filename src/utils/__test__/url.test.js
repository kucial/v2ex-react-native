import {
  getImgurPostImageLink,
  getScreenInfo,
  isAppLink,
  isImgurPostLink,
} from '../url'
describe('url utils', () => {
  describe('getScreenInfo', () => {
    it('[topic link] https://www.v2ex.com/t/871066', () => {
      const info = getScreenInfo('https://www.v2ex.com/t/871066')
      expect(info.name).toBe('topic')
      expect(info.params.id).toBe('871066')
    })
    it('[topic link] https://v2ex.com/t/871066', () => {
      const info = getScreenInfo('https://v2ex.com/t/871066')
      expect(info.name).toBe('topic')
      expect(info.params.id).toBe('871066')
    })
    it('[topic link] https://www.v2ex.com/t/871066#reply31', () => {
      const info = getScreenInfo('https://www.v2ex.com/t/871066#reply31')
      expect(info.name).toBe('topic')
      expect(info.params.id).toBe('871066')
    })
    it('[topic link] https://v2ex.com/t/871066#reply31', () => {
      const info = getScreenInfo('https://v2ex.com/t/871066#reply31')
      expect(info.name).toBe('topic')
      expect(info.params.id).toBe('871066')
    })
    // member link
    it('[member link] https://v2ex.com/member/kongkx', () => {
      const info = getScreenInfo('https://v2ex.com/member/kongkx')
      expect(info.name).toBe('member')
      expect(info.params.username).toBe('kongkx')
    })
    // node link
    it('[node link] https://v2ex.com/go/create', () => {
      const info = getScreenInfo('https://v2ex.com/go/create')
      expect(info.name).toBe('node')
      expect(info.params.name).toBe('create')
    })
    // hk link
    it('[hk link] https://hk.v2ex.com/t/2343', () => {
      const info = getScreenInfo('https://hk.v2ex.com/t/2343')
      expect(info.name).toBe('topic')
      expect(info.params.id).toBe('2343')
    })
  })

  describe('isAppLink', () => {
    const links = [
      'https://v2ex.com/go/create',
      'https://hk.v2ex.com/go/create',
      'https://www.v2ex.com/t/871066',
      'http://www.v2ex.com/t/871066',
    ]
    for (const link of links) {
      it(link, () => {
        expect(isAppLink(link)).toBe(true)
      })
    }
  })

  describe('isImgurPostLink', () => {
    const links = ['https://imgur.com/OforKLX']
    for (const link of links) {
      it(link, () => {
        expect(isImgurPostLink(link)).toBe(true)
      })
    }
  })

  describe('getImgurPostImageLink', () => {
    it('https://imgur.com/OforKLX', () => {
      const link = getImgurPostImageLink('https://imgur.com/OforKLX')
      expect(link).toEqual('https://i.imgur.com/OforKLX.png')
    })
  })
})
