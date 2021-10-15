module.exports = {
  base: '/docs/',
  title: '企微侧栏',
  description: '企业微信侧边栏开发方案、教程、FAQ',
  themeConfig: {
    logo: '/images/logo.png',
    sidebar: [
      {
        title: '介绍',
        collapsable: false,
        children: [
          '/',
          '/intro/about'
        ]
      },
      {
        title: 'Hello World',
        collapsable: false,
        children: [
          '/hello_world/prepare',
          '/hello_world/concept',
          '/hello_world/config_sidebar',
          '/hello_world/config_jssdk',
          '/hello_world/run_demo',
          '/hello_world/dev_env',
          '/hello_world/browser_dev',
        ]
      },
      {
        title: '方案',
        collapsable: false,
        children: [
          '/solutions/cache',
          '/solutions/user_auth',
          '/solutions/get_jsapi_ticket',
          '/solutions/init_jssdk'
        ]
      },
      {
        title: 'FAQ',
        collapsable: false,
        children: [
          '/faq/has_jssdk_npm',
          '/faq/agentConfig_is_not_a_function',
          '/faq/can_not_open_debug',
          '/faq/localStorage_reset',
          '/faq/localStorage_not_reset',
        ]
      }
    ]
  }
}
