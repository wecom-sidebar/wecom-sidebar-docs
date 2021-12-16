# SDK API

主要提供 3 个 API，对已有的的 `wx.fn` 和 `wx.invoke('xxx')` 进行封装，功能有：

* TS 完美提示，包括调用 API 名、入参和出参
* 支持 Promise 异步调用，你可以直接写 async/await 语法，避免回调地狱

## asyncCall

封装了 `wx.fn` 的调用方式，使得可以直接异步 Promise 调用，比如：

以前你这么写：

```js
wx.checkJsApi({
  jsApiList: ['chooseImage'], // 需要检测的JS接口列表
  success: function (res) {
    // 以键值对的形式返回，可用的api值true，不可用为false
    // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
  }
});
```

现在可以这么写：

```js
import {asyncCall} from 'wecom-sidebar-jssdk';

const res = await asyncCall({
  jsApiList: ['chooseImage']
})

console.log(res.checkResult);
```

只要 `wx.fn` 里需要传 `success` 的，都可以使用 `asyncCall` 来直接调用。

下面是调用参数

| 参数      | 描述                      | 类型     |
|---------|-------------------------|--------|
| apiName | `wx.fn` 的 fn 名          | string |
| params  | `wx.fn` 调用时的参数（不需要传回调了） | {}     |

返回参数为 `success` 回调时的参数。

失败时，会直接抛出 `errMsg.msg` 的内容，可通过 `console.log(e.message)` 查看。

## call

同步调用 `wx.fn` 的封装方法。因为某些接口调用是不需要异步等结果的，所以这个 API 和原来的 `wx.fn` 调用没什么差别，只不过会有更好的 TS 提示：

以前写法：

```js
wx.startRecord();
```

现在写法：

```js
import {call} from 'wecom-sidebar-jssdk';

call('startRecord');
```

下面是调用参数

| 参数      | 描述                      | 类型     |
|---------|-------------------------|--------|
| apiName | `wx.fn` 的 fn 名          | string |
| params  | `wx.fn` 调用时的参数（不需要传回调了） | {}     |

## invoke

对 `wx.invoke('xxx')` 调用方法进行封装，可以直接使用 async/await 的方式来异步调用。

以前写法：

```js
wx.invoke('getCurExternalContact', {}, function (res) {
  if (res.err_msg == "getCurExternalContact:ok") {
    userId = res.userId; //返回当前外部联系人userId
  } else {
    //错误处理
  }
});
```

现在写法：

```js
import {invoke} from 'wecom-sidebar-jssdk';

const res = await invoke('getCurExternalContact', {});

console.log(res.userId);
```

下面是调用参数：

| 参数      | 描述                         | 类型     |
|---------|----------------------------|--------|
| apiName | `wx.invoke('xxx')` 的 xxx 名 | string |
| params  | `wx.invoke('xxx')` 调用时的参数  | {}     |

返回值为 `wx.invoke('xxx', callback)` 里 callback 的结果。

失败时，会抛出 `res.err_msg` 的内容，可通过 `console.log(e.message)` 查看。
