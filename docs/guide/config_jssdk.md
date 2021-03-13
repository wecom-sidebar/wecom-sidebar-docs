# 配置 JsSdk

这一步非常关键。JsSdk 的配置直接影响到用户身份的获取，JsSdk 一些 API 的使用。

## 网页授权及JS-SDK

配置这一步可以让我们在侧边栏使用官方提供的 **JsSdk（非常重要！）**。

在 [企业微信管理后台](https://work.weixin.qq.com/) - 应用管理 - 自建应用 - 选择自己的应用 - 找到"网页授权及JS-SDK" 点击设置可信域名

![](./images/config_trusted_url.png)

按照提示下载文件，并上传到自己服务器的根目录下，然后填写可信域名，再点击确实就OK了。

**没域名、没主机的人请看下面。**

## 我啥也没有怎么办？（目前没有云主机和域名必看）

对于刚开始开发的你来说，上面的步骤很扯淡。

我就做个 Demo，我TMD还要自己申请云主机、申请域名、再做个域名备案。等这些都准备好了，
一个月都过去了，老板还没看到线上 Demo，可能明天你的工位就坐着别人了。

什么东西可以又有域名，又有主机，还免费呢？云函数呀！云函数一般按量收费，这个就做可信域名验证一下根本没有流量好吧！

这时候，前期准备的云账号就有用了，先去你自己的云厂商申请一个云函数（我这里就用腾讯云做示范）。

以 Koa 为模板创建一个云函数。

![](./images/create-scf-1.png)

![](./images/create-scf-2.png)

部署云函数（如果没有 API 网关，自己创建一个就好了）。

![](./images/scf-created.png)

部署成功后会看到已经生成好的域名，这就可以作为侧边栏可信域名。

下一步，返回到企业微信管理后台的自建应用里，把密钥文件 `WW_verify_xxxxxx.txt` 下载，然后在云函数里创建并写入这个文件

![](./images/create-secret.png)

最后，在 `sls.js` 里把 index.html 改为我们的 `WW_verify_xxxxxx.txt`，让所有请求都返回这个文件。

![](./images/koa_secret.png)

重新部署后，到 "触发管理" 里访问生成的路径，就会看到我们的 secret 内容了（当然这里会有风险，可以在 API 里自己设置安全组。不过一般来说，作为 Demo 问题不大）。

![](./images/check-secret.png)

一般生成的访问路径都是类似：https://service-xxxxxxxx.yy.apigw.tencentcs.com/release/ 这样的，这里的 **service-xxxxxxxx.yy.apigw.tencentcs.com** 
就是我们的可信域名了。

回到企业微信管理后台，把上面的域名填入，并勾选"用于OAuth2.0回调的可信域名是否校验"，点击确定。会显示"修改成功"。

恭喜你，最难的一步终于搞定啦，给自己鼓鼓掌 👏

## 开通"外部联系人相关接口"

上面配置了 JsSdk 并不代表文档里所有的接口都能用上，像获取外部联系人 Id 的 API 还是用不了的，还要再配置。

到客户信息 - 客户开通当前自建应用的**外部联系人相关接口权限（非常重要！）**。

![](./images/config-external-permission.png)

给自己的自建应用添加使用外部联系人API的权限。

![](./images/add-external-permission.png)

到此，你已经可以完美使用企业微信的 JsSdk 了 🙌 🎉
