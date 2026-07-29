---
name: spec-external-call-analyze
description: 扫描存量代码仓对外部服务的全部出站调用（HTTP 客户端 / RPC client / IDL client stub / 消息队列生产端 / 进程间通信 / 平台 SDK），按被调用的外部服务维度归类，产出 README 索引 + 每个外部服务一个子文档 external-call-<服务名>.md，每个外部调用接口一个章节（业务场景、接口功能、调用位置、协议信息），归档到代码仓 docs/external-call/ 目录。当需要盘点代码仓依赖哪些下游服务、梳理出站调用清单、做依赖治理/影响分析/新人上手时使用。触发场景包括"外部调用""下游接口""出站调用""调用了哪些外部服务""服务依赖盘点""external call""进程间通信"等。
---

# Spec 外部调用分析（出站接口盘点）

核心思想：与 spec-interface-analyze（入站方向：本服务对外暴露什么接口）互补，本 skill 盘点出站方向——本服务**调用了哪些外部服务的哪些接口**，按目标服务归类成文档。

## 工作流程（三阶段，严格按序执行）

### 阶段 1：全仓扫描，识别出站调用点

按以下模式全仓搜索（兼顾多语言，按仓内实际技术栈取舍）：

- **HTTP 客户端**：RestTemplate / WebClient / @FeignClient、okhttp、HttpClient、requests / httpx、axios / fetch、Go net/http、封装的公司内部 HTTP SDK
- **RPC / IDL client**：gRPC stub（NewXxxClient）、Dubbo @Reference、Thrift client、Kitex/Hertz、自研 RPC 框架 client  stub
- **消息队列生产端**：Kafka producer、RocketMQ producer、RabbitMQ publish、Pulsar producer
- **进程间通信**：Unix domain socket、命名管道、共享内存、本地 RPC/signal 调用
- **平台/公司内部 SDK 出站**：告警 SDK、监控/话统 SDK、证书 SDK、日志 SDK、注册发现 client 等——封装在 stubs/vendor 内但**调用点在业务代码**的也算出站调用，记录业务调用位置
- **外部存储**：外部 DB 连接（GaussDB/MySQL 等，含连接串获取方式）、Redis/OSS 等中间件 client 调用
- **配置辅助定位**：yaml / properties / 配置中心中的下游服务地址（host:port、服务发现名）、代理/网关封装层；微服务框架的 `references`/依赖声明清单

每个调用点记录：协议类型、接口标识（URL path / RPC 方法 / topic）、调用位置（所在文件，**不带行号**）、所在函数与业务模块。

### 阶段 2：判定目标服务归属

按优先级推断每个调用点属于哪个外部服务：

1. **显式服务名**：服务发现名、Feign name、gRPC target、配置 key 中的服务名
2. **配置映射**：host/域名/IP+端口 在配置文件中的服务命名
3. **上下文推断**：包名/类名/常量命名（如 XxxServiceClient）、注释
4. **无法判定的归入「未知服务」分组**，标注待人工确认——**不臆造服务名**

### 阶段 3：生成文档

输出到代码仓 `docs/external-call/` 目录：

1. **README.md**：开头为固定元信息表（表格形式，行结构固定）：

   | 元信息 | 值 |
   |--------|-----|
   | 代码仓 | <仓库名> |
   | 分析基准 | <分支名> 分支 (<YYYY-MM-DD>) |
   | 更新时间 | <YYYY-MM-DD> |
   | Skill | spec-external-call-analyze |
   | 主要语言 | <语言> |
   | 出站协议 | <命中的协议类型，如 HTTP / gRPC / Kafka> |

   其后是外部服务全景——mermaid 依赖图（本服务 → 各下游服务）+ 服务清单表（服务名 / 协议 / 接口数 / 主要业务域 / 归属判定依据）
2. **每个外部服务一个子文档** `external-call-<服务名>.md`：文档内按协议分小节（HTTP / RPC / MQ / IPC），**每个外部调用接口一个章节**：

```markdown
## <接口名：方法+路径 / RPC 方法 / topic>

- 协议：HTTP POST /auth/v1/authIMEI（或 gRPC 方法 / MQ topic / IPC 方式）
- 调用位置：service/instance_service.go（GetInstanceAuth 函数）
- 业务场景：<什么业务流程中发起该调用，从调用点所在函数/模块/注释推断>
- 接口功能：<该调用完成什么功能，请求什么、返回什么>
```

规则：
- **业务场景不得臆造**：从调用点上下文推断；推断不出标「待确认」
- 同一接口多处调用：合并为一个章节，调用位置列出全部文件
- 接口表格（可选）：章节较多时在文档开头加接口清单表（接口名 / 协议 / 调用位置 / 业务场景一句话）
- **预留死代码单列**：客户端封装存在但无任何业务调用方的（如未被引用的 Redis/OSS client），不计入接口清单，仅在 README 附注说明
- **配置声明 vs 实际调用差异**：微服务框架依赖声明（如 references）中声明了但代码中无实际调用的下游，在 README 附注列出，避免误导依赖治理

## 输出规范

- 归档目录：代码仓 `docs/external-call/`（README.md + external-call-<服务名>.md 若干）
- 全程中文输出
- 与 spec-interface-analyze 产出互补：入站看 docs/interface/，出站看 docs/external-call/
