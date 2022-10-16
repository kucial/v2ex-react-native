# Third party client for V2EX

## 框架/库 -- NOTES

- react-native
- react-navigation -- 页面导航
- tailwindcss-react-native -- 样式系统
- sentry-expo -- 错误跟踪
- MMKV -- 存储
- swr -- 请求管理
  - fetcher -- V2EX V1 API + 自定义 webview 封装接口
  - cacheProvider -- MMKV storage
- react-native-render-html -- 内容渲染
- marked -- markdown 预览
- ~~react-native-image-modal -- 图片预览~~
- react-hook-form -- 表单
- slatejs + webview -- 富文本编辑
- @gorhom/bottom-sheet -- 底部弹出层
- react-native-image-viewing -- imgur 图片预览
- react-native-dropdownalert -- 信息提示

## ENV 参数

- 本地开发，依赖 `module:react-native-dotenv` + `.env` 来进行设置。 修改 `.env` 后需要注意清理缓存： `expo start -c --dev-client`

## 关于“当前登录用户”

用户登录状态实际从 webview 中获得。登录用户操作的行为都会通过 `webview.injectJavaScript` 来执行

## NEXT

- [ ] Typescript
- [ ] Android 适配、调试
- [ ] 功能完善
  - [ ] 主题相关
    - [ ] 点赞
    - [ ] 附言
    - [ ] 举报
  - [ ] 用户相关
    - [ ] 屏蔽用户
    - [ ] 关注用户
- [ ] 应用设置
  - [ ] 添加用户设置
  - [ ] 主页刷新时间设置
- [ ] 优化
  - [ ] Imgur 删除图片
  - [ ] 文本选择 与 base64 decode
- [ ] expo 构建、更新流程
- [ ] 测试用例
  - [ ] Webview fetcher 测试

## 功能列表

## 自定义设置

- 设置列表项的显示
  - 默认
  - 紧凑
- 首页 Tab 自定义
  - 可以调整 Tabs 顺序
  - 可以调整 Tabs 内容
    - 默认使用 v2ex.com 移动端的 tabs
    - 可以 添加 “最近” 的 Tab
    - 可以 添加 “节点“ 的 Tab
- 主题设置
  - 强调色（Dark Mode）
  -
