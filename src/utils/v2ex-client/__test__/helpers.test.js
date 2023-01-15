import { getMarkdown } from '../helpers'

describe('getMarkdown', () => {
  it('example 01', () => {
    const html =
      "@<span>[hua123s](https://v2ex.com/member/hua123s)</span> 我之前写出来大概是这样：<br>```typescript<br>type GetRoutes&lt;T&gt; = T extends `${infer Path}/:${infer Param}` ? `${Path}/${string}` : T;<br>type RoutesType = GetRoutes&lt;'/home' | '/login' | '/user/:id'&gt;<br>```<br>但是在实际的代码提示里就只显示 '/home' 和 '/login' 了，使用 '/user/123' 倒是能通过类型检测，但是没有代码提示...<br>btw: 头像是燕姿耶"
    const output = getMarkdown(html)
    expect(output).toBe(
      "@<span>[hua123s](https://v2ex.com/member/hua123s)</span> 我之前写出来大概是这样：\n\n```typescript\ntype GetRoutes<T> = T extends `${infer Path}/:${infer Param}` ? `${Path}/${string}` : T;\n\ntype RoutesType = GetRoutes<'/home' | '/login' | '/user/:id'>\n\n```\n\n但是在实际的代码提示里就只显示 '/home' 和 '/login' 了，使用 '/user/123' 倒是能通过类型检测，但是没有代码提示...\n\nbtw: 头像是燕姿耶",
    )
  })
  it('example 02', () => {
    const html = `你是在找 <a target="_blank" href="https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html" rel="nofollow noopener">https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html</a>`
    expect(getMarkdown(html)).toEqual(
      `你是在找 <a target="_blank" href="https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html" rel="nofollow noopener">https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html</a>`,
    )
  })
  it('example 03', () => {
    const html = `它们不是「被不同颜色」穿插<br><br>仅仅是被「容易混淆的颜色」穿插了<br><br>如果你感到辨识困难说明你的色觉、辨色能力就是相对弱。<br><br><br><a target="_blank" href="https://i.imgur.com/hulrFFq.png" rel="nofollow noopener"><span>https://i.imgur.com/hulrFFq.png</span></a><br>看这个重新标记的图，<br>标红的点是「土黄 /黄泥带青苔」色，其绿色分量非常小，但由于它临近标成黑色的那几个偏蓝绿的点，所以辨色较强的人还是可以比较轻易地把它与标黑的「绿」点连起来。<br>但如果辨色较弱，标黑的点与标 cyan （青）色的点区别不大，标红的点与标青的点完全区分不开，他就会把红黑青连起来，打断了纯绿的连线，这样他就比较难看出绿色系的字母`
    expect(getMarkdown(html)).toEqual(
      `它们不是「被不同颜色」穿插\n\n仅仅是被「容易混淆的颜色」穿插了\n\n如果你感到辨识困难说明你的色觉、辨色能力就是相对弱。\n\n\n\n<a target="_blank" href="https://i.imgur.com/hulrFFq.png" rel="nofollow noopener"><span>https://i.imgur.com/hulrFFq.png</span></a>\n\n看这个重新标记的图，\n\n标红的点是「土黄 /黄泥带青苔」色，其绿色分量非常小，但由于它临近标成黑色的那几个偏蓝绿的点，所以辨色较强的人还是可以比较轻易地把它与标黑的「绿」点连起来。\n\n但如果辨色较弱，标黑的点与标 cyan （青）色的点区别不大，标红的点与标青的点完全区分不开，他就会把红黑青连起来，打断了纯绿的连线，这样他就比较难看出绿色系的字母`,
    )
  })
})
