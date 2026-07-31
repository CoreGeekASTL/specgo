# 关键数据结构分类目录

仓内数据结构按类型归类，探测时逐类核对，任何一类没有命中都要确认是"确实没有"而非"没找到"。

> 注意：本目录扫描的是**关键数据结构**——承载核心业务状态/流程、自定义实现、高被引用、或有特殊并发/性能语义的容器。语言原生的普通容器只在承担关键作用时才收录，不要把每个 `[]byte` / `map[string]string` 都当关键结构。

## 目录

- 一、原生顺序容器（数组 / 切片 / 动态列表）
- 二、映射（map / dict）
- 三、集合（set）
- 四、链表
- 五、队列
- 六、栈
- 七、树
- 八、环形缓冲
- 九、自定义容器
- 易遗漏项

## 一、原生顺序容器（数组 / 切片 / 动态列表）

定长数组与变长列表。语言原生，只在承担关键作用时收录。

| 语言 | 定长数组 | 动态列表/切片 | 探测模式（grep） |
|---|---|---|---|
| Go | `[N]T` | `[]T`、`make([]T, n)` | `\[[0-9]+\][A-Za-z]`、`\[\][A-Za-z]`、`make\(\[\]` |
| Java | `T[]`、`new T[N]` | `ArrayList<E>`、`List<E>` | `ArrayList<`、`List<`、`new \w+\[` |
| Python | `tuple`（定长） | `list`、`[]` | （语义识别，无强类型模式，按变量命名+用法） |
| C++ | `T arr[N]`、`std::array<T,N>` | `std::vector<T>` | `std::array`、`std::vector`、`\w+\s+\w+\[[0-9]+\]` |

典型场景：批量缓冲区、定长采样窗口、配置项列表。定长数组（`[N]T`）比切片更易被漏，需单独扫。

## 二、映射（map / dict）

键值映射。仓内最常见，重点收录"承载核心状态"的 map——缓存表、注册表、索引表、会话池。

| 语言 | 语法 | 探测模式（grep） |
|---|---|---|
| Go | `map[K]V`、`make(map[K]V)` | `map\[[A-Za-z]`、`make\(map` |
| Java | `HashMap<K,V>`、`Map<K,V>`、`ConcurrentHashMap` | `HashMap`、`ConcurrentHashMap`、`Map<` |
| Python | `dict`、`{k: v}` | （按变量命名/用法识别） |
| C++ | `std::map<K,V>`、`std::unordered_map<K,V>` | `std::map`、`std::unordered_map` |

特别关注：带 `sync.Mutex`/`sync.RWMutex` 的 map 字段（并发安全 map）、`sync.Map`、全局 `var xxx = map[...]{}` 注册表。

## 三、集合（set）

去重集合。Go 无原生 set，常用 `map[K]struct{}` 模拟，易漏。

| 语言 | 语法 | 探测模式（grep） |
|---|---|---|
| Go | `map[K]struct{}`、`map[K]bool` | `map\[[A-Za-z].*\]struct\{\}`、`map\[[A-Za-z].*\]bool` |
| Java | `HashSet<E>`、`Set<E>` | `HashSet`、`Set<` |
| Python | `set`、`frozenset`、`{x, y}` | （按命名/用法） |
| C++ | `std::set<T>`、`std::unordered_set<T>` | `std::set`、`std::unordered_set` |

典型场景：白名单/黑名单、去重缓冲、已处理标记。

## 四、链表

| 语言 | 语法 | 探测模式（grep） |
|---|---|---|
| Go | `container/list`、`list.New()`；自定义 `type Node struct { next *Node }` | `container/list`、`list\.New`、`next \*` |
| Java | `LinkedList<E>` | `LinkedList` |
| C++ | `std::list<T>`、`std::forward_list<T>`、自定义节点 | `std::list`、`std::forward_list`、`next \*` |
| Python | `collections.deque`（双端，常作链表用） | `collections.deque` |

自定义链表（手写节点结构）比标准库更常见于核心流程，重点扫 `next *` / `prev *` 字段。

## 五、队列

| 语言 | 语法 | 探测模式（grep） |
|---|---|---|
| Go | `chan T`（channel 常作队列）、`list.List`、自定义 | `chan `、`make\(chan`、`list\.List` |
| Java | `ArrayDeque`、`LinkedList`（作队列）、`BlockingQueue` | `ArrayDeque`、`BlockingQueue`、`Queue` |
| C++ | `std::queue<T>`、`std::deque<T>` | `std::queue`、`std::deque` |
| Python | `queue.Queue`、`collections.deque` | `queue\.Queue`、`collections.deque` |

注意：Go 的 channel 是最常用的"队列"语义结构，但 grep `chan` 噪声大，须配合命名（含 `queue`/`job`/`task`/`buffer`）筛选关键实例。

## 六、栈

| 语言 | 语法 | 探测模式（grep） |
|---|---|---|
| Go | 切片模拟（`append`/`[:n-1]`）、自定义 | （命名含 stack/push/pop + 切片操作） |
| Java | `ArrayDeque`、`Stack` | `Stack`、`ArrayDeque` |
| C++ | `std::stack<T>` | `std::stack` |
| Python | `list`（append/pop）、自定义 | （命名 + 用法） |

栈常以切片/列表模拟，无强语法信号，靠命名（`stack`/`push`/`pop`）+ 用法识别。

## 七、树

自定义节点结构为主。扫 `left`/`right`/`children`/`parent` 字段。

| 语言 | 探测模式（grep） |
|---|---|
| Go | `left \*`、`right \*`、`children \[\]`、`parent \*`、`type \w+ struct` 含上述字段 |
| Java/C++ | `Node left`、`Node right`、`List<Node> children` |

典型场景：AST、配置树、组织树、Trie。树结构几乎全是自定义，必须精读定义文件。

## 八、环形缓冲

固定容量循环覆盖的缓冲区，常见于日志/采样/流式数据。

| 语言 | 探测模式（grep） |
|---|---|
| Go | 命名 `ring`/`buffer`/`circular`、`type \w+ struct` 含 `buf []T` + `head int` + `tail int`、`container/ring` |
| Java/C++ | 命名 + `head`/`tail`/`size` 字段组合 |

`container/ring` 是 Go 标准环形链表；更多是手写定容缓冲（`[]T` + 头尾索引），靠字段组合识别。

## 九、自定义容器

自实现增删改查/并发控制/淘汰策略的复合结构，是本 skill 最有价值的产出。扫命名特征：

- 命名：`cache`、`pool`、`registry`、`index`、`table`、`bucket`、`manager`、`holder`、`store`
- 字段：`sync.Mutex`/`RWMutex`/`Map` + `map`/`slice` 组合、`cap`/`max`/`size` + 淘汰逻辑
- 方法：`Get`/`Put`/`Add`/`Delete`/`Evict`/`Acquire`/`Release`

命中后精读定义文件，判定是否为自定义容器（自实现而非单纯包装标准库）。

## 易遗漏项

1. **map 当集合用**：`map[K]struct{}`/`map[K]bool` 是 Go 的 set 习惯写法，grep `set` 命中不到，须单独扫 map 的 value 类型。
2. **channel 当队列用**：Go channel 是隐式队列，grep `queue` 命中不到，须配合命名（job/task/buffer）筛选关键实例。
3. **sync.Map**：Go 并发安全 map，`var x sync.Map` + `Load`/`Store`，grep `map[` 命中不到，须单独扫 `sync.Map`。
4. **带锁的 map 字段**：`type Cache struct { mu sync.RWMutex; m map[K]V }` 是并发安全 map 的标准封装，单扫 `map[` 只命中字段不命中封装语义，须结合 struct 定义精读。
5. **泛型容器**：Go 1.18+ 泛型 `type Cache[T any] struct`、Java 泛型，grep 固定类型名命中不全，须扫 `type \w+\[`。
6. **自实现 LRU/环形缓冲**：命名常不含 LRU/ring，靠 `head`/`tail`/`cap` + 淘汰方法识别，须精读定义。
7. **表驱动注册**：`var handlers = map[int]func(){...}` 这类注册表是核心数据中枢，grep 命中但易被当普通 map 忽略，须按"注册表"语义收录。
8. **sync.Pool**：对象池，`sync.Pool{}` + `Get`/`Put`，是资源复用结构，grep `sync.Pool` 单独扫。
9. **全局 var 注册表**：包级 `var xxx = map[...]{...}` 常是配置/路由注册表，是关键数据中枢，须从全局 var 定义处扫。
10. **已下线结构**：定义在但被注释或开关关闭。标注状态（在用/下线），不要直接删除记录。
