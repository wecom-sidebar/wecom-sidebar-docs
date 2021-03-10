module.exports = {
  title: '企微侧栏权威开发指南',
  description: '企业微信侧边栏开发方案、教程、FAQ',
  themeConfig: {
    logo: '/images/logo.png',
    sidebar: [
      {
        title: '介绍',
        collapsable: false,
        children: []
      },
      {
        title: '指南',
        collapsable: false,
        children: [
          '/guide/prepare',
          '/guide/config_sidebar_h5'
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
