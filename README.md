# R2V -- 第三方 V2EX 客户端

<p align="center">
<img src="https://raw.githubusercontent.com/kucial/v2ex-react-native/main/public/logo.png" alt="R2V" />
</p>

## 截图

<img width="300px" src="https://raw.githubusercontent.com/kucial/v2ex-react-native/main/public/01.png" alt="screenshot 01" />
<img width="300px" src="https://raw.githubusercontent.com/kucial/v2ex-react-native/main/public/02.png" alt="screenshot 02" />
<img width="300px" src="https://raw.githubusercontent.com/kucial/v2ex-react-native/main/public/03.png" alt="screenshot 03" />
<img width="300px" src="https://raw.githubusercontent.com/kucial/v2ex-react-native/main/public/04.png" alt="screenshot 04" />

### Dark Mode

<img width="300px" src="https://raw.githubusercontent.com/kucial/v2ex-react-native/main/public/d01.png" alt="screenshot d01" />
<img width="300px" src="https://raw.githubusercontent.com/kucial/v2ex-react-native/main/public/d02.png" alt="screenshot d02" />
<img width="300px" src="https://raw.githubusercontent.com/kucial/v2ex-react-native/main/public/d03.png" alt="screenshot d03" />
<img width="300px" src="https://raw.githubusercontent.com/kucial/v2ex-react-native/main/public/d04.png" alt="screenshot d04" />

## 主要开发库

React Native + Tailwindcss + SWR

## 功能列表

- [x] 主页面（主题、节点、我的）
- [x] 主题相关
  - [x] 主题详情
  - [x] 主题感谢、收藏、转发
  - [x] 主题回复
  - [x] 附言
  - [x] 回复会话视图
  - [x] 回复 markdown 预览
  - [x] 感谢回复
  - [x] 屏蔽主题
  - [x] 内容选择复制（目前仅支持段落内选择）
  - [x] base64 decode
  - [x] 举报
  - [x] Imgur 网页省流（直接打开 imgur post 链接 对应的图片）
  - [x] 滚动到顶部/底部，定位到某一楼层
  - [x] 图片预览，及分享、保存
- [ ] 节点相关
  - [x] 收藏/取消收藏
  - [x] 节点主题列表
- [ ] 用户相关
  - [x] 查看用户发表的主题
  - [x] 查看用户发表的评论
  - [x] 屏蔽用户
  - [x] 关注用户
- [ ] 当前用户相关
  - [x] 用户登录
    - [x] 账号密码登录
    - [x] 2FA 支持
    - [x] Google 登录（隐藏）
  - [x] 创建主题
    - [x] 富文本编辑
    - [x] 插入图片
    - [x] base64 encode
  - [x] 消息通知
  - [x] 搜索
  - [x] 浏览历史
  - [x] 用户资料编辑
- [ ] Imgur 功能
  - [x] 创建相册
  - [x] 上传图片
  - [ ] 删除图片
- [x] Url Scheme, `r2v`
  - [x] Topic: `r2v://t/:id`
  - [x] Node: `r2v://node/:name`
  - [x] Member: `r2v://member/:username`
- [ ] 设置
  - [x] Imgur 图床连接
  - [ ] 偏好设置
    - [x] 设置列表项的显示
      - [x] 默认
      - [x] 紧凑
    - [x] 首页 Tab 自定义
      - [x] 可以调整 Tabs 顺序
      - [x] 可以调整 Tabs 内容
        - [x] 默认使用 v2ex.com 移动端的 tabs
        - [x] 默认添加 “最近” 的 标签
        - [x] 可以 添加 “节点“ 的 作为标签
    - [x] 已读内容“置灰”设置
    - [x] 已读内容更新提示
    - [x] 自动刷新设置
    - [x] 主题设置
    - [ ] 字体大小
- [ ] 其他
  - [x] 二维码识别
  - [x] clipboard 链接识别
  - [ ] “表情图” ｜ emoji

## 下一步

- [ ] 用户绑定的缓存
- [ ] 加入 `/api/v2` 的请求设置，优化内容加载速度
- [ ] 添加测试用例。
- [ ] 调整用户主页的界面设计 尝试使用 Animated 处理用户主页头部高度

## 框架/库 -- NOTES

- react-native
- react-navigation -- 页面导航
- ~~tailwindcss-react-native -- 样式系统~~
- nativewind + custom theme provider -- 样式主题系统
- sentry-expo -- 错误跟踪
- MMKV -- 存储
- swr -- 请求管理
  - fetcher -- V2EX V1 API + 自定义 webview 封装接口
  - cacheProvider -- MMKV storage
- react-native-render-html -- 内容渲染
- marked -- markdown 预览
- ~~react-native-image-modal -- 图片预览~~
- ~~react-hook-form -- 表单~~ formik
- slatejs + webview -- 富文本编辑
- @gorhom/bottom-sheet -- 底部弹出层
- react-native-image-viewing -- imgur 图片预览
- ~~react-native-dropdownalert~~ react-native-root-toast -- 信息提示
- react-native-selectable-text -- 可选择文本

## ENV 参数

- 本地开发，依赖 `module:react-native-dotenv` + `.env` 来进行设置。 修改 `.env` 后需要注意清理缓存： `expo start -c --dev-client`
