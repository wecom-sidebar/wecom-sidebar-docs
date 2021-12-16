# Mock API

使用 `wecom-sidebar-jssdk` 后可直接在浏览器上直接调试你的应用。

它的实现原理是将前面的一些调用方法都自动屏蔽了，也可以说是 Mock 掉。由于 SDK 是可以 Mock 的， 那么我也留了一个入口给大家，可以 Mock `wx.fn` 和 `wx.invoke` 的不同返回值。

**如果你什么 Mock 都不设置，wecom-sidebar-jssdk 将会自动根据 navigator.userAgent 来判断当前是否为侧边栏环境。对于非侧边栏环境，会自动开启 Mock，并自动生成 Mock 内容。**

下面都是一些相关的 Setter 操作。

## setIsMock

设置当前是否要 Mock JS-SDK，Mock 之后，应用将会：

* 不再走重定向用 `code` 换 `userId`，而是直接使用 `window._mockUserId` 这个值
* 调用上面 SDK 的 API 时，默认会 `console.log` 当前的入参和出参
* 当发现你自己有写返回的 Mock 值/函数时，自动执行 Mock 函数，或返回 Mock 值

`wecom-sidebar-jssdk` 会自动通过 `navigator.userAgent` 来判定当前是否为侧边栏环境来启动 Mock 环境，
`setIsMock` 只作为一种手动 toggle Mock 环境的方法：

```js
import {setIsMock} from 'wecom-sidebar-jssdk';

setIsMock(true) // 开启 Mock 环境

setIsMock(false) // 关闭 Mock 环境
```

当然你直接 `window._isMock = true/false` 来设置也是可以的。

## setMockUserId

在 Mock 环境下，自动读取 `window._mockUserId` 值，此方法为设置该值：

```js
import {setMockUserId} from 'wecom-sidebar-jssdk';

setMockUserId('xiaoming');
```

当然你直接 `window._mockUserId = 'xxx'` 来设置也是可以的。

## setWxResMock

在 Mock 环境下，当调用 `asyncCall` 或 `call` 时，自动 `window._wxResMock` 里拿 mock value 作为返回值，如果 mock function， 则会直接执行并返回。

使用示例：

```js
import {setWxResMock} from 'wecom-sidebar-jssdk';

wxResMock = {
  agentConfig: () => {
    console.log('mock agent config')
    return 'hello';
  },
  startRecord: 'ok'
}

setWxResMock(wxResMock) // 设置 mock

const hello = await asyncCall('agentConfig', config); // 打印 mock agent config，并返回 'hello'
const ok = call('startRecord') // 返回 'ok'
```

当然你直接 `window._wxResMock = { ... }` 来设置也是可以的。

## setInvokeResMock

在 Mock 环境下，当调用 `invoke` 时，自动 `window._invokeResMock` 里拿 mock value 作为返回值，如果为 mock function， 则会直接执行并返回。

使用示例：

```js
import {setInvokeResMock} from 'wecom-sidebar-jssdk';

const invokeResMock = {
  'getCurExternalContact': {
    userId: 'xxx'
  },
  'openUserProfile': 'yyy'
}

setInvokeResMock(invokeResMock) // 设置 mock

await invoke('getCurExternalContact'); // 返回 { userId: 'xxx' }
await invoke('openUserProfile', {...}) // 返回 'yyy'
```

当然你直接 `window._invokeResMock = { ... }` 来设置也是可以的。
