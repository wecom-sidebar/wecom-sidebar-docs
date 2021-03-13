# 基本概念

这一章主要介绍一些基本概念，方便理解后面步骤。

## 企业微信管理后台

[创建企业微信时的那个网页，点击登录就进入管理后台了](https://work.weixin.qq.com/wework_admin/frame)

1. 在 Google 搜索企业微信，点第一个
2. 点击登录

## 侧边栏（Tab 栏）

![](./images/sidebar.png)

Tab 栏为红色框内内容，侧边栏页面是 Tab 栏对应的 html 页。

## 自建应用

企业微信管理后台里的"应用管理"可以创建。

![](./images/app.png)

一个自建应用有多个**侧边栏地址**，在自建应用里 **配置到聊天工具栏-配置页面** 可以配置。

自建应用、配置页面、侧边栏的关系如下：

![](./images/app-structure.png)

## 外部联系人（群）

企业微信用户 A 添加了其实企业的用户 B，那么 B 就是这个企业的外部联系人。
比如加了微信用户，就会有`@微信`，这里的"海怪"就是外部联系人。 

![](./images/external-user.png)

把外部联系人加入群聊，这个群就是外部联系群。


![](./images/external-chat.png)

## 配置参数

使用 JsSdk 的时候需要这些重要参数：

* agentId：自建应用的 agentId，不同自建应用会有不同的 agentId
* corpSecret：自建应用的 secret（官网显示 secret），不同自建应用会有不同的 corpSecret
* API管理客户的 Secret：在 客户联系 - 客户 - 点击 API Tag - 弹出面板里的 Secret
* corpId: 我的企业 - 企业ID，一个企业会有一个 ID
