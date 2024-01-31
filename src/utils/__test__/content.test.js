import { extractBase64Decoded } from '../content'

describe('content utils', () => {
  describe('extractBase64Decoded', () => {
    it('sample 01', () => {
      const text = `做为一个 10 年.net ，虽然已经转其他语言了。好奇为什么一定是.net 呢？古早项目 aspx 可以联系下。
                    BASE64: YWNrbWFuNzc3`
      expect(extractBase64Decoded(text)).toEqual([
        ['YWNrbWFuNzc3', 'ackman777'],
      ])
    })
    it('sample 02', () => {
      const text = `容量 64G 即可，版本无所谓。
      绿色：MTc4OTg4NzgwNjE=`
      expect(extractBase64Decoded(text)).toEqual([
        ['MTc4OTg4NzgwNjE=', '17898878061'],
      ])
    })
    it('sample 03', () => {
      const text = `希望是熟手，如果技术底蕴可以，入手 php 快的也可以聊。 可以联系 绿信： MjE2OTU2NDM2Ngo= （备注 php ）`
      expect(extractBase64Decoded(text)).toEqual([
        ['MjE2OTU2NDM2Ngo=', '2169564366'],
      ])
    })
    it('sample 04', () => {
      const text = `普通文本段落`
      expect(extractBase64Decoded(text)).toBeFalsy()
    })
    it('sample 05', () => {
      const text = `想问问 “U3BvdGlmeUNhdA==” 这是啥社交软件的码？微信是了一下搜不到`
      expect(extractBase64Decoded(text)).toEqual([
        ['U3BvdGlmeUNhdA==', 'SpotifyCat'],
      ])
    })
  })
})
