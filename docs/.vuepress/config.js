module.exports = {
  base: '/wecom-sidebar-docs/',
  title: '企微侧栏',
  description: '企业微信侧边栏开发方案、教程、FAQ',
  themeConfig: {
    logo: '/images/logo.png',
    nav: [
      { text: 'Github', link: 'https://github.com/wecom-sidebar' }
    ],
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
        title: '上手',
        collapsable: false,
        children: [
          '/hello_world/prepare',
          '/hello_world/concept',
          '/hello_world/config_sidebar',
          '/hello_world/config_jssdk',
          '/hello_world/run_demo',
          '/hello_world/dev_env',
        ]
      },
      {
        title: '其它',
        collapsable: false,
        children: [
          '/others/link',
        ]
      },
    ]
  }
}
