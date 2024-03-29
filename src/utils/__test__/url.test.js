import {
  getImgurResourceImageLink,
  getScreenInfo,
  isAppLink,
  isImgurResourceLink,
  tailingFix,
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
    it('[topic link] http://v2ex.com/t/871066', () => {
      const info = getScreenInfo('http://v2ex.com/t/871066')
      expect(info.name).toBe('topic')
      expect(info.params.id).toBe('871066')
    })
    it('[topic link] https://v2ex.com/t/871066?p=1', () => {
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
    it('[menber replies] https://www.v2ex.com/member/wanacry/replies', () => {
      const info = getScreenInfo('https://www.v2ex.com/member/wanacry/replies')
      expect(info.name).toBe('member')
      expect(info.params.username).toBe('wanacry')
      expect(info.params.tab).toBe('replies')
    })
    it('[menber topics] https://www.v2ex.com/member/wanacry/replies', () => {
      const info = getScreenInfo('https://www.v2ex.com/member/wanacry/topics')
      expect(info.name).toBe('member')
      expect(info.params.username).toBe('wanacry')
      expect(info.params.tab).toBe('topics')
    })
  })

  describe('isAppLink', () => {
    const links = [
      'https://v2ex.com/go/create',
      'https://hk.v2ex.com/go/create',
      'https://www.v2ex.com/t/871066',
      'http://www.v2ex.com/t/871066',
      'http://v2ex.com/t/961132',
      'https://www.v2ex.com/member/wanacry/replies',
    ]
    for (const link of links) {
      it(link, () => {
        expect(isAppLink(link)).toBe(true)
      })
    }
  })

  describe('isImgurResourceLink', () => {
    const links = ['https://imgur.com/OforKLX', 'https://i.imgur.com/OforKLX']
    for (const link of links) {
      it(link, () => {
        expect(isImgurResourceLink(link)).toBe(true)
      })
    }
    const excepts = ['https://imgur.com/a/WdEWePU']
    for (const link of excepts) {
      it(link, () => {
        expect(isImgurResourceLink(link)).toBe(false)
      })
    }
  })

  describe('getImgurPostImageLink', () => {
    it('https://imgur.com/OforKLX', () => {
      const link = getImgurResourceImageLink('https://imgur.com/OforKLX')
      expect(link).toEqual('https://i.imgur.com/OforKLX.png')
    })
    it('https://i.imgur.com/OforKLX', () => {
      const link = getImgurResourceImageLink('https://i.imgur.com/OforKLX')
      expect(link).toEqual('https://i.imgur.com/OforKLX.png')
    })
    it('https://i.imgur.com/OforKLX.png', () => {
      const link = getImgurResourceImageLink('https://i.imgur.com/OforKLX.png')
      expect(link).toEqual('https://i.imgur.com/OforKLX.png')
    })
  })

  it('capture v2exlink', () => {
    const links = ['https://s.v2ex.com/t/1231']
    links.forEach((link) => {
      expect(/^https:\/\/([www|fast|s|hk]\.)?v2ex\.com/.test(link)).toBe(true)
    })
  })

  describe('tailingFixUrl', () => {
    it('https://s.v2ex.com/t/1231', () => {
      const url = 'https://s.v2ex.com/t/1231'
      expect(tailingFix(url)).toEqual('https://s.v2ex.com/t/1231')
    })
    it('https://www.pingti.xyz/)。', () => {
      const url = 'https://www.pingti.xyz/)。'
      expect(tailingFix(url)).toEqual('https://www.pingti.xyz/')
    })
    it('http://127.0.0.1:8888/', () => {
      const url = 'http://127.0.0.1:8888/;#搭建的论坛访问端口'
      expect(tailingFix(url)).toEqual('http://127.0.0.1:8888/')
    })
  })
})
