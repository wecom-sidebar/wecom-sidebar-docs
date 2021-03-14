# wx.agentConfig is not a function

> *最后更新于 2021年3月14日*

## 官方 JS-SDK 文件有问题

这个问题是个月经贴了，几乎每个人都会在开放者社区里问一遍。
结论就是官方的 JS 文件有问题，在进行企业微信JS SDK对接时，正确引用的JS文件应该是如下：

```html
<script src="https://res.wx.qq.com/wwopen/js/jsapi/jweixin-1.0.0.js"></script>
```

## 参考
* [企业微信巨坑：wx.agentConfig is not a function](https://developers.weixin.qq.com/community/develop/article/doc/00022417118c78d4448af86625b413)
* [企业微信JSSDK引入问题](https://developers.weixin.qq.com/community/develop/article/doc/000ca2a55e4b685d664b391ea5b013)
