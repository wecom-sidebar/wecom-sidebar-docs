# 初始化 JS-SDK

## 简介

上一节已经写好 `prepareSign` 用于获取权限签名的函数，初始化这一步就相对简单多了。

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
export const config = (setting: wx.Setting): Promise<wx.ConfigCallbackRes> => {
  return new Promise((resolve, reject) => {
    wx.config({ ...setting });
    wx.ready(res => resolve(res));
    wx.error(err => reject(err));
  });
};

/**
 * jssdk 的 agentConfig 函数封装
 * @param agentSetting
 */
export const agentConfig = (agentSetting: Omit<wx.AgentSetting, 'success' | 'fail'>): Promise<wx.ConfigCallbackRes> => {
  return new Promise((resolve, reject) => {
    wx.agentConfig({
      ...agentSetting,
      success: resolve,
      fail: reject,
      complete: resolve,
    });
  });
};

/**
 * 通用调用企业微信 SDK 的函数
 * @param apiName api 名称
 * @param params 传入参数
 */
export const invoke = <Res = {}>(apiName: wx.Api, params = {}) => {
  return new Promise<wx.InvokeCallbackRes & Res>((resolve, reject) => {
    wx.invoke<Res>(apiName, params, res => {
      if (res.err_msg === `${apiName}:ok`) {
        resolve(res);
      } else {
        reject(res);
      }
    });
  });
};
```

## 初始化

结合上一节的 `prepareSign`，就可以完成初始化的步骤了。

这里需要的参数有：

* config: 包括 corpId，agentId
* getAppTicket: 获取 appTicket 的 AJAX 回调
* getCorpTicket: 获取 corpTicket 的 AJAX 回调
* getUserId: code 换取 userId 的 AJAX 回调

实现如下：

```ts
export interface Config {
  corpId: string;
  agentId: string;
}

export interface Options {
  config: Config
  getAppTicket: GetTicket
  getCorpTicket: GetTicket
  getUserId: GetUserId
}

/**
 * 初始化企业微信 SDK 库
 * @param options 自建应用的基本信息
 */
const initSdk = async (options: Options) => {
  const { corpId, agentId } = options.config;

  const nonceStr = btoa(new Date().toISOString());
  const timestamp = Date.now();

  // 获取 ticket
  const { appSign, corpSign } = await prepareSign(nonceStr, timestamp, options.getAppTicket, options.getCorpTicket);

  // corpSign 存在则说明版本 < 3.0.24
  // 注意：这里不能做并行操作，要先 config 再 agentConfig
  if (corpSign) {
    await jsSdk.config({
      beta: true,
      debug: false,
      appId: corpId,
      timestamp,
      nonceStr,
      signature: corpSign,
      jsApiList: apis,
    }).catch(e => {
      console.error(e)
    });
  }

  await jsSdk.agentConfig({
    corpid: corpId,
    agentid: agentId,
    timestamp,
    nonceStr,
    signature: appSign,
    jsApiList: apis,
  }).catch(e => {
    console.error(e)
  });
};
```

初始化使用：

```ts
const options = {...}

initSdk(options)
```

## 参考

* [JS-SDK 使用说明](https://work.weixin.qq.com/api/doc/90001/90144/90547)
* [JS-SDK 基础接口](https://work.weixin.qq.com/api/doc/90001/90144/90548)
