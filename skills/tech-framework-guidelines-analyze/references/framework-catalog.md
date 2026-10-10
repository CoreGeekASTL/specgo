# 基础框架分类目录与探测特征

用于第 2 步「框架探测」：对照本目录逐项排查，确保不漏类别；扫描脚本内置模式未覆盖时，按"探测线索"自行 grep 或追加自定义模式。

## 排查顺序建议

1. 先读依赖清单（go.mod / pom.xml / package.json / requirements.txt / Cargo.toml / CMakeLists.txt / .csproj），确认框架名称与版本。
2. 再运行 `scripts/scan_frameworks.py` 获取使用点分布。
3. 最后按本目录逐类核对：清单里有但代码里没扫到（或反之）的，要追查原因。

## 十六类基础框架

### 1. RPC / 通信
常见：gRPC、Thrift、Dubbo、brpc、tars、Netty、WCF、gSOAP、自研 RPC。
探测线索：`*.proto` / `*.thrift` / `*.tars` IDL 文件、IDL 生成代码目录（常为 gen/、proto_gen/、stub/）、服务端注册（`RegisterXxxServer`、`addService`）、客户端 Channel/Stub 创建。

### 2. 并发 / 线程池
常见：Java Executor/ForkJoin、Go goroutine+channel、C++ std::thread/pthread、asio/libevent/libuv 事件循环、自研 ThreadPool/TaskQueue。
探测线索：池创建处通常很少（单例/全局），使用处很多——注意区分"池定义点"与"任务提交点"。

### 3. Actor 模型
常见：Akka、CAF、Proto.Actor、Orleans、Erlang/OTP、自研 Actor/消息信箱框架。
探测线索：消息类型定义集中、Actor 创建（spawn/actorOf）处、消息处理回调（onReceive/behavior）。

### 4. 日志
常见：SLF4J/Logback、spdlog、glog、zap、logrus、Python logging、NLog/Serilog、自研日志库。
探测线索：Logger 获取方式（每类一个 vs 全局单例）、是否有统一封装头文件/工具类。

### 5. 序列化 / 编解码
常见：Protobuf、Jackson/fastjson/Gson、nlohmann/json、rapidjson、Go encoding/json、FlatBuffers、MsgPack、Avro、自研 TLV/二进制协议。
探测线索：IDL 文件、Marshal/Unmarshal 调用、自研协议常在 codec/、protocol/ 目录。

### 6. 配置管理
常见：Viper、Spring @Value/@ConfigurationProperties、gflags、boost::program_options、配置中心（Nacos/Apollo/etcd/Consul）。
探测线索：配置文件本体（yaml/properties/ini/conf）、配置读取 API、配置热更新回调。

### 7. 依赖注入 / 组件管理
常见：Spring、Guice、Dagger、Wire、自研组件注册表/工厂。
探测线索：注解密度（@Component/@Service）、注册中心（register/Register 集中处）。

### 8. 存储 / ORM
常见：MyBatis、JPA/Hibernate、GORM、sqlx、Redis/Mongo/etcd 客户端、SQLite、自研 DAO 层。
探测线索：连接创建点（池配置）、SQL/Mapper 文件、自研 DAO 命名规律（*Dao/*Repo/*Store）。

### 9. 消息队列
常见：Kafka、RocketMQ、RabbitMQ/AMQP、Pulsar、NATS、自研消息总线。
探测线索：Producer/Consumer 创建点、topic 常量集中定义处。

### 10. 定时 / 调度
常见：Quartz、XXL-Job、@Scheduled、robfig/cron、time.Ticker、时间轮。
探测线索：调度入口集中点、分散的 ticker/timer 使用（注意后者常被遗漏且是不一致风险点）。

### 11. 网络 / 事件循环
常见：Reactor 封装（muduo、Netty EventLoop）、epoll/IOCP 直封装、asio io_context。
探测线索：与第 2 类并发常交织——分清"IO 线程模型"与"计算线程池"。

### 12. 资源池
常见：连接池（HikariCP/Druid/commons-pool）、内存池（tcmalloc/jemalloc/自研 slab）、对象池（sync.Pool、boost::pool）。
探测线索：池的获取/归还 API 对（Get/Put、borrow/return）。

### 13. 容错 / 服务治理
常见：Hystrix、Resilience4j、Sentinel、自研熔断/限流/重试组件。
探测线索：注解（@HystrixCommand）、拦截器/过滤器链、重试与超时配置散落处。

### 14. 监控 / 可观测
常见：Prometheus 客户端、Micrometer、StatsD、OpenTelemetry/Jaeger/Zipkin、自研指标上报。
探测线索：指标定义集中文件（metrics.go/Metrics.java）、埋点调用。

### 15. 基础库
常见：Guava、Boost、Abseil、Folly、fmt、自研公共工具库（utils/common/base 目录）。
探测线索：自研公共库是"事实上的框架"，必须纳入分析。

### 16. 测试框架
常见：GoogleTest、JUnit/Mockito、Go testing/testify/gomock、pytest。
探测线索：仅当分析目的涉及测试资产或需要为新代码补测试时展开，否则只记录存在性。

## 易遗漏项

- **自研/内部框架**：开源模式库覆盖不到。线索：顶层目录名（rpc/、infra/、platform/、middleware/）、被大量业务文件 include/import 的内部头文件或包。发现后写入自定义模式 JSON 重新扫描。
- **IDL 生成代码**：生成代码调用点会虚增计数，分析时排除 gen 目录，或单独标注。
- **同一框架多种用法并存**：如既有裸 `std::thread` 又有封装线程池——两者都要记录，这是"不一致风险"信号。
- **版本双轨**：如 fastjson 与 fastjson2、log4j1 与 log4j2 并存。
