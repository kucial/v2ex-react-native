# Storage

1. 存储应用数据
2. 为 swr 提供缓存支持

## 命名/前缀

-- 自定义 --

`$app$` -- 应用数据缓存

- `$app$/services/imgur` Imgur credentials
- `$app$/settings/imgur` Imgur 设置
- `$app$/settings` App Settings
- `$app$/viewed-topics` 浏览过的主题

-- SWR 库 --

- `$swr$` -- SWR 状态数据缓存 `{ isValidating: false }`
- `/api/endpoint/string` - SWR 请求数据缓存
- `$inf$/api/endpoint/string` -- SWRInfinite 请求数据缓存
- `$len$/api/endpoint/string` -- SWRInfinite size 数据
