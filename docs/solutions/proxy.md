# 转发服务

侧边栏仅仅是企业微信中的 **客户端 API**，官方还提供了 **服务端 API**，只有将服务跑起来，侧边栏才能真正能用起来，
所以一个企业微信服务端 API 的转发服务就非常重要了。

## 实现

因为大家都是前端，所以这里我直接用 Koa 这个框架来实现了，先实现一个 axios 实例：

```js
const axios = require('axios')

const baseURL = 'https://qyapi.weixin.qq.com/cgi-bin';

const proxy = axios.create({
  baseURL,
  proxy: false // 不指定会报错 SSL routines:ssl3_get_record:wrong version number，参考：https://github.com/guzzle/guzzle/issues/2593
})

module.exports = proxy
```

然后实现一个 `QywxProxyController`：

```js
const proxy = require('../proxy')

const getRequest = async (url, query, accessToken) => {
  const response = await proxy.get(url, {
    params: {
      ...query,
      access_token: accessToken,
    },
  })

  console.log(`get ${url}`, response.data)

  return response.data;
}

const postRequest = async (url, body, accessToken) => {
  const response = await proxy.post(url, body, {
    params: {
      access_token: accessToken
    }
  })

  console.log(`post ${url}`, response.data)

  return response.data;
}

const QywxProxyController = {
  getRequest,
  postRequest,
}
```

最后实现我们的路由：

```js
const router = require('koa-router')()
const QywxBaseController = require("../controllers/QywxProxyController");

const prefix = '/api/qywx-proxy/';

router.prefix(prefix)

const getUrl = (fullUrl) => {
  const [rawUrl] = fullUrl.split('?');
  return rawUrl.replace(prefix, '');
}

router.get('*', async (ctx) => {
  const url = getUrl(ctx.request.url);

  ctx.body = await QywxBaseController.getRequest(url, ctx.request.query, ctx.accessToken)
})

router.post('*', async (ctx) => {
  const url = getUrl(ctx.request.url);

  ctx.body = await QywxBaseController.postRequest(url, ctx.request.body, ctx.accessToken)
})
```

## access_token

为了能成功调用企业微信的服务端 API，我们必须要获取/缓存 `access_token`，这里可以做成一个中间件：

```js
const proxy = require('../proxy')
const redis = require("../redis");

const keys = {
  ACCESS_TOKEN: 'access_token',
  CORP_JSAPI_TICKET: 'corp_jsapi_ticket',
  APP_JSAPI_TICKET: 'app_jsapi_ticket',
}

const OFFSET = 100;

const fetchAccessToken = async () => {
  const response = await proxy.get('/gettoken', {
    params: {
      corpid: process.env.CORP_ID,
      corpsecret: process.env.CORP_SECRET,
    },
  })

  const { access_token, expires_in } = response.data;

  // 存入 redis
  await redis.set(keys.ACCESS_TOKEN, access_token, 'ex', expires_in - OFFSET);

  console.log('远程获取 access_token: ', access_token)

  return access_token
}

module.exports = () => {
  return async (ctx, next) => {
    const cacheAccessToken = await redis.get(keys.ACCESS_TOKEN);

    if (cacheAccessToken) {
      console.log('获取缓存 access_token', cacheAccessToken)
    }

    ctx.accessToken = cacheAccessToken || (await fetchAccessToken())

    await next()
  }
}
```

最后在注册路由的时候可以调起 `access_token` 的中间件：

```js
// 使用绑定 accessToken 的中间件
app.use(accessToken())

// 路由
app.use(qywxProxy.routes(), qywxProxy.allowedMethods())
```

上面就是一个简单的转发服务，这在后面的服务调用中有非常重要的作用！
