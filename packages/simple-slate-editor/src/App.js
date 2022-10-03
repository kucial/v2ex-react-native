import { throttle } from 'lodash';
import React, { createRef } from 'react'
import { Editor, Element, Range, Node } from 'slate'
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
      focus: false,
      containerStyle: {
        overflow: 'hidden',
      }
    }
    this.domRef = createRef();
    this.viewport = {};
  }

  componentDidMount() {
    // FOR DEBUG
    window._editor = this;
    window.addEventListener('message', this.handleMessage)
    // window.addEventListener('blur', this.watchWindowBlur)
    this.postMessage({
      type: 'event',
      name: 'ready'
    })
  }

  componentDidUpdate() {
    if (!this.domRef.current) { return; }
    this.triggerViewportUpdate()
    this.triggerSelectionUpdate()
  }

  triggerViewportUpdate() {
    const {scrollHeight, clientWidth} = this.domRef.current;
    if (scrollHeight === this.viewport.height && clientWidth === this.viewport.width) {
      return;
    }

    this.viewport = {
      height: scrollHeight,
      width: clientWidth,
    }
    this.postMessage({
      type: 'event',
      name: 'viewport',
      payload: this.viewport,
    })
  }

  triggerSelectionUpdate = throttle(() => {
    if (
      this.lastSelection && this.editor.selection &&
      Range.equals(this.editor.selection, this.lastSelection)) {
      return;
    }
    this.lastSelection = JSON.parse(JSON.stringify(this.editor.selection));
    let selectionBox;
    if (this.editor.selection) {
      // hack selection for new block inserted
      if (Range.isCollapsed(this.editor.selection)) {
        const nodeEntry = Editor.above(this.editor, {
          match: (n) => Editor.isBlock(this.editor, n),
          at: this.editor.selection
        });
        if (nodeEntry && Editor.isEmpty(this.editor, nodeEntry[0])) {
          const anchorDom = ReactEditor.toDOMNode(this.editor, nodeEntry[0]);
          // selectionBox = anchorDom.getBoundingClientRect();
          selectionBox = {
            top: anchorDom.offsetTop,
            height: anchorDom.clientHeight,
            bottom: anchorDom.offsetTop + anchorDom.clientHeight,
            width: 0,
          }
        }
      }

      if (!selectionBox) {
        const range = ReactEditor.toDOMRange(this.editor, this.editor.selection);
        selectionBox = range.getBoundingClientRect();
      }
      console.log(selectionBox)
    }

    this.postMessage({
      type: 'event',
      name: 'selection',
      payload: {
        selection: this.editor.selection,
        selectionBox,
      }
    })
  }, 300);

  watchWindowBlur = (e) => {
    ReactEditor.blur(this.editor);
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
      case 'getMarkdown':
        this.postMessage({
          requestId: data.requestId,
          result: this.getMarkdown(),
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
        this.editor.insertImage(...data.args);
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
      case 'base64Encode':
        this.editor.base64Encode(...data.args)
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
    this.setState({
      focus: true,
    })
    this.postMessage({
      type: 'event',
      name: 'focus'
    })
  }

  handleBlur = () => {
    this.shouldSkipFocus = true;
    setTimeout(() => {
      this.shouldSkipFocus = false;
    }, 500);
    this.setState({
      focus: false,
    })
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

  getMarkdown = () => {
    return this.editor.md.mdFromFragment(this.state.value)
  }

  init = (config = {}) => {
    const { data, html, placeholder, containerStyle } = config;
    if (data) {
      this.setState({
        value: data,
        placeholder,
        containerStyle,
        refreshKey: Date.now(),
      })
      return;
    }
    if (html) {
      const value = this.editor.html.fragmentFromHtml(html);
      console.log(value);
      this.setState({
        value,
        placeholder,
        containerStyle,
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
      containerStyle,
      refreshKey: Date.now(),
    })
    // set `editor.selection` for init focus.
    this.editor.selection = {anchor: {path: [0, 0], offset: 0}, focus: {path: [0, 0], offset: 0}}
  }


  render() {
    return (
      <div style={this.state.containerStyle} ref={this.domRef}
        onClick={() => {
          if (!this.shouldSkipFocus && this.editor.selection) {
            ReactEditor.focus(this.editor)
          }
        }}
      >
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