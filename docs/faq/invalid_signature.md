# invalid signature 签名错误

估计每个刚开发侧边栏的都会遇到这个问题，因为造成这个错误的原因千奇百怪。

一般来说这个错误多半是：

1. 没有用 `window.location.href.split('#')[0]` 作为 `url` 参数，而是直接用 `window.location.href`，`url` 要的 "#" 前面的内容就 OK 了
2. corpId, agentId 这些参数不正确
3. access_token 被限频了

以上都不符合，可以去官方那里找找：[常见错误及解决方法](https://work.weixin.qq.com/api/doc/90001/90144/90542)
