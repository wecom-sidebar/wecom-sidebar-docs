# 初始化 JS-SDK

## 简介

上一节已经写了后端用于获取权限签名的函数，初始化这一步就相对简单多了。

但是 JS-SDK 的初始化函数用得特别蛋疼，没有 TS 类型，没有最佳实践就算了，都 1202 年还用"回调地狱"。
所以，第一步应该把一些重要的 API 都上 Promise。

## promisify

因为官网没有给出最佳实践，在社区也没有找到比较标准的写法，下面只是本人自己的实践，
如果你觉得有问题可以 [直接提 Issue](https://github.com/wecom-sidebar/docs/issues) 。

```ts
/**
 * wx.config 的配置项
 */
interface Setting {
  beta: boolean; // 必须这么写，否则wx.invoke调用形式的jsapi会有问题
  debug: boolean; // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
  appId: string; // 必填，企业微信的corpID
  timestamp: number; // 必填，生成签名的时间戳
  nonceStr: string; // 必填，生成签名的随机串
  signature: string; // 必填，签名，见 附录-JS-SDK使用权限签名算法
  jsApiList: API[]; // 必填，需要使用的JS接口列表，凡是要调用的接口都需要传进来
}

/**
 * wx.agentConfig 的配置项
 */
interface AgentSetting {
  corpid: string; // 必填，企业微信的corpid，必须与当前登录的企业一致
  agentid: string; // 必填，企业微信的应用id （e.g. 1000247）
  timestamp: number; // 必填，生成签名的时间戳
  nonceStr: string; // 必填，生成签名的随机串
  signature: string; // 必填，签名，见附录-JS-SDK使用权限签名算法
  jsApiList: API[]; // 必填
  success?: InvokeCallback; // 成功回调
  fail?: InvokeCallback; // 失败回调
  complete?: InvokeCallback; // 失败或成功都会回调
}

/**
 * jssdk 的 config 函数的封装
 * @param setting
 */
const config = (setting: wx.ConfigParams): Promise<wx.WxFnCallbackRes | null> => {
  return new Promise((resolve) => {
    wx.config({ ...setting });
    wx.ready(() => resolve(null));
  });
};

/**
 * jssdk 的 agentConfig 函数封装
 * @param agentSetting
 */
const agentConfig = (agentSetting: Omit<wx.AgentConfigParams, 'success' | 'fail'>): Promise<wx.WxFnCallbackRes> => {
  return new Promise((resolve, reject) => {
    wx.agentConfig({
      ...agentSetting,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * 通用调用企业微信 SDK 的函数
 * @param apiName api 名称
 * @param params 传入参数
 */
const invoke = <Res = { hasError: boolean }>(apiName: wx.Api, params = {}) => {
  return new Promise<wx.WxInvokeCallbackRes & Res>((resolve) => {
    wx.invoke<Res>(apiName, params, res => {
      const hasError = res.err_msg !== `${apiName}:ok`

      if (hasError) {
        // 错误日志
        console.error(apiName, params, res);
      }

      resolve({ ...res, hasError })
    });
  });
};
```

## 初始化

实现如下，必须要 ready 再调用 agentConfig，不然可能出现 wx 还没加载就调用的问题：

```ts
interface Config {
  corpId: string;
  agentId: string;
}

interface TicketRes {
  meta: {
    nonceStr: string,
    timestamp: number,
    url: string,
  },
  app: {
    ticket: string,
    expires: number,
    signature: string,
  },
  corp: {
    ticket: string,
    expires: number,
    signature: string,
  },
}

export type GetSignatures = () => Promise<TicketRes>

/**
 * 初始化企业微信 SDK 库
 * config: 基础信息配置
 * getSignatures: 获取签名函数
 */
const initSdk = async (jsSdk: JsSDK, config: Config, getSignatures: GetSignatures) => {
  const { corpId, agentId } = config;

  // 获取 ticket
  const signaturesRes = await getSignatures();
  await jsSdk.config({
    beta: true,// 必须这么写，否则wx.invoke调用形式的jsapi会有问题
    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: config.corpId, // 必填，企业微信的corpID
    timestamp: signaturesRes.meta.timestamp, // 必填，生成签名的时间戳
    nonceStr: signaturesRes.meta.nonceStr, // 必填，生成签名的随机串
    signature: signaturesRes.corp.signature,// 必填，签名，见 附录-JS-SDK使用权限签名算法
    jsApiList: apis // 必填，需要使用的JS接口列表，凡是要调用的接口都需要传进来
  })
  const agentConfigRes = await jsSdk.asyncCall('agentConfig', {
    corpid: corpId,
    agentid: agentId,
    timestamp: signaturesRes.meta.timestamp,
    nonceStr: signaturesRes.meta.nonceStr,
    signature: signaturesRes.app.signature,
    jsApiList: apis,
  })

  console.log('agentConfig res', agentConfigRes);
};
```

初始化使用：

```tsx
checkRedirect(config, fetchUserId)
  .then(() => initSdk(config, fetchSignatures))
  .then(() => ReactDOM.render(<App />, document.getElementById('root')))
```

## 参考

* [JS-SDK 使用说明](https://work.weixin.qq.com/api/doc/90001/90144/90547)
* [JS-SDK 基础接口](https://work.weixin.qq.com/api/doc/90001/90144/90548)
