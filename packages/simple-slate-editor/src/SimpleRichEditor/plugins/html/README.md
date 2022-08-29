# HTML 导入/导出

## 使用方法 

```js
const editor = withHtml(createEditor());
```

插件会在 editor 中添加一个对象属性 `html`，来存放  HTML 导入/导出 相关的设置及方法

```typescript
interface Html {
    styleOrder: [], // 控制 mark 处理顺序
    tagsExtracter: Map<elementType, fn>, // node 类型相关
    getCommonExtra: () => Object|undefined, // 全局属性提取
    htmlFromFragment: (fragment: Array<Node>) => string, 

    markAttrsFromEl: (el: Node) => MarkAttrs, // 
    attrsExtracter: Map<NoeType, fn>, // element 类型相关
    elAttrsFromEl: (el: Ndoe) => ElementAttrs,
    normalize: (node: SlateNode, el: Node) => SlateNode, // 全局属性提取
}
```
