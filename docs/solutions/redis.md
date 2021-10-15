# redis

因为 jsapi_ticket 是不能一直获取的，需要缓存到 redis 上，所以需要 redis。

可以使用 Docker 来启动 redis：

```yaml
version: '3'
services:
  redis:
    image: redis
    container_name: 'wecom-sidebar-redis'
    ports:
      - "6379:6379"
    restart: always
```

然后输出一下 redis：

```js
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

module.exports = redis
```
