# 工具 API

主要提供两个 API，负责获取用户身份以及初始化 JS-SDK。

## checkRedirect

该函数用于检查是否需要重定向，并自动获取 `userId`，缓存到 Cookie 的函数。

调用后上面方法后，页面 Cookie 为 `document.cookie = 'userId=xxx'`。
你可以通过 `js-cookie` 的 `Cookies.get('userId')` 来取得当前 `userId`。

```ts
import {checkRedirect} from 'wecom-sidebar-jssdk';

// 侧边栏配置
const config = {
  // 在 https://work.weixin.qq.com/wework_admin/frame#profile 这里可以找到
  corpId: 'xxx',
  // 在 https://work.weixin.qq.com/wework_admin/frame#apps 里的自建应用里可以找到
  agentId: 'yyy'
}

// code 换取用户身份
const fetchUserId = async (code: string): Promise<string> => {
  const response = await axios.request({
    method: 'GET',
    url: '/user',
    params: {code}
  });
  return response.data.userId;
}

await checkRedirect(config, fetchUserId)
```

| 参数        | 描述                         | 类型                                   |
|-----------|----------------------------|--------------------------------------|
| config    | 侧边栏基础配置                    | `{ corpId: string; agentId: string}` |
| getUserId | 远程用 `code` 获取 `userId` 的方法 | `(code: string) => Promise<string>`  |

## initSdk

初始化 JS-SDK 的重要方法！自动包含了 `wx.config`，`wx.ready`，`wx.agentConfig` 的逻辑，并支持 Promise 异步，帮你一步到位初始化。

```ts
import {initSdk, SignRes} from "wecom-sidebar-jssdk";

// 侧边栏配置
const config = {
  // 在 https://work.weixin.qq.com/wework_admin/frame#profile 这里可以找到
  corpId: 'xxx',
  // 在 https://work.weixin.qq.com/wework_admin/frame#apps 里的自建应用里可以找到
  agentId: 'yyy'
}

// interface SignRes {
//   meta: {
//     nonceStr: string,
//     timestamp: number,
//     url: string,
//   },
//   app: {
//     signature: string, // 应用 jsapi_ticket 生成的签名
//   },
//   corp: {
//     signature: string, // 企业的 jsapi_ticket 生成的签名
//   },
// }

// 获取签名
export const fetchSignatures = async () => {
  const response = await axios.request<SignRes>({
    method: 'GET',
    url: '/signatures',
    params: {
      url: window.location.href
    }
  })

  return response.data;
}

await initSdk(config, fetchSignatures);
```

| 参数              | 描述                                            | 类型                                   |
|-----------------|-----------------------------------------------|--------------------------------------|
| config          | 侧边栏基础配置                                       | `{ corpId: string; agentId: string}` |
| fetchSignatures | 远程获取企业和应用的生成的签名以及 `noncwStr` 和 `timetamp` 的方法 | `() => Promise<SignRes>`             |

此方法最好放在 `checkRedirect` 之后调用，不然会出现 `WxBridge` 找不到的问题。
