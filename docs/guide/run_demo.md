# 开发模板

我自己在第一次写页面的时候遇到过很多问题，这里提供一个我写好的前端模板给大家使用，基于这个模板来开发会让你省去不少麻烦。
相应的，会也有一个基于 Koa 开发的后端模板，这两个模板需要一起使用。

* [前端模板Github](https://github.com/wecom-sidebar/wecom-sidebar-frontend-template)
* [后端模板Github](https://github.com/wecom-sidebar/wecom-sidebar-sls)

## 使用后端模板

```shell
# 克隆到本地
git clone https://github.com/wecom-sidebar/wecom-sidebar-sls.git
```

其中需要用到 `corpId`，`agentId`，`corpSecret`，需要先行创建 `.env`（目前已隐藏），示例

```.dotenv
# .env

# 在 https://work.weixin.qq.com/wework_admin/frame#profile 这里可以找到
CORP_ID=企业ID

# 在 https://work.weixin.qq.com/wework_admin/frame#apps 里的自建应用里可以找到（注意这里是自建应用里的 secret，不是客户联系里的回调 secret）
CORP_SECRET=自建应用的secret

# 在 https://work.weixin.qq.com/wework_admin/frame#apps 里的自建应用里可以找到 
AGENT_ID=自建应用的AgentId
```

安装&启动项目

```shell
# 安装
npm install

# 启动
npm run dev
```

项目会在 5000 端口监听。

## 使用前端模板

```shell
# 克隆到本地
git clone https://github.com/wecom-sidebar/wecom-sidebar-frontend-template.git
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

项目会在 [http://127.0.0.1:3000](http://127.0.0.1:3000) 打开，当然在浏览器里是不能正常工作的。
不过没关系，下面我们就要把这个页面放到侧边栏，并显示出来。
