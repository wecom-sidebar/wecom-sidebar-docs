# 获取权限签名

## 简介

ticket 的作用是生成 signature，而 signature 又作为初始化 JS-SDK 的参数，是很关键的参数。 这里的 jsapi_ticket 其实包含了企业的和应用两个，区别是：

* 企业 jsapi_ticket（下称 corp_ticket）主要用于生成 `wx.config` 的 signature 参数
* 应用 jsapi_ticket（下称 app_ticket）主要用于生成 `wx.agentConfig` 的 signature 参数

反正一个 ticket 对于一个 xxxConfig 函数调用。

注意点:

1. 两个 ticket 都要作缓存，不然限频
2. 前端可缓存到 localStorage/indexedDB，后端也可缓存，只是前端缓存后可以少发请求，页面更快响应
3. 对于版本 < 3.0.24 的企业微信不需要调用 `wx.config`，此时可不需要获取 `corp_ticket`，而 `app_ticket` 是任何时候都需要的

## 生成 signature

因为 ticket 最终都是要用来生成签名的，因此先实现生成 signature 的函数。 生成 signature
的算法参考官方的 [《JS-SDK使用权限签名算法》](https://work.weixin.qq.com/api/doc/90001/90144/90539) 就好了。 下面直接给出实现。

```ts
import sha1 from 'sha1';

/**
 * 签名生成规则如下：
 * 参与签名的参数有四个: noncestr（随机字符串）, jsapi_ticket(如何获取参考“获取企业jsapi_ticket”以及“获取应用的jsapi_ticket接口”), timestamp（时间戳）, url（当前网页的URL， 不包含#及其后面部分）
 * 将这些参数使用URL键值对的格式 （即 key1=value1&key2=value2…）拼接成字符串string1。
 * 有两个注意点：1. 字段值采用原始值，不要进行URL转义；2. 必须严格按照如下格式拼接，不可变动字段顺序。
 * jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}
 * @param nonceStr
 * @param jsapiTicket 随机字符串
 * @param timestamp 时间截
 */
const sign = (jsapiTicket: string, nonceStr: string, timestamp: number) => {
  const [url] = window.location.href.split('#');

  const rawObj = {
    jsapi_ticket: jsapiTicket,
    noncestr: nonceStr,
    timestamp,
    url,
  };

  const rawStr = Object.entries(rawObj)
    .map(entry => {
      const [key, value] = entry;

      return `${key}=${value}`;
    })
    .join('&');

  return sha1(rawStr);
};
```

## 获取 signature

按照官方的说法，应该要后端实现 signature 的签发，所以这部分逻辑要放在后端：

```js
const sha1 = require('sha1');
// redis
const redis = require("../redis");
// 企业微信转发服务
const QywxBaseController = require("../controllers/QywxProxyController");

const keys = {
  ACCESS_TOKEN: 'access_token',
  CORP_JSAPI_TICKET: 'corp_jsapi_ticket',
  APP_JSAPI_TICKET: 'app_jsapi_ticket',
}

const OFFSET = 100;

const getJsApiTickets = async (url, accessToken) => {
  const [urlKey] = url.split('#')

  // 使用前缀和 url 生成当前的 key
  const corpJsApiTicketsKey = `${keys.CORP_JSAPI_TICKET}_${urlKey}`;
  const appJsApiTicketsKey = `${keys.APP_JSAPI_TICKET}_${urlKey}`;

  // 缓存 ticket
  const cacheCorpJsApiTickets = await redis.get(corpJsApiTicketsKey);
  const cacheAppJsApiTicket = await redis.get(appJsApiTicketsKey);

  // 是否有缓存的 tickets
  if (cacheAppJsApiTicket || cacheCorpJsApiTickets) {
    console.log('使用 redis 的 ticket', cacheCorpJsApiTickets, cacheAppJsApiTicket)
    return {
      corpTicket: cacheCorpJsApiTickets,
      appTicket: cacheAppJsApiTicket
    }
  }

  // 获取企业 jsapi_ticket 和应用 jsapi_ticket
  console.log('远程获取 ticket', cacheCorpJsApiTickets, cacheAppJsApiTicket)
  const [corpTicketRes, appTicketRes] = await Promise.all([
    QywxBaseController.getRequest('/get_jsapi_ticket', {}, accessToken),
    QywxBaseController.getRequest('/ticket/get', { type: 'agent_config'}, accessToken)
  ]);

  // 写入缓存
  await redis.set(corpJsApiTicketsKey, corpTicketRes.ticket, 'EX', corpTicketRes.expires_in - OFFSET)
  await redis.set(appJsApiTicketsKey, appTicketRes.ticket, 'EX', appTicketRes.expires_in - OFFSET)

  return {
    corpTicket: corpTicketRes.ticket,
    appTicket: appTicketRes.ticket,
  }
}
```

最后在路由里实现更多的逻辑：

```js
const router = require('koa-router')()

const {sign} = require('../controllers/QywxUtilsController');
const QywxUtilsController = require("../controllers/QywxUtilsController");

const prefix = '/api/qywx-utils/';

router.prefix(prefix)

const nonceStr = Buffer.from(new Date().toISOString()).toString('base64')
const timestamp = Date.now();

// 获取应用签名，agentConfig 需要的 sign 字段
router.get('/signatures', async (ctx) => {
  const {url} = ctx.request.query;

  const [parsedUrl] = decodeURIComponent(url).split('#');

  // 获取 js api ticket（包含 corp 和 app）
  const {corpTicket, appTicket} = await QywxUtilsController.getJsApiTickets(parsedUrl, ctx.accessToken);

  console.log('获取 ticket', corpTicket, appTicket);

  // 生成签名
  const corpSignature = sign(corpTicket, nonceStr, timestamp, parsedUrl)
  const appSignature = sign(appTicket, nonceStr, timestamp, parsedUrl)

  ctx.body = {
    meta: {
      nonceStr,
      timestamp,
      url: parsedUrl,
    },
    app: {
      ticket: appTicket,
      signature: appSignature,
    },
    corp: {
      ticket: corpTicket,
      signature: corpSignature,
    },
  }
})
```

初始化 JS-SDK 的方案请看下一节。

## 参考

* [JS-SDK使用权限签名算法](https://work.weixin.qq.com/api/doc/90001/90144/90539)
