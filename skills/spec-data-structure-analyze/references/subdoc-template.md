# <用途名>

> 用途：会话缓存　实例数：2　返回 [README.md](README.md)

## 1. 核心作用

<2~4 句说明该用途数据结构在本仓承担的核心作用与业务价值>。例：承载终端登录态，鉴权时按 token 快速命中会话，避免每次登录都查库；是 login/event 链路性能与逃生态判定的关键支撑。

## 2. 关键实例清单

| 实例名 | 作用 | 定义位置 |
|---|---|---|
| sessionCache | 终端会话缓存 | models/session.go |
| authCache | 鉴权结果缓存 | service/auth_cache.go |

## 3. 实例详解

对应实例清单逐个说明：

- **sessionCache**
  - 结构：`type sessionCache struct { mu sync.RWMutex; m map[string]*Session }`（models/session.go）
  - 关键字段：m（会话 map，key=token）；mu（读写锁，并发安全）
  - 典型操作：Get/Put 均走 mu.RLock/Lock；过期清理靠定时扫全表
  - 使用点：controllers/login_controller.go:42（Put）、controllers/auth_controller.go:18（Get）
  - 并发模型：读写锁，读多写少

## 4. 使用模式与约定

- 新增缓存一律套 `type Xxx struct { mu sync.RWMutex; m map[K]V }` 封装，禁止裸暴露 map 字段
- 容量与 TTL 策略统一在封装内实现，调用方不感知
