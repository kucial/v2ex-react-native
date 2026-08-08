import { load } from 'cheerio'

import { notificationFromCell } from '../helpers'

jest.mock('react-native-nitro-cookies', () => ({
  get: jest.fn().mockResolvedValue({}),
  set: jest.fn(),
  clearAll: jest.fn(),
}))

const parse = (cellHtml) => {
  const $ = load(`<div id="notifications">${cellHtml}</div>`)
  const el = $('#notifications .cell').get(0)
  return notificationFromCell($, el)
}

// Verbatim from Sentry V2EX-REACT-NATIVE-E4, wrapped in the `.cell` that
// V2EX renders around it.
const SOLANA_TIP_CELL = `
<div class="cell" id="n_25841461">
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tbody><tr>
      <td width="32" align="left" valign="top">
        <a href="/member/Livid" target="_blank"><img src="https://cdn.v2ex.com/avatar/c4ca/4238/1_normal.png?m=1785398719" class="avatar" border="0" align="default" width="24" style="width: 24px; max-height: 24px;" alt="Livid" data-uid="1"></a>
      </td>
      <td valign="middle">
        <span class="fade">收到来自 <a href="/member/Livid" target="_blank"><strong>Livid</strong></a> 的 Solana 打赏 › <a href="/solana/tips?view=received">0.005 SOL</a></span> &nbsp;
        <span class="snow">2025 年 8 月 9 日</span> &nbsp;
        <a href="#;" onclick="deleteNotification(25841461, 81753)" class="node">删除</a>
        <div class="sep5"></div>
        <div class="payload">
          Hello World
        </div>
      </td>
    </tr>
  </tbody></table>
</div>
`

const REPLY_CELL = `
<div class="cell" id="n_25000001">
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tbody><tr>
      <td width="32" align="left" valign="top">
        <a href="/member/foo" target="_blank"><img src="https://cdn.v2ex.com/avatar/abcd/1234/2_normal.png" class="avatar" border="0" width="24" alt="foo" data-uid="2"></a>
      </td>
      <td valign="middle">
        <span class="fade">在 <a href="/t/1234567#reply5">测试主题标题</a> 里回复了你</span> &nbsp;
        <span class="snow">2026-08-01 10:00:00 +08:00</span> &nbsp;
        <a href="#;" onclick="deleteNotification(25000001, 1)" class="node">删除</a>
        <div class="sep5"></div>
        <div class="payload">回复内容</div>
      </td>
    </tr>
  </tbody></table>
</div>
`

const THANK_CELL = REPLY_CELL.replace(
  '在 <a href="/t/1234567#reply5">测试主题标题</a> 里回复了你',
  '感谢了你发布的主题 <a href="/t/1234567">测试主题标题</a>',
)

describe('notificationFromCell', () => {
  it('parses a Solana tip notification', () => {
    const notification = parse(SOLANA_TIP_CELL)

    expect(notification).toMatchObject({
      id: 'n_25841461',
      action: 'solana_tip',
      amount: '0.005 SOL',
      time: '2025 年 8 月 9 日',
    })
    expect(notification.member.username).toBe('Livid')
    expect(notification.content_rendered).toBe('Hello World')
    expect(notification.topic).toBeUndefined()
  })

  it('parses a topic reply notification', () => {
    const notification = parse(REPLY_CELL)

    expect(notification).toMatchObject({
      id: 'n_25000001',
      action: 'reply',
      content_rendered: '回复内容',
    })
    expect(notification.member.username).toBe('foo')
    expect(notification.topic).toEqual({
      id: 1234567,
      title: '测试主题标题',
      replies: 5,
    })
  })

  it('detects the thank action', () => {
    expect(parse(THANK_CELL).action).toBe('thank')
  })

  it('returns null for an unrecognised cell so the caller can report it', () => {
    expect(
      parse(
        '<div class="cell" id="n_1"><img src="/avatar/1_normal.png" class="avatar" alt="foo"><span class="fade">某种新的通知 <a href="/somewhere/new">详情</a></span></div>',
      ),
    ).toBeNull()
  })

  it('returns null when the cell has no avatar', () => {
    expect(parse('<div class="cell"><span>nope</span></div>')).toBeNull()
  })
})
