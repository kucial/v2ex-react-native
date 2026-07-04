# SlateEditor

The editor uses an Expo DOM component for the Slate runtime:

```tsx
<EditorProvider>
  <EditorRender />
  <EditorToolbar />
</EditorProvider>
```

## Architecture

1. `EditorRender` renders `dom/SlateEditorDOM.tsx`, a `'use dom'` component.
2. `EditorProvider` owns the native editor service and exposes it through context.
3. The native service calls DOM methods through `useDOMImperativeHandle`.
4. The DOM editor emits serializable events back to native through `onEvent`.

The public native API is intentionally stable for screens that submit Markdown
or control the toolbar:

```ts
editor.focus()
editor.blur()
editor.getHTML()
editor.getMarkdown()
editor.toggleMark('bold')
editor.toggleBlock('unordered-list')
editor.insertImage({ url, width, height })
```

`webview` and `handleMessage` remain as deprecated compatibility fields. New
code should use the service methods and DOM event bridge instead.
