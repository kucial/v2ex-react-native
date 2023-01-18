# 项目开发笔记

## 本地构建错误

### sentry API 设置

如果出现以下情况

```
› Executing R2V » Upload Debug Symbols to Sentry

❌  error: API request failed
```

请在 `ios/.xcode.env.local` 中添加 sentry 相关设置

```bash
export SENTRY_AUTH_TOKEN="xxxx"
export SENTRY_URL="https://your-sentry-host"
export SENTRY_ORG="YOUR_SENTRY_ORG",
export SENTRY_PROJECT="v2ex-react-native",
export SENTRY_DSN="YOUR_SENTRY_PROJECT_DSN"
```

## `v2ex-client`

应用内对于 v2ex 网站内容的请求，大部分通过 `v2ex-client` 实现。

v2ex-client 使用 axios + webview-adapter 来实现接口封装。 用户认证状态依赖 react-native-webview 上的网站 cookie 。

**NOTE** Webview 设置 `sharedCookiesEnabled=true` 时，会随机出现 cookie 丢失的情况。

## 关于 SWR 的 revalidate

SWR revalidate 在 RN 上似乎不是很友好。如果存在多个 SWR （包含 navigation stack 里面 SWR）时，会造成大量请求同时发出。因为这里有首屏（主题）上面有多个主题列表，如果开启 `revalidateOnMount` | `revalidateOnFocus` 了，应在会在相应的时机上，会出现大量的请求（容易与 v2ex-client webview) 发生冲突。

应用内策略：

1. 禁用首页主题列表组件的 SWR revlidate 相关功能。 通过项目内部的 hook 实现 “首次请求” 以及 “配合设置的定期刷新”
