import React, { createRef } from 'react'
import { Editor, Element } from 'slate'
import { ReactEditor } from 'slate-react'
import SimpleRichEditor from './SimpleRichEditor';

// TODO：external react debugger
const parseData = (str) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return null;
  }
}
class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshKey: undefined,
      value: undefined,
      placeholder: undefined,
    }
    this.domRef = createRef();
    this.viewport = {};
  }

  componentDidMount() {
    // FOR DEBUG
    window._editor = this;
    window.addEventListener('message', this.handleMessage)
    this.postMessage({
      type: 'event',
      name: 'ready'
    })
  }

  componentDidUpdate() {
    if (!this.domRef.current) { return; }
    const {scrollHeight, scrollWidth} = this.domRef.current;
    if (scrollHeight === this.viewport.height && scrollWidth === this.viewport.width) {
      return;
    }
    this.viewport = {
      height: scrollHeight,
      width: scrollWidth,
    }
    this.postMessage({
      type: 'event',
      name: 'viewport',
      payload: this.viewport,
    })
  }

  handleMessage = (e) => {
    const data = parseData(e.data);
    if (!data) {
      return ;
    }
    switch (data.method) {
      case 'init':
        this.init(...data.args);
        this.postMessage({
          requestId: data.requestId,
          result: true,
        })
        break;
      case 'getHTML':
        this.postMessage({
          requestId: data.requestId,
          result: this.getHTML(),
        })
        break;
      case 'undo':
        this.editor.undo();
        this.postMessage({
          requestId: data.requestId,
          result: true,
        })
        break;
      case 'redo':
        this.editor.redo();
        this.postMessage({
          requestId: data.requestId,
          result: true,
        })
        break;
      case 'toggleMark':
        this.editor.toggleMark(...data.args)
        this.postMessage({
          requestId: data.requestId,
          result: true,
        })
        break;
      case 'toggleBlock':
        this.editor.toggleBlock(...data.args)
        this.postMessage({
          requestId: data.requestId,
          result: true,
        })
        break;
      case 'listIndent':
        this.editor.listIndent();
        this.postMessage({
          requestId: data.requestId,
          result: true,
        })
        break;
      case 'listOutdent':
        this.editor.listOutdent();
        this.postMessage({
          requestId: data.requestId,
          result: true,
        })
        break;
      case 'insertImage':
        this.editor.inserImage(...data.args);
        this.postMessage({
          requestId: data.requestId,
          result: true,
        })
        break;
      case 'focus':
        ReactEditor.focus(this.editor)
        this.postMessage({
          requestId: data.requestId,
          result: true,
        })
        break;
      case 'blur':
        ReactEditor.blur(this.editor)
        this.postMessage({
          requestId: data.requestId,
          result: true,
        })
        break;
      default :
        this.postMessage({
          requestId: data.requestId,
          result: {
            error: true,
            message: `Unknown method: ${data.method}`
          }
        })
    }
  }

  handleFocus = () => {
    this.postMessage({
      type: 'event',
      name: 'focus'
    })
  }

  handleBlur = () => {
    this.postMessage({
      type: 'event',
      name: 'blur'
    })
  }

  postMessage = (data) => {
    window.ReactNativeWebView?.postMessage(JSON.stringify(data))
  }

  setPlaceholder(placeholder) {
    this.setState({ placeholder })
  }

  setValue = (value)  => {
    console.log(value)
    this.setState({
      value,
    }, () => {
      this.postMessage({
        type: 'event',
        name: 'meta',
        payload: {
          canUndo: !!this.editor.history.undos.length,
          canRedo: !!this.editor.history.redos.length,
          inlineStyles: this.getActiveMarks(),
          blockTypes: this.getActiveBlockTypes()
        },
      })
    })
  }

  getActiveMarks() {
    return {
      ...Editor.marks(this.editor)
    }
  }
d
  getActiveBlockTypes() {
    const { editor } = this;
    if (!editor.children) {
      return []
    }
    const nodes = Array.from(Editor.nodes(editor, {
      at: Editor.unhangRange(editor, editor.selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        !Editor.isInline(editor, n)
    }))
    const types = [...nodes].map(([n]) => n.type)
    return Array.from(new Set(types))
  }

  getHTML = () => {
    return this.editor.html.htmlFromFragment(this.state.value)
  }

  init = (config = {}) => {
    const { data, html, placeholder } = config;
    if (data) {
      this.setState({
        value: data,
        placeholder,
        refreshKey: Date.now(),
      })
      return;
    }
    if (html) {
      const value = this.editor.html.fragmentFromHtml(html);
      this.setState({
        value,
        placeholder,
        refreshKey: Date.now(),
      })
      return
    }
    this.setState({
      placeholder,
      value: [
        {
          type: 'paragraph',
          children: [{ text: '' }]
        }
      ],
      refreshKey: Date.now(),
    })
  }


  render() {
    return (
      <div style={{ overflow: 'hidden', caretColor: '#111' }} ref={this.domRef}>
        <SimpleRichEditor
          key={this.state.refreshKey}
          ref={(n) => {
            this.editor = n;
          }}
          value={this.state.value}
          placeholder={this.state.placeholder}
          onChange={this.setValue}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
        />
      </div>
    )
  }
}

export default App;