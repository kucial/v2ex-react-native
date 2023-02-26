import { getImagePath, getImgXtension } from '../image'

describe('image utils', () => {
  describe('getImgXtension', () => {
    it('https://pbs.twimg.com/media/FppS3KwaQAA_MDX?format=jpg&name=medium', () => {
      expect(
        getImgXtension(
          'https://pbs.twimg.com/media/FppS3KwaQAA_MDX?format=jpg&name=medium',
          'png',
        ),
      ).toBe('jpg')
    })
    it('https://i.imgur.com/hulrFFq.png', () => {
      expect(getImgXtension('https://i.imgur.com/hulrFFq.png', 'png')).toBe(
        'png',
      )
    })
  })
  it('getImagePath', async () => {
    const link =
      'https://pbs.twimg.com/media/FppS3KwaQAA_MDX?format=jpg&name=medium'
    const string = await getImagePath(link)
    console.log(link, string)
  })
})
