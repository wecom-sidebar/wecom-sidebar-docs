# 切换账号后 localStorage 未被清空

刚说了只有 Mac OS 里 localStorage 不能做缓存，别的端都是 OK 的。

一般用侧边栏的用户都是运营人员，他们的设备多数以 Windows，Android 为主，影响并不大，非要用 localStorage 做缓存也是可以的。

然后，就会出现上面这个问题了。

## 解决方法

经过测试，只有 Cookie 会在企业微信被切换时才会被清空，因此最好把和用户有关的数据放到 Cookie 里，如 userId、Jwt token 等。
而且官方也是推荐把用户身份信息存在 Cookie 上的：[《开始开发-缓存方案建议》](https://open.work.weixin.qq.com/api/doc/90000/90135/91020) 。

使用 localStorage/indexedDB 会一直长存在页面上。

## 参考

* [开始开发-缓存方案建议](https://open.work.weixin.qq.com/api/doc/90000/90135/91020)
