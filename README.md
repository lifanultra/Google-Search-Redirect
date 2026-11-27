# Google Search Redirect

A dependency-free userscript that normalizes Google search navigation to `https://www.google.com`, without reloading results just to clean their URL. **Version 4.0.0.**

[Install / update userscript](https://raw.githubusercontent.com/lifanultra/Google-Search-Redirect/refs/heads/main/Google-Search-Redirect.js) · [Optional request-layer companion](extensions/safari/README.md)

## 安装与升级

1. 在支持 `document-start` 的脚本管理器中打开上面的安装链接。iPhone Safari 还需要在系统扩展设置中允许管理器访问对应 Google 域名。
2. 安装和更新都固定使用 `Google-Search-Redirect.js` 的同一条 `refs/heads/main` 原始地址；作者为 **LIFANULTRA**，名称和 namespace 保持不变。更新原有那一份，**不要同时启用新旧两个副本**。
3. 检查管理器中实际版本为 **4.0.0**。GitHub 更新并不等于手机已经更新；注入时机也由管理器决定。

## 默认行为

- 精确识别 Google 官方域名清单中的裸域名和 `www`，只处理 `/`、`/webhp[/]`、带非空 `q` 的 `/search[/]`。
- 地区域名、HTTP 和允许清理的参数合并成一次规范化导航；已经在 HTTPS `www.google.com` 上，**绝不因为清理参数重新加载结果**。
- 按实际点击、辅助点击、右键菜单按需修正后续搜索链接；不接管原生点击、新标签或历史记录，不全页扫描、不轮询、不修改网络 API。
- 对各地区 Google 的已知 `/url?q=...` 或 `/url?url=...` 搜索结果链接，本地最多解包三层，直接写入最终 HTTP(S) 目标；不联网解析、不重复解码、不猜测其他网站的业务参数，歧义或不安全目标保持原样。
- 默认只清理普通搜索 URL 中的 `utm_*`。保留 `client=safari`、未知参数及搜索模式、语言、地区、安全搜索、分页和账号选择。
- 保留未删除参数的原始编码、重复参数和 fragment。合格 GET 表单只通过原生 `formdata` 清理允许删除的字段，不删除/禁用隐藏控件，也不改写 `action` 或重复提交。WebKit 可能在 `formdata` 前就锁定请求目标；为避免影响后续 POST/取消操作，表单请求前的路由交给可选请求层规则。
- 循环保护在同一来源内抑制 **120 秒**内的同一逻辑搜索，忽略已知变化遥测、参数键顺序、片段差异；实际发出的 URL 不因指纹计算而被重排。不同关键词或功能筛选不受累计次数限制。记录每标签、每源最多 32 个哈希，并非跨所有域名共享的全局防循环。
- 无第三方依赖、运行时域名下载、Cookie 改写、广告、统计或关键词上传。

## 可选设置

在已安装脚本顶部附近的 `SETTINGS` 中修改布尔值：

| 设置 | 默认 | 作用 |
|---|---|---|
| `cleanTracking` | `true` | 清理 `utm_*`，不是通用反追踪器 |
| `cleanClient` | `false` | 额外清理 `client`、`sourceid`、`rls`；需要时开启 |
| `cleanAddressBar` | `true` | 同源地址通过保留原有 state 的 `history.replaceState` 整理，**不刷新** |
| `fixLinkTypos` | `true` | 修正脚本所见搜索链接中的精确 `google.con`、`www.google.con` |
| `directResultLinks` | `true` | 已知 Google `/url` 搜索结果链接本地有界解包；不自动接管已加载的中转页 |

参数缩短不等于网络加速。`client=safari` 是客户端标识，尚无本项目真机对照证明删除它能加速。清理已加载页面的地址，也无法撤回已经发送给 Google 的参数。脚本管理器更新可能覆盖本地设置，请升级后检查。

## `google.con`、能力边界与安全

**用户脚本不能在 DNS 或证书错误页面执行，也不能在 Safari 地址栏的首次请求前改地址。** 输入 `google.con` 后无法加载网页时，单纯添加 `@match` 没用。

需要首次请求前纠错时，使用 [可选 Safari WebExtension 源码与规则](extensions/safari/README.md)。这不是可以直接点装的签名 iOS 应用；需要 Mac/Xcode 转换、签名和权限。规则是否覆盖 Safari 的特定导航行为必须实测；如果 Safari 把 `google.con` 当成关键词搜索，而不是导航到这个主机，域名规则不会替换搜索内容。

其他限制：

- 本脚本不是 VPN、代理、DNS 加速器或验证码绕过器；不能保证任意网络下 Google 都快。Google 自身的服务端跳转可能在脚本注入前发生。
- 地址栏/脚本直接设置 `location`、直接 `form.submit()`、部分 AJAX 搜索、长按预览等可能绕过点击/提交监听。不会为覆盖这些尾部场景增加全页扫描或全局劫持。
- 原生 POST 表单、显式非当前窗口表单、有提交按钮地址/方法/窗口覆盖的表单保守跳过。**页面 URL 本身不能证明原始请求是不是 POST**；初始 `/search` 至少要求有非空 `q`，但不宣称能恢复 POST 正文。
- 不改 Accounts、Maps、Mail、consent、验证码和 API 的服务主机，也不自动处理已加载的 `/url` 中转页；只有搜索页上明确已知的 Google `/url` 链接才可按需解包。第三方普通链接、凭据 URL 和非标准端口不参与域名规范化。不改搜索词中的 `google.con`。
- 存储不可用时不强制跨域跳转，保留当前页面。短时间重复同一目标可能暂时保留地区地址，这是防循环退让。
- 返回/前进时不重写恢复的 URL；预渲染在激活后最多处理一次。没有使用 unload 监听干扰 BFCache。

## 验证码与人机验证

已查阅 Google 官方异常流量帮助及三类实际脚本：换地区 host 重试、跳到其他搜索引擎、调用外部服务自动解题。**没有证据证明这些方法能在本项目目标环境可靠防止 Google 验证码，因此没有加入 bypass 开关。**

本项目只做可验证的防护：不自动重试、不后台搜索、不轮换地区主机、不解析 `/sorry` 的 `continue` 再次发起搜索；验证/同意/账号页面不安装改写监听。不会隐藏验证码、清 Cookie、伪装指纹、切换未知镜像或上传挑战图片到解题服务。

Google 官方说明，共享网络、VPN/隧道出口上其他人的自动流量也可能影响正常用户；当前没有测量你的出口，不能据验证码归因。遇到验证请正常手动完成；持续发生时按官方建议检查实际 VPN/网络。断路器的 120 秒是本脚本防回跳策略，**不是 Google 官方的安全搜索间隔**。

## 研究与代码取舍

你指定的 **7 个 ScriptCat 脚本均核验了实际源码**，另交叉查阅 4 个相关仓库的具体文件。吸收精确作用域、本地有界解包、原始查询串保真、按需事件代理、兼容例外优先等思路；没有把多套脚本机械拼接，也没有复制未授权代码。

拒绝全网扫描、联网猜目标、多次整体 URI 解码、强行接管点击、全局导航/表单原型劫持与批量删参。源码链接、版本及 SHA-256 见 `docs/research-sources.json`；策略记录见 `docs/research.md`。其他项目地址只作为最终脚本最末尾的“参考文献 / References”注释，不进入下载/更新地址或运行时依赖。

## 开发与验证

需要 Node.js **22+**，无需安装 npm 依赖：

```sh
npm run build
npm run check:generated
npm test
```

`src/redirect.js` 和 `config/google-domains.json` 是源文件。`scripts/build.mjs` 离线生成唯一发布文件 `Google-Search-Redirect.js`；不要只修改生成物。域名清单来自 Google `supported_domains` 的 2026-11-26 快照，更新时离线核对，不在用户每次搜索时下载。

测试执行实际发布脚本，覆盖 URL 编码、参数、循环、历史、预渲染、链接和表单；扩展规则有独立安全矩阵。`node scripts/browser-fixture.mjs` 可生成 `tests/browser.generated.html`，在 WebKit 中打开检查原生 DOM/FormData 集成。此类测试**不等于真实 Google 页面、脚本管理器注入或已签名 Safari 扩展的端到端测试**。

真机提速验收：固定网络、代理/Private Relay、登录状态，交错比较“管理器开启但脚本关闭 / v3 / v4”，冷/热缓存分组，记录确认搜索到结果可见的中位数和尾部耗时、文档请求数与额外导航次数。参数清理单独开关比较。不要仅凭最终页 Navigation Timing 的 `redirectCount` 判断没有跨域或客户端跳转。
