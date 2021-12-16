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
        title: '前置工作',
        collapsable: false,
        children: [
          '/pre_work/prepare',
          '/pre_work/concept',
          '/pre_work/config_sidebar',
          '/pre_work/config_jssdk',
          '/pre_work/run_demo',
          '/pre_work/dev_env',
        ]
      },
      {
        title: 'wecom-sidebar-jssdk',
        collapsable: false,
        children: [
          '/jssdk/hello_world',
          '/jssdk/typescript',
          '/jssdk/util_apis',
          '/jssdk/sdk_apis',
          '/jssdk/mock_apis',
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
