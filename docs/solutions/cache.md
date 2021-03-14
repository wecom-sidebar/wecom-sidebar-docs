# 缓存方案

## 缓存对比

侧边栏的缓存和传统浏览器的缓存会稍有不同，对比如下：

| 选手         | 页面刷新是否重置 | 账号切换是否重置 | 缓存内容 |
| -------------- | ---------------- | ---------------- | ---------------------------------------------------- |
| sessionStorage | 是              | 是              | 外部联系人/群信息，如 externalUserId, externalChatId |
| localStorage   | Mac OS 重置 | Mac OS 重置 | 非 Mac OS: 缓存 js_api_ticket                   |
| cookie         | 否              | 是              | 用户身份信息，如 userId, Jwt Token           |
| indexedDB      | 否              | 否              | Mac OS: localStorage 的替代方案，缓存其内容 |

注意点：
1. Mac OS 下 localStorage 每次进入页面会被重置
2. 切换账号时，cookie 才会被重置，因此，最好将用户身份信息存入 cookie
