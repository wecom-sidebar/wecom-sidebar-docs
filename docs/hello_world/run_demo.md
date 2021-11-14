# 开发模板

我自己在第一次写页面的时候遇到过很多问题，这里提供一个我写好的前端模板给大家使用，基于这个模板来开发会让你省去不少麻烦。
相应的，会也有一个基于 Koa 开发的后端模板，这两个模板需要一起使用。

* [前端模板Github](https://github.com/wecom-sidebar/wecom-sidebar-frontend-template)
* [后端模板Github](https://github.com/wecom-sidebar/wecom-sidebar-sls)

*本来真的想写个简单的 Hello World 的，但是牵连的东西实在太多了，所以这里直接给前后端模板了。*

## 模板功能

模板主要实现了以下功能：

* 转发企业微信服务端 API
* 缓存 `access_token` 和 `jsapi_ticket`
* 封装把 `wx` 对象的 API 封装成 `jsSdk`
* 客户端的初始步骤：重定向获取用户身份和初始化 JS-SDK
* Mock 功能，可在浏览器上直接开发

## 后端模板

按照国际惯例先跑后端。

```shell
# 克隆到本地
git clone https://github.com/wecom-sidebar/wecom-sidebar-react-tpl
```

其中需要用到 `corpId`，`agentId`，`corpSecret`，需要先行创建 `.env`（目前已隐藏），示例

```shell
# .env

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# 在 https://work.weixin.qq.com/wework_admin/frame#profile 这里可以找到
CORP_ID=企业ID

# 在 https://work.weixin.qq.com/wework_admin/frame#apps 里的自建应用里可以找到（注意这里是自建应用里的 secret，不是客户联系里的回调 secret）
CORP_SECRET=自建应用的CORP_SECRET

# 在 https://work.weixin.qq.com/wework_admin/frame#apps 里的自建应用里可以找到
AGENT_ID=自建应用的AGENT_ID
```

然后使用 docker 来启动 redis（用于缓存 `access_token` 和 `jsapi_ticket`）：

```shell
docker-compose -f docker-compose.yml up -d
```

安装&启动项目

```shell
# 安装
npm install

# 启动
npm run dev
```

项目会在 5000 端口监听。

## 前端模板

```shell
# 克隆到本地
git clone https://github.com/wecom-sidebar/wecom-sidebar-express-tpl
```

启动项目需要用到 `agentId` 和 `corpId`，需要先行创建 `src/_config.ts`（目前已隐藏），示例

```ts
// src/_config.ts

const config = {
  // 在 https://work.weixin.qq.com/wework_admin/frame#profile 这里可以找到
  corpId: '你的企业ID',
  // 在 https://work.weixin.qq.com/wework_admin/frame#apps 里的自建应用里可以找到
  agentId: '自建应用的AgentId'
}

export default config
```

安装&启动项目

```shell
# 安装
npm install

# 启动项目
npm run start
```

项目会在 [http://127.0.0.1:3000](http://127.0.0.1:3000) 打开， **当然现在在浏览器里是不能正常工作的。
不过没关系，下面我们就要把这个页面放到侧边栏，并显示出来。**