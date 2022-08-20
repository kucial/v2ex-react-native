import { getScreenInfo } from '../url'
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
  })
})
