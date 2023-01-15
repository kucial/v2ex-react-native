import { CSSProperties, Ref } from "react"
import WebView, { WebViewMessageEvent } from "react-native-webview"

type SlateEditorInitOptions = {
  placeholder?: string,
  html?: string,
  containerStyle?: CSSProperties
}
export interface SlateEditorMethods {
  init(data: SlateEditorInitOptions): Promise<void>,
  focus(): Promise<void>,
  blur(): Promise<void>,
  getHTML(): Promise<string>,
  getMarkdown(): Promise<string>,
  toggleBlock(block: string): Promise<void>,
  toggleMark(mark: string): Promise<void>,
  listIndent(): Promise<void>,
  listOutdent(): Promise<void>,
  insertImage(args: {
    url: string,
    width: number,
    height: number
  }): Promise<void>,
  base64Encode(): Promise<void>,
  undo(): Promise<void>,
  redo(): Promise<void>,
}

export interface SlateEditorState {
  _ready?: boolean,
  _hasFocus?: boolean,
  selectionBox?: {
    top: number,
    bottom: number,
  },
  viewport?: {
    height: number,
    width: number,
  },
  meta: {
    canUndo?: boolean,
    canRedo?: boolean,
    blockTypes?: string[],
    inlineStyles?: string[],
  },
}

export type SlateEditorService = SlateEditorState & SlateEditorMethods & {
  webview: Ref<WebView>

  setInitialConfig(data: SlateEditorInitOptions): void,
  hasFocus(): boolean,
  isReady(): boolean,
  handleMessage(e: WebViewMessageEvent): void,
  canUndo(): boolean,
  canRedo(): boolean,
  canIndent(): boolean,
  canOutdent(): boolean,
  isMarkActive(mark: string): boolean,
  isBlockActive(block: string): boolean,
};