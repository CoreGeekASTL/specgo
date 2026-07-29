#!/usr/bin/env python3
"""扫描存量代码仓，识别基础框架（RPC/线程池/Actor/日志/存储等）及其使用点。

用法:
    python3 scan_frameworks.py <repo_path> [选项]

输出:
    - 依赖清单文件列表（go.mod / pom.xml / package.json 等）
    - 命中的基础框架：调用点数、涉及文件数、热点文件、样例调用点
    - 支持 --custom 传入自研/内部框架的自定义模式（JSON）

自定义模式 JSON 格式:
    [
      {"category": "RPC/通信", "name": "InternalRPC",
       "patterns": ["internal/rpc", "RpcClient::Invoke"]}
    ]
"""
import argparse
import json
import os
import re
import sys
from collections import defaultdict

# ---------------------------------------------------------------------------
# 内置框架模式库：category / name / 正则列表（命中任一即计入）
# 覆盖 C/C++、Go、Java/Kotlin、Python、C#、Erlang、Rust 等常见语言
# 可选 "exts"：限定模式仅对指定扩展名的文件生效，避免跨语言撞名误报
# ---------------------------------------------------------------------------
_JAVA_EXTS = {".java", ".kt", ".kts", ".scala", ".groovy"}
_CPP_EXTS = {".c", ".cc", ".cpp", ".cxx", ".h", ".hh", ".hpp", ".hxx"}
_GO_EXTS = {".go"}
_PY_EXTS = {".py"}
_CS_EXTS = {".cs"}
_ERL_EXTS = {".erl", ".hrl"}

FRAMEWORK_PATTERNS = [
    # ---- RPC / 通信 ----
    {"category": "RPC/通信", "name": "gRPC", "patterns": [
        r"google\.golang\.org/grpc", r"grpc\.NewServer\(", r"grpc\.Dial", r"grpc\.NewClient",
        r"io\.grpc", r"ManagedChannelBuilder", r"#include\s*[<\"]grpcpp", r"Grpc\.",
        r"Grpc\.Net", r"import\s+grpc\b"]},
    {"category": "RPC/通信", "name": "Thrift", "patterns": [
        r"org\.apache\.thrift", r"apache/thrift", r"thrift::TProcessor", r"TThreadedServer",
        r"apache\.thrift"]},
    {"category": "RPC/通信", "name": "Dubbo", "patterns": [
        r"org\.apache\.dubbo", r"com\.alibaba\.dubbo", r"@DubboService", r"@DubboReference"]},
    {"category": "RPC/通信", "name": "brpc", "patterns": [
        r"#include\s*[<\"]brpc/", r"brpc::Server", r"brpc::Channel"]},
    {"category": "RPC/通信", "name": "Netty", "patterns": [
        r"io\.netty", r"NioEventLoopGroup", r"ChannelInboundHandlerAdapter"]},
    {"category": "RPC/通信", "name": "Feign/Retrofit(HTTP客户端)", "patterns": [
        r"@FeignClient", r"EnableFeignClients", r"retrofit2\.Retrofit", r"Retrofit\.Builder"]},
    {"category": "RPC/通信", "name": "ZeroMQ", "patterns": [
        r"zmq\.NewSocket", r"zmq_socket\(", r"import\s+zmq\b", r"ZMQ\."]},
    # ---- 并发 / 线程池 ----
    {"category": "并发/线程池", "name": "Java线程池(Executor)", "exts": _JAVA_EXTS, "patterns": [
        r"Executors\.new", r"ThreadPoolExecutor", r"ForkJoinPool", r"ScheduledThreadPoolExecutor",
        r"CompletableFuture\."]},
    {"category": "并发/线程池", "name": "Go协程原语", "exts": _GO_EXTS, "patterns": [
        r"\bgo\s+func\s*\(", r"sync\.WaitGroup", r"sync\.Mutex", r"make\(chan\s",
        r"errgroup", r"sync\.Pool"]},
    {"category": "并发/线程池", "name": "C++线程(std::thread)", "exts": _CPP_EXTS, "patterns": [
        r"std::thread", r"std::async", r"std::mutex", r"std::condition_variable",
        r"pthread_create", r"std::shared_mutex"]},
    {"category": "并发/线程池", "name": "asio事件库", "exts": _CPP_EXTS, "patterns": [
        r"boost::asio", r"asio::io_context", r"asio::io_service", r"asio::steady_timer"]},
    {"category": "并发/线程池", "name": "libevent/libuv", "exts": _CPP_EXTS, "patterns": [
        r"event_base_new", r"event_base_dispatch", r"uv_loop", r"uv_run\("]},
    {"category": "并发/线程池", "name": "muduo", "exts": _CPP_EXTS, "patterns": [r"muduo::net", r"muduo::EventLoop"]},
    {"category": "并发/线程池", "name": "Python并发(asyncio/concurrent)", "exts": _PY_EXTS, "patterns": [
        r"import\s+asyncio", r"asyncio\.run", r"ThreadPoolExecutor", r"concurrent\.futures",
        r"multiprocessing"]},
    {"category": "并发/线程池", "name": "C#任务并行(TPL)", "exts": _CS_EXTS, "patterns": [
        r"Task\.Run", r"Task\.Factory", r"System\.Threading\.Tasks", r"Parallel\.For"]},
    # ---- Actor 模型 ----
    {"category": "Actor模型", "name": "Akka", "exts": _JAVA_EXTS, "patterns": [
        r"akka\.actor", r"ActorSystem", r"extends\s+AbstractActor", r"actorOf\("]},
    {"category": "Actor模型", "name": "CAF(C++ Actor Framework)", "exts": _CPP_EXTS, "patterns": [
        r"caf::actor", r"caf::actor_system", r"caf::event_based_actor"]},
    {"category": "Actor模型", "name": "Proto.Actor", "patterns": [
        r"protoactor", r"Proto\.Actor", r"proto\.Actor"]},
    {"category": "Actor模型", "name": "Orleans", "exts": _CS_EXTS, "patterns": [
        r"Microsoft\.Orleans", r":\s*Grain\b", r"IGrainWith"]},
    {"category": "Actor模型", "name": "Erlang/OTP", "exts": _ERL_EXTS, "patterns": [
        r"-behaviou?r\(gen_server\)", r"-behaviou?r\(gen_statem\)", r"gen_server:call"]},
    # ---- 日志 ----
    {"category": "日志", "name": "SLF4J/Logback/Log4j", "exts": _JAVA_EXTS, "patterns": [
        r"org\.slf4j", r"LoggerFactory\.getLogger", r"org\.apache\.logging\.log4j",
        r"log4j\.Logger"]},
    {"category": "日志", "name": "spdlog", "exts": _CPP_EXTS, "patterns": [r"spdlog::", r"#include\s*[<\"]spdlog"]},
    {"category": "日志", "name": "glog", "exts": _CPP_EXTS, "patterns": [
        r"google::InitGoogleLogging", r"\bLOG\((INFO|WARNING|ERROR|FATAL)\)"]},
    {"category": "日志", "name": "zap(Uber)", "exts": _GO_EXTS, "patterns": [r"go\.uber\.org/zap", r"zap\.New(Production|Development|Logger)"]},
    {"category": "日志", "name": "logrus", "exts": _GO_EXTS, "patterns": [r"sirupsen/logrus", r"logrus\."]},
    {"category": "日志", "name": "Python logging", "exts": _PY_EXTS, "patterns": [
        r"logging\.getLogger", r"logging\.basicConfig"]},
    {"category": "日志", "name": "NLog/Serilog(C#)", "exts": _CS_EXTS, "patterns": [r"NLog\.", r"Serilog\."]},
    # ---- 序列化 ----
    {"category": "序列化", "name": "Protobuf", "patterns": [
        r"google\.protobuf", r"google/protobuf", r"protobuf::Message", r"proto\.Marshal",
        r"MessageToDict", r"@protobufjs"]},
    {"category": "序列化", "name": "Jackson/fastjson(Java JSON)", "exts": _JAVA_EXTS, "patterns": [
        r"ObjectMapper", r"com\.fasterxml\.jackson", r"com\.alibaba\.fastjson",
        r"JSON\.toJSONString", r"Gson\b"]},
    {"category": "序列化", "name": "C++ JSON库", "exts": _CPP_EXTS, "patterns": [
        r"nlohmann/json", r"nlohmann::json", r"rapidjson", r"json11"]},
    {"category": "序列化", "name": "Go encoding/json", "exts": _GO_EXTS, "patterns": [
        r"\"encoding/json\"", r"json\.Marshal", r"json\.Unmarshal"]},
    {"category": "序列化", "name": "FlatBuffers/MsgPack/Avro", "patterns": [
        r"flatbuffers", r"msgpack", r"org\.apache\.avro", r"avro\."]},
    {"category": "序列化", "name": "YAML/TOML配置解析", "patterns": [
        r"gopkg\.in/yaml", r"pyyaml", r"yaml\.safe_load", r"SnakeYAML", r"toml\.load"]},
    # ---- 配置管理 ----
    {"category": "配置管理", "name": "Viper(Go配置)", "exts": _GO_EXTS, "patterns": [r"spf13/viper", r"viper\.(Set|Get|ReadInConfig)"]},
    {"category": "配置管理", "name": "gflags/命令行参数", "patterns": [
        r"DEFINE_(bool|string|int32|int64|uint64|double)", r"gflags::ParseCommandLineFlags",
        r"spf13/cobra", r"argparse\.ArgumentParser", r"boost::program_options"]},
    {"category": "配置管理", "name": "Spring配置注入", "exts": _JAVA_EXTS, "patterns": [
        r"@ConfigurationProperties", r"@Value\(", r"Environment\.getProperty"]},
    {"category": "配置管理", "name": "配置中心(Nacos/Apollo/etcd)", "patterns": [
        r"com\.alibaba\.nacos", r"NacosConfigService", r"com\.ctrip\.framework\.apollo",
        r"@ApolloConfig", r"clientv3\.New\(.*etcd", r"go\.etcd\.io/etcd"]},
    # ---- 依赖注入 / 组件管理 ----
    {"category": "依赖注入/组件", "name": "Spring框架", "exts": _JAVA_EXTS, "patterns": [
        r"org\.springframework", r"@Autowired", r"@Component\b", r"@Service\b",
        r"@Bean\b", r"ApplicationContext"]},
    {"category": "依赖注入/组件", "name": "Guice/Dagger", "exts": _JAVA_EXTS, "patterns": [
        r"com\.google\.inject", r"dagger\.Component", r"@Inject\b"]},
    {"category": "依赖注入/组件", "name": "Wire(Go DI)", "exts": _GO_EXTS, "patterns": [r"google/wire", r"wire\.Build"]},
    # ---- 存储 / ORM ----
    {"category": "存储/ORM", "name": "MyBatis", "exts": _JAVA_EXTS, "patterns": [
        r"org\.apache\.ibatis", r"mybatis", r"@Mapper\b", r"SqlSession"]},
    {"category": "存储/ORM", "name": "JPA/Hibernate", "exts": _JAVA_EXTS, "patterns": [
        r"javax\.persistence", r"jakarta\.persistence", r"@Entity\b", r"EntityManager",
        r"org\.hibernate"]},
    {"category": "存储/ORM", "name": "GORM", "exts": _GO_EXTS, "patterns": [r"gorm\.io/gorm", r"gorm\.Open\(", r"gorm\.DB"]},
    {"category": "存储/ORM", "name": "sqlx/原生SQL(Go)", "exts": _GO_EXTS, "patterns": [
        r"jmoiron/sqlx", r"database/sql", r"sqlx\.(Open|Connect)"]},
    {"category": "存储/ORM", "name": "Redis客户端", "patterns": [
        r"go-redis/redis", r"redis\.NewClient", r"redis\.clients\.jedis", r"JedisPool",
        r"import\s+redis\b", r"hiredis", r"StackExchange\.Redis"]},
    {"category": "存储/ORM", "name": "MongoDB客户端", "patterns": [
        r"go\.mongodb\.org/mongo-driver", r"MongoClients\.create", r"pymongo", r"mongocxx"]},
    {"category": "存储/ORM", "name": "SQLite/嵌入式库", "patterns": [
        r"sqlite3\.connect", r"System\.Data\.SQLite", r"sqlite3_open", r"mattn/go-sqlite3"]},
    # ---- 消息队列 ----
    {"category": "消息队列", "name": "Kafka", "patterns": [
        r"org\.apache\.kafka", r"KafkaProducer", r"KafkaConsumer", r"Shopify/sarama",
        r"confluent-kafka", r"segmentio/kafka-go"]},
    {"category": "消息队列", "name": "RocketMQ", "patterns": [
        r"org\.apache\.rocketmq", r"rocketmq-client-go", r"DefaultMQProducer"]},
    {"category": "消息队列", "name": "RabbitMQ/AMQP", "patterns": [
        r"com\.rabbitmq\.client", r"streadway/amqp", r"amqp091-go", r"import\s+pika\b"]},
    {"category": "消息队列", "name": "Pulsar/NATS", "patterns": [
        r"org\.apache\.pulsar", r"pulsar-client", r"nats\.go", r"nats\.Connect"]},
    # ---- 定时 / 调度 ----
    {"category": "定时/调度", "name": "Quartz", "exts": _JAVA_EXTS, "patterns": [
        r"org\.quartz", r"SchedulerFactoryBean", r"CronTrigger"]},
    {"category": "定时/调度", "name": "XXL-Job", "exts": _JAVA_EXTS, "patterns": [r"xxl[.\-]job", r"@XxlJob"]},
    {"category": "定时/调度", "name": "轻量定时器(cron/ticker)", "patterns": [
        r"robfig/cron", r"@Scheduled\(", r"time\.NewTicker", r"time\.NewTimer",
        r"schedule\.every"]},
    # ---- 资源池 ----
    {"category": "资源池", "name": "连接池(HikariCP/Druid/commons-pool)", "exts": _JAVA_EXTS, "patterns": [
        r"com\.zaxxer\.hikari", r"HikariDataSource", r"com\.alibaba\.druid",
        r"GenericObjectPool", r"commons-pool2"]},
    {"category": "资源池", "name": "内存池/对象池(C++)", "exts": _CPP_EXTS, "patterns": [
        r"tcmalloc", r"jemalloc", r"mempool", r"boost::pool", r"object_pool"]},
    # ---- 容错 / 服务治理 ----
    {"category": "容错/服务治理", "name": "熔断限流(Hystrix/Resilience4j/Sentinel)", "exts": _JAVA_EXTS, "patterns": [
        r"@HystrixCommand", r"resilience4j", r"CircuitBreaker", r"com\.alibaba\.csp\.sentinel",
        r"RateLimiter\.create"]},
    {"category": "容错/服务治理", "name": "服务发现(Consul/Eureka/etcd)", "patterns": [
        r"consul/api", r"eureka", r"ServiceRegistry", r"naming\.RegisterInstance"]},
    # ---- 监控 / 可观测 ----
    {"category": "监控/可观测", "name": "Prometheus客户端", "patterns": [
        r"prometheus/client_golang", r"io\.prometheus\.client", r"prometheus\.New(Counter|Gauge|Histogram)",
        r"prometheus_client", r"Counter\.build"]},
    {"category": "监控/可观测", "name": "OpenTelemetry/Tracing", "patterns": [
        r"opentelemetry", r"go\.opentelemetry\.io", r"otel\.", r"jaeger", r"zipkin"]},
    {"category": "监控/可观测", "name": "Micrometer/StatsD", "exts": _JAVA_EXTS, "patterns": [
        r"io\.micrometer", r"MeterRegistry", r"statsd"]},
    # ---- 基础库 ----
    {"category": "基础库", "name": "Guava", "exts": _JAVA_EXTS, "patterns": [r"com\.google\.common"]},
    {"category": "基础库", "name": "Boost", "exts": _CPP_EXTS, "patterns": [r"#include\s*[<\"]boost/"]},
    {"category": "基础库", "name": "Abseil", "exts": _CPP_EXTS, "patterns": [r"absl::", r"#include\s*[<\"]absl/"]},
    {"category": "基础库", "name": "Folly", "exts": _CPP_EXTS, "patterns": [r"folly::", r"#include\s*[<\"]folly/"]},
    {"category": "基础库", "name": "fmt格式化库", "exts": _CPP_EXTS, "patterns": [r"fmt::format", r"#include\s*[<\"]fmt/"]},
    # ---- 测试框架 ----
    {"category": "测试框架", "name": "GoogleTest", "exts": _CPP_EXTS, "patterns": [r"#include\s*[<\"]gtest", r"testing::InitGoogleTest"]},
    {"category": "测试框架", "name": "JUnit/Mockito", "exts": _JAVA_EXTS, "patterns": [
        r"org\.junit", r"@Test\b", r"org\.mockito", r"@Mock\b"]},
    {"category": "测试框架", "name": "Go测试(testing/testify/gomock)", "exts": _GO_EXTS, "patterns": [
        r"stretchr/testify", r"golang/mock", r"go\.uber\.org/mock", r"gomonkey"]},
    {"category": "测试框架", "name": "pytest", "exts": _PY_EXTS, "patterns": [r"import\s+pytest", r"@pytest\.fixture"]},
]

SOURCE_EXTS = {
    ".go", ".java", ".kt", ".kts", ".scala", ".groovy",
    ".c", ".cc", ".cpp", ".cxx", ".h", ".hh", ".hpp", ".hxx",
    ".cs", ".py", ".js", ".jsx", ".ts", ".tsx",
    ".rs", ".erl", ".hrl", ".ex", ".exs", ".proto",
}
SKIP_DIRS = {
    ".git", ".svn", ".hg", ".idea", ".vscode", ".gradle",
    "node_modules", "vendor", "third_party", "3rdparty", "3rd_party",
    "external", "extern", "deps",
    "dist", "build", "target", "out", "bin", "obj",
    "__pycache__", ".pytest_cache", ".next", "coverage",
}
MANIFEST_NAMES = {
    "go.mod", "go.sum", "Gopkg.toml", "pom.xml", "build.gradle", "build.gradle.kts",
    "settings.gradle", "package.json", "requirements.txt", "Pipfile", "pyproject.toml",
    "setup.py", "Cargo.toml", "CMakeLists.txt", "conanfile.txt", "conanfile.py",
    "vcpkg.json", "WORKSPACE", "WORKSPACE.bazel", "BUILD", "BUILD.bazel",
    "Gemfile", "composer.json", "pubspec.yaml", "mix.exs", "rebar.config", "*.csproj",
}
LANG_EXTS = {
    "go": {".go"}, "java": {".java", ".kt", ".kts", ".scala", ".groovy"},
    "cpp": {".c", ".cc", ".cpp", ".cxx", ".h", ".hh", ".hpp", ".hxx"},
    "csharp": {".cs"}, "python": {".py"}, "js": {".js", ".jsx", ".ts", ".tsx"},
    "rust": {".rs"}, "erlang": {".erl", ".hrl"},
}
MAX_FILE_BYTES = 1024 * 1024
MAX_SAMPLES = 5


def load_custom_patterns(path):
    with open(path, "r", encoding="utf-8") as f:
        items = json.load(f)
    for it in items:
        if not all(k in it for k in ("category", "name", "patterns")):
            raise ValueError("自定义模式缺少 category/name/patterns 字段: %s" % it)
    return items


def iter_source_files(root, allowed_exts):
    manifests = []
    source_files = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, root)
            base = os.path.basename(fn)
            if base in MANIFEST_NAMES or fn.endswith(".csproj"):
                manifests.append(rel)
                continue
            ext = os.path.splitext(fn)[1].lower()
            if ext not in allowed_exts:
                continue
            try:
                if os.path.getsize(full) > MAX_FILE_BYTES:
                    continue
            except OSError:
                continue
            source_files.append((rel, full))
    return sorted(manifests), source_files


def scan(root, patterns, allowed_exts, sample_n):
    compiled = []
    for p in patterns:
        regs = [re.compile(x) for x in p["patterns"]]
        compiled.append((p["category"], p["name"], p.get("exts"), regs))

    manifests, source_files = iter_source_files(root, allowed_exts)

    # name -> stats；count 按 (文件, 行号) 去重，避免一行多正则重复计数
    hits = {}
    for rel, full in source_files:
        try:
            with open(full, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except OSError:
            continue
        ext = os.path.splitext(full)[1].lower()
        lines = text.splitlines()
        for category, name, exts, regs in compiled:
            if exts and ext not in exts:
                continue
            matched_lines = set()
            for reg in regs:
                for m in reg.finditer(text):
                    matched_lines.add(text.count("\n", 0, m.start()) + 1)
            if not matched_lines:
                continue
            st = hits.setdefault(name, {
                "category": category, "count": 0,
                "files": defaultdict(int), "samples": [],
            })
            st["count"] += len(matched_lines)
            st["files"][rel] += len(matched_lines)
            for lineno in sorted(matched_lines):
                if len(st["samples"]) >= sample_n:
                    break
                code = lines[lineno - 1].strip() if lineno - 1 < len(lines) else ""
                st["samples"].append({"file": rel, "line": lineno, "code": code[:160]})
    return manifests, hits, len(source_files)


def render_markdown(root, manifests, hits, n_files, top_files_n, sample_n):
    out = []
    out.append("# 框架扫描结果")
    out.append("")
    out.append("- 代码仓：`%s`" % os.path.abspath(root))
    out.append("- 扫描源文件数：%d" % n_files)
    out.append("- 命中框架数：%d" % len(hits))
    out.append("")
    out.append("## 依赖清单文件")
    if manifests:
        for m in manifests:
            out.append("- `%s`" % m)
        out.append("")
        out.append("> 提示：逐一阅读上述清单，可确认框架名称与版本。")
    else:
        out.append("（未发现常见依赖清单文件）")
    out.append("")

    by_cat = defaultdict(list)
    for name, st in hits.items():
        by_cat[st["category"]].append((name, st))

    out.append("## 命中框架总览（按类别）")
    out.append("")
    out.append("| 类别 | 框架 | 调用点数 | 涉及文件数 |")
    out.append("| --- | --- | --- | --- |")
    for cat in sorted(by_cat):
        for name, st in sorted(by_cat[cat], key=lambda x: -x[1]["count"]):
            out.append("| %s | %s | %d | %d |" % (
                cat, name, st["count"], len(st["files"])))
    out.append("")

    out.append("## 各框架详情")
    for cat in sorted(by_cat):
        out.append("")
        out.append("### %s" % cat)
        for name, st in sorted(by_cat[cat], key=lambda x: -x[1]["count"]):
            out.append("")
            out.append("#### %s（调用点 %d，文件 %d）" % (name, st["count"], len(st["files"])))
            top = sorted(st["files"].items(), key=lambda x: -x[1])[:top_files_n]
            out.append("- 热点文件：" + "、".join("`%s`(%d)" % (f, c) for f, c in top))
            out.append("- 样例调用点：")
            for s in st["samples"][:sample_n]:
                out.append("  - `%s:%d` — `%s`" % (s["file"], s["line"], s["code"]))
    out.append("")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description="扫描代码仓中的基础框架使用点")
    ap.add_argument("repo", help="代码仓根目录")
    ap.add_argument("--custom", help="自定义框架模式 JSON 文件（自研/内部框架）")
    ap.add_argument("--lang", help="限定语言：go/java/cpp/python/csharp/js/rust/erlang（默认全部）")
    ap.add_argument("--format", choices=["md", "json"], default="md", help="输出格式")
    ap.add_argument("--top-files", type=int, default=8, help="每框架展示的热点文件数")
    ap.add_argument("--samples", type=int, default=MAX_SAMPLES, help="每框架保留的样例调用点数")
    ap.add_argument("-o", "--output", help="输出文件路径（默认打印到 stdout）")
    args = ap.parse_args()

    if not os.path.isdir(args.repo):
        sys.exit("错误：目录不存在 %s" % args.repo)

    patterns = list(FRAMEWORK_PATTERNS)
    if args.custom:
        patterns.extend(load_custom_patterns(args.custom))

    allowed_exts = SOURCE_EXTS
    if args.lang:
        key = args.lang.lower()
        if key not in LANG_EXTS:
            sys.exit("错误：未知语言 %s，可选 %s" % (key, "/".join(LANG_EXTS)))
        allowed_exts = LANG_EXTS[key]

    manifests, hits, n_files = scan(args.repo, patterns, allowed_exts, args.samples)

    if args.format == "json":
        payload = {
            "repo": os.path.abspath(args.repo),
            "source_files": n_files,
            "manifests": manifests,
            "frameworks": [
                {
                    "category": st["category"], "name": name,
                    "match_count": st["count"], "file_count": len(st["files"]),
                    "top_files": sorted(st["files"].items(), key=lambda x: -x[1])[:args.top_files],
                    "samples": st["samples"],
                }
                for name, st in sorted(hits.items(), key=lambda x: -x[1]["count"])
            ],
        }
        result = json.dumps(payload, ensure_ascii=False, indent=2)
    else:
        result = render_markdown(args.repo, manifests, hits, n_files, args.top_files, args.samples)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(result)
        print("已写入 %s" % args.output)
    else:
        print(result)


if __name__ == "__main__":
    main()
