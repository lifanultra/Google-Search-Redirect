# Google Search Redirect

[English](README.md) | [简体中文](README.zh-CN.md)

轻量级 Google 搜索导航优化用户脚本。

## 功能

- 规范符合条件的 Google 搜索页面并清理指定查询参数，不为清理参数而重新加载结果。
- 首页（`/` 或 `/webhp`，无非空 `q` 搜索词）统一为 `https://www.google.com/`，移除**全部**查询参数与片段，包括 `authuser`、`client`。主站首页在页面/历史恢复时也会无刷新清理。
- 按需修正搜索链接，在本地最多解包三层已知 Google 搜索结果中转链接。
- 保留搜索设置、其余查询参数的原始编码、重复参数和片段；符合条件的 GET 表单通过原生 `formdata` 清理。
- 提供每标签页、每来源的循环保护；不下载域名清单，不上传搜索词。

## 安装

在支持 `document-start` 的脚本管理器中，始终通过同一地址安装或更新：

[安装 / 更新 Google Search Redirect](https://raw.githubusercontent.com/lifanultra/Google-Search-Redirect/refs/heads/main/Google-Search-Redirect.js)

在 iPhone Safari 上，需允许脚本管理器访问相关 Google 网站。wBlock 的使用方法请参阅[安装指南](docs/wblock.zh-CN.md)。更新已有脚本，避免同时启用多个副本。

## 设置

修改已安装脚本顶部附近的 `SETTINGS`：

| 设置 | 默认 | 说明 |
|---|---|---|
| `cleanTracking` | `true` | 清理 `utm_*` 参数 |
| `cleanClient` | `true` | 清理 `client`、`sourceid` 和 `rls` |
| `cleanAddressBar` | `true` | 保留历史状态，无刷新整理同源地址 |
| `fixLinkTypos` | `true` | 修正脚本遇到的搜索链接中精确的 `google.con` 和 `www.google.con` 主机名 |
| `directResultLinks` | `true` | 在本地解包已知 Google 搜索结果链接 |

更新可能覆盖本地设置。参数清理不保证提高搜索速度。

## 版本发布

版本使用北京时间 `YYYY.MM.DD.HHmm` 格式。发布工作流会检查生成脚本并运行测试，然后将脚本作为 GitHub Release 附件发布。每次发布代码前更新 `config/version.json` 并重新生成脚本。固定安装地址直接跟随 `main`，不受 Release 工作流状态控制。

## 兼容性与限制

脚本处理受支持的 Google 搜索主机及路径，不修改其他 Google 服务主机。浏览器导航、直接提交表单、部分 AJAX 搜索和长按预览可能绕过监听；POST 表单及覆盖目标窗口或提交按钮属性的表单会保守跳过。WebKit 可能在 `formdata` 执行前确定表单请求目标。

用户脚本无法在 Safari 首次请求前纠正主机名，也无法在 DNS 或证书错误页面运行。请求层规则及 Safari 配置请参阅[可选 WebExtension 文档](extensions/safari/README.md)。实现细节及来源见[研究记录](docs/research.md)和[来源清单](docs/research-sources.json)。

## 开发与测试

需要 Node.js **22+**，无需安装 npm 依赖。

```sh
npm run build
npm run check:generated
npm test
```

编辑源文件 `src/redirect.js` 和 `config/google-domains.json`；`scripts/build.mjs` 离线生成 `Google-Search-Redirect.js`。运行 `node scripts/browser-fixture.mjs` 可生成 WebKit DOM/FormData 测试页面。自动化测试不能替代真实 Google 页面、脚本管理器或已签名 Safari 扩展测试。
