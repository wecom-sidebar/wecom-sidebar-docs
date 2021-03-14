# 获取 jsapi_ticket 签名

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

下面给出从获取 ticket 到生成 signature 的实现：

```ts
import compareVersions from 'compare-versions'

// 获取 js_ticket 的回调
export type GetTicket = () => Promise<string>

/**
 * 根据 userAgent 检查当前企业微信版本号是否 < 3.0.24
 */
const checkDeprecated = (): boolean => {
  const DEPRECATED_VERSION = '3.0.24'

  const versionRegexp = /wxwork\/([\d.]+)/;
  const versionResult = navigator.userAgent.match(versionRegexp);

  if (!versionResult || versionResult.length < 2) {
    return true;
  }

  const [, version] = versionResult;

  // version < DEPRECATED_VERSION ?
  return compareVersions(version, DEPRECATED_VERSION) === -1
};

/**
 * 获取签名
 * @param nonceStr
 * @param timestamp
 * @param getAppTicket
 * @param getCorpTicket
 */
const prepareSign = async (nonceStr: string, timestamp: number, getAppTicket: GetTicket, getCorpTicket: GetTicket) => {
  const promises = [getAppTicket()]

  // 如果版本 < 3.0.24，还需要获取企业的jsapi_ticket
  if (checkDeprecated()) {
    promises.push(getCorpTicket())
  }

  const [appTicket, corpTicket] = await Promise.all(promises)

  return {
    appSign: sign(appTicket || '', nonceStr, timestamp),
    corpSign: corpTicket ? sign(corpTicket || '', nonceStr, timestamp) : null,
  };
};
```

这里的逻辑是，如果版本 < 3.0.24 则不去获取 corp_ticket，返回则为 `null`。
初始化 JS-SDK 时，可以通过检查 corp_ticket 是否为 `null` 来判断是否需要 `wx.config`。

初始化 JS-SDK 的方案请看下一章。

## 参考

* [JS-SDK使用权限签名算法](https://work.weixin.qq.com/api/doc/90001/90144/90539)
