module.exports = {
  title: '',
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
          '/guide/config_sidebar_h5',
          '/guide/run_frontend_template'
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
