# SlateEditor in webview

```typescript
interface Editor {
  metaState: {
    canUndo: boolean
    canRedo: boolean
    blockTypes: Array<string> // blockTypes in depth
    inlineStyles: Array<string> // lineStyles in depth
  }
  isBlockActive(type: string): boolean
  isMarkActive(type: string): boolean
  toggleBlockType(type: string): Promise<boolean>
  toggleInlineStyle(type: string): Promise<boolean>
  insertImage(src: string): Promise<boolean>
  insertIframe(config: any): Promise<boolean>
  listIndent(): Promise<boolean>
  listOutdent(): Promise<boolean>
  getHTML(): Promise<string>
  setHTML(html: string): Promise<boolean>
  init(config: {
    placeholder?: string
    data?: any // slate state
    html?: string //
  }): Promise<boolean>
  webviewRef: any // react ref to a webview
}
```

## 组件及通讯机制

相关组件

1. EditorProvider
2. WebView, (ref, onMessage)
3. Toolbar

### EditorProvider

1. 提供 editor 示例上下文，提供可用的编辑器接口
2. 一个 react ref 用于绑定 webview 实例
3. 一个 handleMessage 用于设置 webview onMessage

###

```jsx
<EditorProvider>
  <EditorRender />
  <EditorToolbar />
</EditorProvider>
```

预期调用方式

```js
const requestManager = {
  requests = new Map();
  generateRequestId() {

  },
  setRequestHandler(requestid, resolve, reject) {

  },
  handleMessage(message) {

  }
}
function init(config) {
  return new Promise((resolve, reject) => {
    const requestId = requestManager.generateRequestId();
    requestManager.setRequestHandler(requestId, { resolve, reject });
    this.webview.postMessage(JSON.stringify({
      requestId,
      method: 'init',
      params: config
    }))
  })
}

```
