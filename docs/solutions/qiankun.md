# 微前端（重榜）

侧边栏本质上就是一个 H5 页面，需要在企业微信后台里配置对应的 `name` 和 `url` ：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af61dcddd8924ca78bb2661798ad1df7~tplv-k3u1fbpfcp-watermark.image?)

如果你了解过微前端，那么对这种 **“通过配置不同 `name` 和 `url` 来展示不同页面”** 的开发模式一定不陌生，因为无论哪个微前端框架，它们注册微应用的方式和侧栏配置简直一模一样：

```js
import { registerMicroApps } from 'qiankun';

registerMicroApps(
  [
    {
      name: 'app1',
      entry: '//localhost:8080',
      container: '#container',
      activeRule: '/react',
      props: {
        name: 'kuitos',
      },
    },
  ],
  {
    beforeLoad: (app) => console.log('before load', app.name),
    beforeMount: [(app) => console.log('before mount', app.name)],
  },
);
```

所以，我根据微前端管理不同页的思路，使用 [qiankun](https://qiankun.umijs.org/zh) 这个微前端框架来搭建了一个 **微前端 + 侧边栏** 的开发模板。

* [微前端 + 侧边栏开发模板 Github 地址](https://github.com/wecom-sidebar/wecom-sidebar-qiankun-tpl)

模板实现效果：

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b0f7b54bb7a4a6997952e5ef63a27ae~tplv-k3u1fbpfcp-watermark.image?)

**如果你只想把项目跑起来，那看这个 Repo 的 `README.md` 就可以了。如果你想了解有关这个项目的想法和实现细节，那可以接着往下看。**

## 为什么要用微前端

相似不代表非要上微前端。只不过，在管理多个应用时，会出现下面的问题：

-   **所有侧栏应用为硬隔离**。切换不同应用都要重新加载
-   **基础信息不共享**。重新加载又需要重新初始化 JS-SDK 和获取群聊、私聊、用户身份的信息，而这些信息对于每个应用都是必需的，不应该每次都重新获取
-   **方便多团队协作**。应对已有 H5 嵌入到侧边栏的场景

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d73ce9eeb2cc460593f407e7c19dcc1a~tplv-k3u1fbpfcp-watermark.image?)

## 微前端思路

刚刚提到通过注册多个微应用实现 “注册多个侧边栏应用” 的方式就是一个很好的管理方法。

除此之外，我还希望有如下功能：

-   微应用可以从主应用获取一些公共信息，比如 `userId` 之类
-   微应用同时可以获取主应用的 `jsSdk` 对象，直接使用 `jsSdk` 与企业微信交互
-   主应用会自动完成 `用户身份验证` 和 `JS-SDK` 的初始化，微应用不再需要做公共逻辑，自动拥有业务所需数据
-   主应用除了像 Router 那样自动注册微应用，还能在指定 container 里手动注册微应用

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6896b47dcc8d4000a51fee356b5223be~tplv-k3u1fbpfcp-watermark.image?)

[qiankun](https://qiankun.umijs.org/zh) 这个微前端框架非常完美地解决上面的问题。

## 主应用 - 初始化

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1bc727dd065642adaae86ab2d5111741~tplv-k3u1fbpfcp-watermark.image?)

从刚刚的分析可以看出来主应用需要完成两个事情：
* 执行公共逻辑：获取用户身份、将 JS-SDK 初始化
* 获取公共数据：`userId`, `context`, `chat` 等需要共享的侧栏公共数据和业务数据

而在我之前写的 [wecom-sidebar-react-tpl](https://github.com/wecom-sidebar/wecom-sidebar-react-tpl) React 侧边栏开发模板里已经实现了大部分内容，所以这里直接用现成的公共逻辑就完事了。

这个项目主要添加了主应用的配置：

```tsx
import {initGlobalState, MicroAppStateActions, registerMicroApps, start} from "qiankun";
import {JsSDK} from "../jsSdk";
export const subAppContainerId = 'sub-app-container';
export const subAppContainer = `#${subAppContainerId}`;

// 初始化 state
export const microAppStateActions: MicroAppStateActions = initGlobalState({});

// 获取需要传递给微应用的 props
const initPassProps = async (jsSdk: JsSDK) => {
  const res = await jsSdk.invoke<{ chatId: string }>('getCurExternalChat');
  return {
    jsSdk,
    isChat: !!res
  }
}

// 启动 qiankun 的主应用
const initQiankunMainApp = async (jsSdk: JsSDK) => {
  const passProps = await initPassProps(jsSdk);

  // 添加 state 变更监听
  microAppStateActions.onGlobalStateChange((state, prev) => {
    console.log('[主应用]', state, prev);
  });

  // 注册并启动微前端
  registerMicroApps([
    {
      name: 'react-app',
      entry: '//localhost:3001',
      container: subAppContainer,
      activeRule: '/#/react-app',
      props: passProps
    },
    {
      name: 'sidebar-app',
      entry: '//localhost:3002',
      container: subAppContainer,
      activeRule: '/#/sidebar-app',
      props: passProps
    }
  ]);

  // 启动主应用
  start();
}

// 初始化主应用内容
export default initQiankunMainApp;
```

`initQiankunMainApp` 函数需要传入 `jsSdk`，然后通过 `jsSdk` 与企业微信交互，获取私聊、群聊的内容，再通过 `props` 的方式传给微前端。当微应用在 `mount` 的时候，就可以拿到初始的公共数据了。

如果数据有变动的话，比如调用了 `login`，可以通过下面代码来更新 `globalState`:

```js
function login() {
    ... 登录逻辑
    microAppStateActions.setGlobalState({
      msg: '新内容'
    })
}
```

更新了之后，微应用也需要添加 `onGlobalStateChange` 来监听数据变化。 *不过，因为只是获取公共数据，所以一般来说 `globalState` 的变化不会特别频繁。*

后面的注册微应用就比较简单了，配置一下 `name` 和 `entry` 就差不多了。这里需要注意的是 `activeRule` 我写的是 `/#/xxx-app`，这是因为我在主应用用了 Hash Router，路由部分等会再说。

因为需要在处理完公共逻辑再注册微应用，所以在入口文件 `index.tsx` 中要这么写：

```tsx
import { ConfigProvider} from 'antd';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale/zh_CN';
import App from './App'
import {fetchUserId, fetchSignatures} from './api'
import config from './_config'
import {invokeResMock, mockUserId, wxResMock} from "./mock";
import {checkRedirect, createJsSdk, initSdk} from "./lib";

import 'antd/dist/antd.css';
import initQiankunMainApp from "./lib/utils/initQiankunMainApp";

export const jsSdk = createJsSdk(wxResMock, invokeResMock);

const AppWrapper = (
  <ConfigProvider locale={zhCN}>
    <App />
  </ConfigProvider>
)

checkRedirect(config, fetchUserId, mockUserId) // 重定向获取 code（用户身份）
  .then(() => initSdk(config, fetchSignatures)) // 初始化 JsSdk
  .then(() => initQiankunMainApp(jsSdk)) // 初始化主应用，并注册好微应用
  .then(() => ReactDOM.render(AppWrapper, document.getElementById('root'))) // 渲染主应用内容
```

## 主应用 - 路由

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b1df8f4cee6b4c7dbbcd91bc373a8682~tplv-k3u1fbpfcp-watermark.image?)

如果只是 `主-微` 这样的架构还是比较简单的，但是我希望主应用也能作为一个侧栏应用去使用，它也可以拥有自己的样式、一些简单的功能，所以 **我觉得在主应用拥有自己的路由系统是一个合理的需求。**

这里我使用了 Hash Router，这是因为如果用 history 模式的 Browser Router，每次切换路由都要初始化 JS-SDK，太麻烦了，具体参见 [文档这里的步骤二](https://open.work.weixin.qq.com/api/doc/90001/90144/90547)。

> 如果非要用 history 模式，也可以在路由切换的回调里初始化，不过我总感觉可能会出一些奇怪的 Bug

我把之前 [wecom-sidebar-react-tpl](https://github.com/wecom-sidebar/wecom-sidebar-react-tpl) 项目的所有功能都放在首页上了，所以这里的路由仅有一个首页：

```tsx
const RouterConfig: FC = () => {
  return (
    <Switch>
      <Route exact path="/">
        <Home/>
      </Route>
    </Switch>
  )
}

export default RouterConfig;
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b3bdc5d8d5a04b64bc74c060cd03cac7~tplv-k3u1fbpfcp-watermark.image?)

从上图可以看到通过 Ant Design 的 `<Menu/>` 组件划分了 3 个 Tab，其中第一个 **首页** 就是主应用里的 `<Home/>` 组件，仅是个普通 React 组件，而剩下的 `sidebar-app` 和 `react-app` 才是后面要讲的微应用。

## 微应用 - 初始化

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aba2b19e5e314de299a4336aa9a9b19d~tplv-k3u1fbpfcp-watermark.image?)

这两个微应用我都使用了 [create-react-app](https://create-react-app.dev/) 来创建，然后按照 [qiankun 官方文档的“项目实践”章节](https://qiankun.umijs.org/zh/guide/tutorial) 来配置微应用。本来不想再讲一遍的，但是在配置过程也发现一些问题，就展开讲讲吧。

### 第一步 - publicPath
在 `/src` 下新增 `public-path.ts` 文件：

```ts
const updatePublicPath = () => {
  if (window.__POWERED_BY_QIANKUN__) {
    // @ts-ignore
    __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
  }
}

updatePublicPath();

export default {}
```

不写成官网的格式是因为 CRA 的 TS 模板会报 tslint 的错误：

```
TS1208: 'public-path.ts' cannot be compiled under '--isolatedModules' because it is considered a global script file. Add an import, export, or an empty 'export {}' statement to make it a module.
```

报错的意思是一个文件必须要 `export` 一个东西才可以，所以只能写成上面这样。

然后在入口文件的 `index.tsx` 里的 **第一行** 引入并执行它：

```ts
import './public-path';
```

一定要在 **第一行** 引入它，因为它直接决定了你 **静态资源** 的 `publicPath`。比如，你在组件里使用了图片资源：

```tsx
import logo from './logo.svg';

function App(props: Props) {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
    </div>
  );
}
```

如果没有执行这个 `publicPath`，或者单独运行 `react-app` 的话，这里的 `logo` 路径会变成 `/static/media/logo.6ce24c58.svg`。

而我们主应用的 URL 是 `localhost:3000`，微应用的 URL 是 `localhost:3001`。所以当内嵌到主应用时，图片 URL 就变成了 `localhost:3000/static/media/logo.6ce24c58.svg`，但是主应用没有这个 SVG 呀，然后资源就会报 404 报错了。

这里的 `public-path.ts` 就是在希望在 Webpack 打包的时候，把前面的 `localhost:3001` 定死，访问资源时就会去微应用那找了。

### 第二步 - basename
在 Router 里添加 `basename` 属性。

```tsx
import {HashRouter} from "react-router-dom";

function App() {
  return (
    <HashRouter basename={window.__POWERED_BY_QIANKUN__ ? '/sidebar-app' : '/'}>
      <div className={styles.app}>
        <VerticalMenu />
        <RouterConfig />
      </div>
    </HashRouter>
  );
}
```

**注意：主应用和微应用都使用 Router 时，Router 类型（history 模式/hash 模式）必须是一样，不然会有很多问题。**

**注意：当我在写主应用的时候 React Router 已经来到了 v6.x 的版本，而主应用用的依然是 v5.x，所以，我觉得这也是微前端框架的一个优势吧，可以磨平主、微应用的技术栈。**

添加了 `basename` 之后，就可以直接写 `path` 了，不用写成 `/sidebar-app/home` 这种带有前缀的写法了：

```tsx
export const routes = [
  {url: '/', label: '首页', page: Home},
  {url: '/external-user', label: '私聊', page: ExternalUser},
  {url: '/external-chat', label: '群聊', page: ExternalChat},
  {url: '/action', label: '操作', page: Action},
]

const RouterConfig: FC = () => {
  return (
    <Routes>
      {routes.map(route => (
        <Route key={route.url} path={route.url} element={<route.page/>}/>
      ))}
    </Routes>
  )
}
```

路由跳转也可以直接写 `path`，下面的 `routes` 用的是上面的 `routes` 数组：

```tsx
const VerticalMenu: FC = () => {
  const location = useLocation();

  return (
    <Menu
      style={menuStyle}
      className={styles.menu}
      defaultSelectedKeys={[location.pathname]}
      mode="vertical"
    >
      {routes.map(route => (
        <Menu.Item className={styles.item} key={route.url}>
          <Link to={route.url}>{route.label}</Link>
        </Menu.Item>
      ))}
    </Menu>
  )
}
```

### 第三步 - 暴露生命周期
在微应用的入口 `index.tsx` 处 `export` 生命周期回调函数：

```tsx
import './public-path'
import {ConfigProvider} from "antd";
import React from 'react';
import {Provider} from "react-redux";
import ReactDOM from 'react-dom';
import App from './App';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale/zh_CN';

import 'antd/dist/antd.css';
import store from "./store";

const AppWrapper = (
  <ConfigProvider locale={zhCN}>
    <Provider store={store}>
      <App />
    </Provider>
  </ConfigProvider>
);

// 渲染应用
const render = (props: any) => {
  const { container } = props;
  const containerElement = container ? container.querySelector('#root') : document.querySelector('#root');
  ReactDOM.render(AppWrapper, containerElement);
}

// 到处 qiankun 需要的生命周期钩子
export const bootstrap = async () => {
  console.log('[微应用 sidebar-app] bootstrap');
}

export const mount = async (props: any) => {
  props.onGlobalStateChange((state: any) => {
    // 将 jsSdk 更新到 store 中
    store.dispatch({ type: 'SET_JSSDK', payload: state.jsSdk })
  });

  // 更新 jsSdk
  store.dispatch({ type: 'SET_JSSDK', payload: props.jsSdk })

  console.log('[微应用 sidebar-app] mount', props);
  render(props);
}

export const unmount = async (props: any) => {
  console.log('[微应用 sidebar-app] unmount', props);
  const { container } = props;
  ReactDOM.unmountComponentAtNode(container ? container.querySelector('#root') : document.querySelector('#root'));
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}
```

在 `mount` 回调里，我们可以接收上面提到主应用传来的 `props`，在这个 `props` 里提取 `isChat` 和 `jsSdk` 两个数据，并将其设置到 redux store 中，作为整个微应用的全局状态。

相信是个人都会用 redux 了，那关于 `mapStateToProps`、`mapDispatchToProps`、`useDispatch` 和 `useSelector` 这些就不展开说了，拿到 `jsSdk` 可以像主应用那样去调用 API 就可以了。

又或者你不想用 redux，每次状态变更后都重新渲染一次应用也是可以的，这个我在 `react-app` 里实现了：

```tsx
import './public-path';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// 渲染函数
const render = (props: any) => {
  const { container, user } = props;
  ReactDOM.render(<App user={user} />, container ? container.querySelector('#root') : document.querySelector('#root'));
}

// qiankun 微应用的导出函数
export const bootstrap = async () => {
  console.log('[微应用 react-app] bootstrap');
}

export const mount = async (props: any) => {
  // 每次变更状态，都重新 render 一次，然后把更新的状态和 props 都传给 App 组件
  props.onGlobalStateChange((state: any) => {
    console.log('[微应用 react-app] onGlobalStateChange', state);
    render({
      ...props,
      ...state,
    })
  });

  console.log('[微应用 react-app] mount', props);
  render(props);
}

export const unmount = async (props: any) => {
  console.log('[微应用 react-app] unmount', props);
  const { container } = props;
  ReactDOM.unmountComponentAtNode(container ? container.querySelector('#root') : document.querySelector('#root'));
}

// @ts-ignore
if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}
```

### 第四步 - 修改 Webpack 配置

这里根据官网做的就好了，先装个 `rescripts/cli`，把 CRA 那个垃圾脚手架给换成 `rescripts`：

```shell
npm i -D @rescripts/cli
```

根目录新增 `.rescriptsrc.js`：

```ts
const { name } = require('./package');


module.exports = {
  webpack: (config) => {
    config.output.library = `${name}-[name]`;
    config.output.libraryTarget = 'umd';
    config.output.jsonpFunction = `webpackJsonp_${name}`;
    config.output.globalObject = 'window';


    return config;
  },


  devServer: (_) => {
    const config = _;


    config.headers = {
      'Access-Control-Allow-Origin': '*',
    };
    config.historyApiFallback = true;
    config.hot = false;
    config.watchContentBase = false;
    config.liveReload = false;


    return config;
  },
};
```

最后修改 `package.json`：

```diff
-   "start": "react-scripts start",
+   "start": "rescripts start",
-   "build": "react-scripts build",
+   "build": "rescripts build",
-   "test": "react-scripts test",
+   "test": "rescripts test",
-   "eject": "react-scripts eject"
```

整个微应用的配置就做好了。

## 主应用手动加载微应用

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/35964cebdf9f403d88671c97ea4bf36a~tplv-k3u1fbpfcp-watermark.image?)

除了像注册路由一样去注册微应用，也可以调用 qiankun 的 `loadMicroApp` 来在指定的 `container` 元素下加载这个微应用。

比如，我就在主应用的 “首页” 里手动加载 `react-app`，并在加载时传入 `user` 用户身份对象：

```tsx
const Home: FC = () => {
  ...
  return (
    <Spin spinning={loading}>
      <div>
        {/* 手动加载微应用 */}
        <MicroAppComponent user={user}/>
      </div>
    </Spin>
  )
}
```

`MicroAppComponent` 代码:

```tsx
import {FC, useEffect, useRef} from 'react';
import {loadMicroApp, MicroApp} from "qiankun";

let microAppComponent: MicroApp;

interface Props {
  user?: UserResponse
}

const MicroAppComponent: FC<Props> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 当应用更新时，将 props 传递
  useEffect(() => {
    if (microAppComponent && microAppComponent.update) {
      microAppComponent.update(props).then()
    }
  })

  useEffect(() => {
    // 初始化微应用
    if (containerRef.current) {
      microAppComponent = loadMicroApp({
        name: 'react-app-nested',
        entry: '//localhost:3001',
        container: containerRef.current,
        props,
      });
    }

    // 将微应用 unmount
    return () => {
      microAppComponent.unmount().then();
    }
  }, [props])

  return (
    <div>
      <h2>微应用</h2>

      <div ref={containerRef}/>
    </div>
  )
}

export default MicroAppComponent;
```

## 总结

好了，我们来做一下总结吧，毕竟这个项目也花了一点时间来做的。

* 主应用基于 [wecom-sidebar-react-tpl](https://github.com/wecom-sidebar/wecom-sidebar-qiankun-tpl) 来开发，前置的配置、Mock、初始化逻辑均继承该项目
* 主应用使用 `loadMicroApp` 手动加载一个微应用
* 主应用在 `registerMicroApps` 注册微应用（侧边栏应用），并在 `props` 传入共享数据和 `JsSdk`
* 微应用在暴露的生命周期里的 `mount` 的参数 `props` 中获取主应用传递的数据
* 微应用拿到主应用数据后，可以选择放到 redux 的 store 去管理，也可以在 `onGlobalStateChange` 回调中重新 `render` 整个应用，随你选哪种
* 主、微应用都可以有各自的路由，但是路由类型必须一致，不然会有大惊喜！微应用需要在 Router 处添加 `basename`，去掉写前缀的写法


**最后的我自己的建议是：主应用应该拥有自己的样式、欢迎页、首页、路由，或者编写自己部门的侧边栏应用，然后使用 qiankun 留出一个入口，用于承载别的部门的侧边栏就用。**