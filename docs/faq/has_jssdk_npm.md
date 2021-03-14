# 有没有企业微信 JS-SDK 的 npm 包

有的。但是非常不推荐使用。

*（虽然不推荐使用，但是我对这些封装 JS-SDK 的作者是尊敬的。企业微信侧边栏真的需要大家的一起努力才打造更好的开发体验，respect）*

## 存在名字很像，但是和侧边栏没有关系的包

目前市面上是有名字类似、功能相似的 npm 包，但是 **并不是企业微信的JS-SDK包！** 比如

* [wxjssdk](https://www.npmjs.com/package/wxjssdk): wxjssdk node版本，**只封装微信接口**，和企业微信侧边栏的能力没有关系！
* [weixin-js-sdk](https://github.com/yanxi-me/weixin-js-sdk): 这个是对 jweixin-1.6.0.js 的封装，企业微信侧边栏官方用的是 1.2.0（有坑，应该用 1.0.0）
。仔细去看会发现**这个包是用来搞微信网页开发的**，和侧边栏也是毛关系没有。
* [jweixin-npm](https://www.npmjs.com/package/jweixin-npm): 依然是 jweixin-1.6.0 的封装，毛关系没有，鉴定完毕。
  
## 真的侧边栏 JS-SDK 的 npm 包

除了上面的包之外，还真的有对企业微信侧边栏 JS-SDK 封装的包。主要原因还是因为官网没有一个最佳方案，真是苦了这些开发者了，不得不自己开发轮子...

那轮子如何呢？来列举一下：

* [wxwork-jsapi](https://www.npmjs.com/package/wxwork-jsapi): 本人第一次使用的就是这个，刚开始还可以，但是在 windows 下不能正常 agentConfig，
导致一些 API 会报 `fail:no permission` 的错误。而且，最近看 README.md 该库的作者也说："之前的方式还是有点问题，最近有了一些新的思考"，所以不推荐使用。
* [jwxwork](https://www.npmjs.com/package/jwxwork): 已 deprecated，更名为 jwecom 包。
* [jwecom](https://www.npmjs.com/package/jwecom): 看起来可以兼容微信和企业微信的开发，像是那么回事了，promisify化，ts化，不过这个库本人没用过，是新发出来的。
而且这个库没有公开源码，不好评论，大家有空可以做一下调研。
  
目前市面上搜到的上面这三个，两个已经算是 deprecated 了，比较有希望的是 jwecom，可惜没有源码可看，而且下载量零星几个（当然确实没多少人搞侧边栏）
，也很难评估，大家有空可以调研一下。

大家调研的点可以围绕如下点：

1. 正确性
    1. 初始化：config, agentConfig, ready, checkJsApi 是否 OK
    2. 普通 API：code 换取 userId 等
    3. 外部联系人 API：获取 external user id, external chat id
2. 兼容性
    1. 检查 Android, IOS, Windows PC, Mac OS
    2. 主要可能出现的问题是某些端不能正常调用 wx.agentConfig，或者 wx is undefined，或者 wx.agentConfig is undefined
    3. 真的要 4 个端都要检查么？**是的！每个端都会出现自己的问题，而且各不相同**

## 总结

目前，如果你是小白，急着完全老板需求，就不要用 npm 包了，乖乖用 script 标签引入就好了，原因有这几点：

1. 没那么多时间做每个点的调研和验证，就算你调研成功后，企业微信一升级，npm 没升级，直接 GG
2. 兼容性问题真的会把你搞吐血，各个端的问题四个字总结：百花齐放，不要打开潘多拉魔盒
3. 最重要的：就算你头铁非要用 npm 包，那抱歉，出了问题官方是帮不了你的。因为官方推荐使用的 script 标签，然后你用了 npm 包，官方的人会说
"这里推荐 script 标签引入哦，要不试试 script 标签引入看看"。那你就只能：换成 script 标签引入，把原来逻辑都改成 script 标签引入的方式，
再重现自己的问题，再和官方的人去对线。如果你输了乖乖用 script 标签，赢了把原来的 script 标签引入代码又改回来 npm 引入的方式。放过自己吧。
   
总而言之，用 script 标签引入就对了。

## 参考

* [有没有企业微信 npm js-sdk ？](https://developers.weixin.qq.com/community/develop/doc/000ec4ab3d44b05c4b7a01f7250800?highLine=npm)
* [页面可以同时引入企业微信和 js-sdk普通微信吗？](https://developers.weixin.qq.com/community/develop/doc/000464b9f749c87d882b0f7de5c800?highLine=npm)
* [企微JSSDK配置问题](https://developers.weixin.qq.com/community/develop/doc/0008e6f0ad0b98a2b97aab6c851c00?highLine=npm)
