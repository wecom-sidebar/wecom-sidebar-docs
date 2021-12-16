# 开发模板

我自己在第一次写页面的时候遇到过很多问题，这里提供一个我写好的前端 **（Vue 和 React 任君选择）** 模板给大家使用，
基于这个模板来开发会让你省去不少麻烦。
相应的，会也有一个基于 Koa 开发的后端模板，这两个模板需要一起使用。

* [Vue 前端开发模板](https://github.com/wecom-sidebar/wecom-sidebar-vue-tpl)
* [React 前端开发模板](https://github.com/wecom-sidebar/wecom-sidebar-react-tpl)
* [Express Node 端开发模板](https://github.com/wecom-sidebar/wecom-sidebar-express-tpl)

*本来真的想写个简单的 Hello World 的，但是牵连的东西实在太多了，所以这里直接给前后端模板了。*

## 模板功能

模板主要实现了以下功能：

* 转发企业微信服务端 API
* 缓存 `access_token` 和 `jsapi_ticket`
* 封装把 `wx` 对象的 API 封装成 `jsSdk`
* 客户端的初始步骤：重定向获取用户身份和初始化 JS-SDK
* Mock 功能，可在浏览器上直接开发
