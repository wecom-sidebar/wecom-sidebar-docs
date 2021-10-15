# 浏览器开发（重榜）

在 [前端模板](https://github.com/wecom-sidebar/wecom-sidebar-react-tpl) 中，我添加了对企业微信的 JS-SDK 进行封装，
封装出来的对象为 `jsSdk`，同时提供了 Mock 功能，使得在浏览器上一样可以跑侧边栏应用。

## 我的 JsSdk

因为企业微信官方提供的 JS-SDK 使用起来回调太麻烦了，而且有些步骤（比如 `agentConfig`）是需要另外一些函数的组合的，
所以为了能更好地使用客户端功能，我封装了一个 `jsSdk` 对象，可以更方便地调用 API。

比如，原来你需要这些去调用 `wx.invoke`：

```js
wx.invoke('openUserProfile', {
  "type": 1, //1表示该userid是企业成员，2表示该userid是外部联系人
  "userid": "wmEAlECwAAHrbWYDetiu3Af13xlYDAAA" //可以是企业成员，也可以是外部联系人
}, function (res) {
  if (res.err_msg != "openUserProfile:ok") {
    // 错误处理
  }
});
```

现在，你可以直接使用 `jsSdk.invoke`:

```js
const res = await jsSdk.invoke('openUserProfile', {
  "type": 1, //1表示该userid是企业成员，2表示该userid是外部联系人
  "userid": "wmEAlECwAAHrbWYDetiu3Af13xlYDAAA" //可以是企业成员，也可以是外部联系人
})

if (res.err_msg !== 'openUserProfile:ok') {
  // 错误处理
}
```

**虽然我很想封装一个更通用、可以包含所有 `wx.fn` 的 API，但是 JS-SDK 的调用方式实在太多的，
所以目前只针对 `config`、`agentConfig` 和 `invoke` 三个比较难的函数进行封装。剩下的就靠大家自己用到的时候再封装吧。**

## Mock 能力

有了上面 `jsSdk` 的封装对象，那么我就可以在 Mock 环境下禁用/替换 API 的能力了。

目前我对 Mock 环境的判定为：

```js
// 根据外部判断是否为 mock 环境
const isWindowMock = window.isMock === true;
// 根据宿主环境判断是否要 mock
const isHostMock = navigator.userAgent.toLowerCase().includes('chrome')
  && !navigator.userAgent.toLowerCase().includes('wxwork')
// 是否为 mock 环境
export const isMock = isWindowMock || isHostMock;
```

也即默认会看是否当前为侧边栏环境，如果非侧边栏环境，则开启 Mock 模式。

或者，你也可以在全局写入 `window.isMock = true` 来手动开启 Mock 模式。

## Mock 内容

Mock 模式主要对 `wx.fn` 和 `wx.invoke` 这两种 API 调用的返回值进行 Mock，你可以在 `src/mock.ts` 写 Mock 的返回内容和内容 factory 函数：

```js
// 可在这里自由 mock wx.invoke 的内容
export const invokeResMock: Record<string, any> = window.invokeResMock || {
  'getCurExternalContact': {
    userId: 'wmuUG7CQAAOrCCMkA8cqcCm1wJrJAD6A'
  },
}

// 可在这里自由 wx.fn 的内容
export const wxResMock: Record<string, any> = window.wxResMock || {
  'agentConfig': () => {
    console.log('mock agent config')
  },
}
```

如果直接写 Mock 值，则直接返回 Mock 值，如果写 Mock factory 函数，则会在执行该 Mock 函数。

当然，如果你不想将 Mock 内容写死在项目里，也可以在全局 `window.invokeResMock` 和 `window.wxResMock` 中写 Mock：

## 全局变量

前面说了很多次全局注入 Mock 的思路，但是其实并不是要让大家在代理里直接写 `window.xxx = yyy`，
而是可以利用 [Whistle 的预先注入 JS](https://wproxy.org/whistle/rules/jsPrepend.html) 功能来提前注入这些全局变量。

第一步，在代理配置文件里写入：

```
// 代理规则...
你的域名 jsPrepend://{mock.js}
```

然后你会在 http://127.0.0.1:8899/#values 里发现有一个新增的 `mock.js`

第二步，在这个文件里注入全局变量了。

```js
// 开启 Mock 功能
window.isMock = true;

// 可在这里自由 mock wx.invoke 的内容
window.invokeResMock = {
  'getCurExternalContact': {
    userId: 'wmuUG7CQAAOrCCMkA8cqcCm1wJrJAD6A'
  },
}

// 可在这里自由 wx.fn 的内容
window.wxResMock = {
  'agentConfig': () => {
    console.log('mock agent config')
  },
}
```

