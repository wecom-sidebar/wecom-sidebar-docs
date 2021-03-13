module.exports = {
  title: '/docs/',
  description: '企业微信侧边栏开发方案、教程、FAQ',
  themeConfig: {
    logo: '/images/logo.png',
    sidebar: [
      {
        title: '介绍',
        collapsable: false,
        children: [
          ['/', '封面']
        ]
      },
      {
        title: 'Hello World',
        collapsable: false,
        children: [
          '/guide/prepare',
          '/guide/concept',
          '/guide/config_sidebar',
          '/guide/config_jssdk',
          '/guide/run_demo',
          '/guide/dev_env',
        ]
      },
      {
        title: 'FAQ',
        collapsable: false,
        children: []
      }
    ]
  }
}
