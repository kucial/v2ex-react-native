# Storage

1. 存储应用数据
2. 为 swr 提供缓存支持

## 命名/前缀

-- 自定义 --

`$app$` -- 应用数据缓存

-- SWR 库 --

`$swr$` -- SWR 状态数据缓存
`/api/endpoint/string` - SWR 请求数据缓存
`$inf$/api/endpoint/string` -- SWRInfinite 请求数据缓存
