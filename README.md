# ReactNative for V2EX

## 框架/库/NOTES

- react-native
- react-navigation -- 页面导航
- tailwindcss-react-native -- 样式系统
<!-- - MMKV -- 存储 -->
- swr -- 请求管理
  - fetcher -- V2EX V1 API + 自定义 webview 封装接口
  - cacheProvider -- MMKV storage
- react-native-render-html -- 内容渲染
- react-native-image-modal -- 图片预览
- react-hook-form -- 表单

## 关于用户身份认证

用户登录状态实际从 webview 中获得。登录用户操作的行为都会通过 `webview.injectJavaScript` 来执行
