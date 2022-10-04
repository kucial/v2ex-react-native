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
- react-native-image-modal -- 图片预览
- react-hook-form -- 表单
- slatejs + webview -- 富文本编辑
- @gorhom/bottom-sheet -- 底部弹出层
- react-native-image-viewing -- imgur 图片预览
- react-native-dropdownalert -- 信息提示

## 关于用户身份认证

用户登录状态实际从 webview 中获得。登录用户操作的行为都会通过 `webview.injectJavaScript` 来执行

## 首页数据刷新

- TTL -- 5min
