import { Cheerio, CheerioAPI, Element } from 'cheerio'

import {
  MemberBasic,
  NodeBasic,
  TopicBasic,
  TopicReply,
} from '@/utils/v2ex-client/types'

import { BASE_URL } from './constants'

const resolveUrl = (url?: string) => {
  if (!url) {
    return url
  }
  if (url.startsWith('/')) {
    return `${BASE_URL}${url}`
  }
  return url
}

export function topicFromLink($el: Cheerio<Element>): TopicBasic {
  const [id, replies] = $el.attr('href')!.match(/\d+/g)!.map(Number)
  return {
    id,
    title: $el.text(),
    replies,
  }
}

export function nodeFromLink($el: Cheerio<Element>): NodeBasic {
  return {
    title: $el.text().trim(),
    name: $el.attr('href')!.replace(/.*\/go\//, ''),
  }
}

export function memberFromImage($el: Cheerio<Element>): MemberBasic {
  return {
    username: $el.attr('alt') as string,
    avatar_normal: resolveUrl($el.attr('src')) as string,
  }
}

export function paginationFromText(str: string) {
  const [current, total] = str.split('/')
  return {
    current: Number(current),
    total: Number(total),
  }
}

export function topicDetailFromPage($: CheerioAPI, id: string | number) {
  const member = memberFromImage(
    $('#Wrapper .header a[href^="/member"] img').first(),
  )
  const node = nodeFromLink($('#Wrapper .header a[href^="/go"]').first())
  const title = $('#Wrapper .header h1').text().trim()
  const content_rendered =
    $('#Wrapper .cell .topic_content').html()?.trim() || ''

  let replies = 0
  let last_reply_time
  if ($('.cell[id^=r_]').length) {
    const compos = $('.cell[id^=r_]')
      .parent()
      .children()
      .first()
      .text()
      .trim()
      .split('•')
    replies = Number(compos[0].replace('条回复', ''))
    last_reply_time = compos[1] && compos[1].trim()
  }
  const metaText = $('#Wrapper .header > small.gray').text()
  const metaMatch = /\sat\s(.*)/.exec(metaText)
  const created_time = metaMatch ? metaMatch[1].split('·')[0].trim() : ''
  const clicks = metaMatch
    ? Number(/\d+/.exec(metaMatch[1].split('·')[1])![0])
    : 0
  const subtles = $('#Wrapper .content .subtle')
    .map(function (i, el) {
      return {
        meta: $(el).find('.fade').text().trim(),
        content_rendered: $(el).find('.topic_content').html()?.trim(),
      }
    })
    .get()
  return {
    id: Number(id),
    title,
    content_rendered,
    replies,
    last_reply_time,
    created_time,
    clicks,
    node,
    member,
    subtles,
    collected: !!$('a.op[href^="/unfavorite"]').length,
    thanked: !!$('#topic_thank .topic_thanked').length,
    canAppend: !!$('a[href^="/append/topic"]').length,
    blocked: $('a.tb')
      .map((i, el) => $(el).text())
      .get()
      .some((val) => val === '取消忽略'),
  }
}

export function topicReplyFromCell(
  $el: Cheerio<Element>,
  $: CheerioAPI,
): TopicReply {
  const member = memberFromImage($el.find('img.avatar').first())
  const content_rendered = $el.find('.reply_content').html()
  const members_mentioned = $el
    .find('.reply_content a[href^="/member/"]')
    .map(function (j, a) {
      return $(a).text().trim()
    })
    .get()

  const $clonedContent = $el.find('.reply_content').clone()
  $clonedContent.find('img').each(function (i, el) {
    $(el).replaceWith($(`<span>${el.attribs.src}</span>`))
  })
  // 用户链接处理
  $clonedContent.find('a[href^="/member/"]').each(function (i, el) {
    $(el).replaceWith(`[${$(el).text()}](https://v2ex.com${el.attribs.href})`)
  })
  // 自动链接处理
  $clonedContent.find('a').each(function (i, el) {
    const $el = $(el)
    if ($el.attr('href') === $el.text()) {
      $el.replaceWith($el.text())
    }
  })

  const content = getMarkdown($clonedContent.html())

  const replyInfo = $el
    .find('td:nth-child(3) span.fade.small')
    .first()
    .text()
    .trim()
  // let reply_time
  // let reply_device
  const [reply_time, reply_device] = replyInfo.split(' via ')
  const heartImg = $el
    .find('td:nth-child(3) span.small.fade img[alt="❤️"]')
    .first()
  const thanks_count = heartImg ? Number(heartImg.parent().text().trim()) : 0
  return {
    id: Number($el.attr('id').replace('r_', '')),
    content,
    content_rendered,
    member,
    reply_time,
    reply_device,
    thanks_count,
    thanked: !!$el.find('.thanked').length,
    num: Number($el.find('.no').text()),
    member_is_op: !!$el.find('.badge.op').length,
    member_is_mod: !!$el.find('.badge.mod').length,
    members_mentioned,
  }
}

export function userMetaForCurrentUser($: CheerioAPI) {
  return {
    blocked: !!$('.button[value=Unblock]').length,
    watched: !!$('.inverse[value=取消特别关注]').length,
  }
}

export function nodeDetailFromPage($: CheerioAPI, name: string) {
  const avatar_large = $('.page-content-header img').attr('src')

  const title = $('.node-breadcrumb').text().split(/\s+/).reverse()[0]
  const header = $('.intro').html()
  const topics = Number($('.topic-count strong').text()) || 0
  const collected = !!$('a[href^="/unfavorite/node"]').length
  return {
    name,
    title,
    header,
    topics,
    avatar_large,
    collected,
  }
}

export function getMarkdown(html: string) {
  return html
    .replace(/<br><br>/g, '\n\n')
    .replace(/(```\w+)<br>/g, `$1\n`)
    .replace(/<br>/g, '\n\n')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}
