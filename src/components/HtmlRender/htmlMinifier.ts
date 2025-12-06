/**
 * Simple HTML minifier focused on collapseWhitespace functionality
 * Removes unnecessary whitespace between HTML tags while preserving
 * whitespace in pre, script, style, and textarea tags
 */

/**
 * Tags that should preserve whitespace inside them
 */
const PRESERVE_WHITESPACE_TAGS = new Set(['pre', 'script', 'style', 'textarea'])

/**
 * Block-level tags that typically don't need whitespace around them
 */
const BLOCK_TAGS = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'body',
  'br',
  'caption',
  'center',
  'col',
  'colgroup',
  'dd',
  'details',
  'dialog',
  'dir',
  'div',
  'dl',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'legend',
  'li',
  'main',
  'menu',
  'nav',
  'ol',
  'p',
  'section',
  'summary',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
])

/**
 * Collapses whitespace in text content
 * @param text - Text content to process
 * @returns Processed text with collapsed whitespace
 */
function collapseWhitespace(text: string): string {
  // Replace sequences of whitespace with a single space
  return text.replace(/\s+/g, ' ')
}

/**
 * Parses HTML into tokens (tags and text)
 */
interface Token {
  type: 'tag' | 'text' | 'comment' | 'doctype'
  content: string
  tagName?: string
  isClosing?: boolean
  isSelfClosing?: boolean
}

function tokenize(html: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < html.length) {
    // Check for tag
    if (html[i] === '<') {
      // Comment
      if (html.substring(i, i + 4) === '<!--') {
        const endIndex = html.indexOf('-->', i + 4)
        if (endIndex !== -1) {
          tokens.push({
            type: 'comment',
            content: html.substring(i, endIndex + 3),
          })
          i = endIndex + 3
          continue
        }
      }

      // Doctype
      if (html.substring(i, i + 9).toLowerCase() === '<!doctype') {
        const endIndex = html.indexOf('>', i)
        if (endIndex !== -1) {
          tokens.push({
            type: 'doctype',
            content: html.substring(i, endIndex + 1),
          })
          i = endIndex + 1
          continue
        }
      }

      // Regular tag
      const tagMatch = html
        .substring(i)
        .match(/^<\/?([a-zA-Z][a-zA-Z0-9:-]*)((?:\s+[^>]*)?)>/)
      if (tagMatch) {
        const fullTag = tagMatch[0]
        const tagName = tagMatch[1].toLowerCase()
        const isClosing = html[i + 1] === '/'
        const isSelfClosing = fullTag.endsWith('/>')

        tokens.push({
          type: 'tag',
          content: fullTag,
          tagName,
          isClosing,
          isSelfClosing,
        })
        i += fullTag.length
        continue
      }
    }

    // Text content
    let textEnd = i
    while (textEnd < html.length && html[textEnd] !== '<') {
      textEnd++
    }

    if (textEnd > i) {
      tokens.push({
        type: 'text',
        content: html.substring(i, textEnd),
      })
      i = textEnd
      continue
    }

    // Fallback: consume single character
    i++
  }

  return tokens
}

/**
 * Simple HTML minifier that handles collapseWhitespace
 * @param html - HTML string to minify
 * @returns Minified HTML with collapsed whitespace
 */
export function collapseWhitespaceInHtml(html: string): string {
  // Early return for empty or short strings
  if (!html || html.length < 10) {
    return html
  }

  const tokens = tokenize(html)
  const result: string[] = []
  const preserveStack: string[] = []
  let lastWasBlockTag = true // Start as true to trim leading whitespace

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token.type === 'comment' || token.type === 'doctype') {
      result.push(token.content)
      continue
    }

    if (token.type === 'tag' && token.tagName) {
      const inPreserveTag = preserveStack.length > 0

      // Update preserve stack
      if (
        !token.isClosing &&
        !token.isSelfClosing &&
        PRESERVE_WHITESPACE_TAGS.has(token.tagName)
      ) {
        preserveStack.push(token.tagName)
      } else if (
        token.isClosing &&
        preserveStack[preserveStack.length - 1] === token.tagName
      ) {
        preserveStack.pop()
      }

      result.push(token.content)

      // Track if this is a block tag for whitespace handling
      if (BLOCK_TAGS.has(token.tagName)) {
        lastWasBlockTag = true
      } else {
        lastWasBlockTag = false
      }
      continue
    }

    if (token.type === 'text') {
      const inPreserveTag = preserveStack.length > 0

      if (inPreserveTag) {
        // Preserve all whitespace in pre, script, style, textarea
        result.push(token.content)
      } else {
        // Collapse whitespace in normal text
        let text = token.content

        // Check if entirely whitespace
        if (!/\S/.test(text)) {
          // Between block tags, remove whitespace entirely
          // Otherwise collapse to single space
          const nextToken = tokens[i + 1]
          const nextIsBlockTag =
            nextToken?.type === 'tag' &&
            nextToken.tagName &&
            BLOCK_TAGS.has(nextToken.tagName)

          if (lastWasBlockTag || nextIsBlockTag) {
            // Skip whitespace-only text between block elements
            continue
          } else {
            // Preserve single space between inline elements
            result.push(' ')
          }
        } else {
          // Text with actual content - collapse whitespace
          text = collapseWhitespace(text)

          // Trim leading space if after block tag
          if (lastWasBlockTag && text[0] === ' ') {
            text = text.substring(1)
          }

          // Trim trailing space if before block tag
          const nextToken = tokens[i + 1]
          const nextIsBlockTag =
            nextToken?.type === 'tag' &&
            nextToken.tagName &&
            BLOCK_TAGS.has(nextToken.tagName)
          if (nextIsBlockTag && text[text.length - 1] === ' ') {
            text = text.substring(0, text.length - 1)
          }

          if (text) {
            result.push(text)
            lastWasBlockTag = false
          }
        }
      }
    }
  }

  return result.join('')
}

/**
 * More advanced version that considers inline tags
 * @param html - HTML string to minify
 * @returns Minified HTML with smart whitespace collapsing
 */
export function collapseWhitespaceSmart(html: string): string {
  // The main function now handles inline vs block context
  return collapseWhitespaceInHtml(html)
}

// Default export
export default collapseWhitespaceInHtml
