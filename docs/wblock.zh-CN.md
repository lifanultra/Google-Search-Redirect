# 在 wBlock 中使用 Google Search Redirect

使用的是现有用户脚本，不是 wBlock 过滤列表，也不是第二个安装来源。以下兼容性检查依据 [wBlock 的 `9aef813` 源码](https://github.com/0xCUB3/wBlock/tree/9aef8131b26e8b99ce470a9b999155b53946a1f8)，App Store 版本可能不同。本项目**尚未在 iPhone 或 iPad 上实际测试 wBlock**。

## 安装

1. 在 wBlock 中打开 **Scripts**，选择 **Add Userscript or Userstyle** → **Userscript** → URL，粘贴项目的固定地址，审核后添加：

   `https://raw.githubusercontent.com/lifanultra/Google-Search-Redirect/refs/heads/main/Google-Search-Redirect.js`

2. 确认导入的脚本已启用。在 iOS/iPadOS「设置 → App → Safari 浏览器 → 扩展」中启用 **wBlock Scripts** Safari 扩展（不同系统的路径和名称可能不同），并允许它访问需要使用的 Google 网站；同时检查 Safari 针对当前网站的扩展权限。只启用 wBlock 内容拦截器不等同于启用 Scripts 扩展。
3. 在其他用户脚本管理器中停用同一脚本，以免重复执行；重新加载相关 Google 页面。这些是供用户自行操作的步骤，本项目不能更改设备的安装和权限。

脚本的 `@downloadURL` 和 `@updateURL` 使用同一固定地址。是否以及何时更新取决于 wBlock 版本和设置；更新后请检查已安装的脚本。该地址跟随仓库 `main` 分支，并非固定发行版；导入或更新前请检查变化，并确保信任发布者。

## 首页参数仍然存在时

1. 更新**已经安装的那一份**脚本，将其中的 `@version` 与[最新发行版](https://github.com/lifanultra/Google-Search-Redirect/releases/latest)核对。GitHub 上线不等于管理器已获取新版，也不会替换已打开 Safari 页面中正在运行的旧代码。
2. 确认地区站与 `www.google.com` 都有 Scripts 扩展权限，并保持 `cleanAddressBar: true`。只开启内容拦截器不会执行本脚本。
3. 重新加载页面或新开标签，不要只返回原来的缓存标签。先试 `https://www.google.com/?authuser=1`：应无刷新变为 `https://www.google.com/`，再试地区站首页。末尾 `/` 是根地址的标准写法，不是参数。
4. 如果仅地区站没有跳转，可能是历史/循环保护或会话存储限制正在保护导航。不要通过重复安装或关闭安全保护来强制连续跳转。

## 范围与验证

所检查的 [wBlock 元数据解析器](https://github.com/0xCUB3/wBlock/blob/9aef8131b26e8b99ce470a9b999155b53946a1f8/wBlockCoreService/UserScript.swift) 读取 `@match`、`@run-at`、`@grant` 和 `@noframes`；其匹配代码支持本脚本的精确主机 HTTP/HTTPS 模式。所检查的 [iOS 注入器](https://github.com/0xCUB3/wBlock/blob/9aef8131b26e8b99ce470a9b999155b53946a1f8/wBlock%20Scripts%20(iOS)/Resources/userscript-injector.js) 处理 `document-start`、`none` 和框架排除。实际注入时机与页面世界行为仍受 Safari、CSP 和已安装 wBlock 版本影响；`document-start` 不保证早于首次请求或每个页面脚本执行。

本地可运行 `node --test tests/wblock-compat.test.mjs` 和 `node scripts/build.mjs --check`。前者使用**范围有限的独立模型**检查生成文件的指令及域名清单，并非运行 Swift 解析器或 Safari；项目的其他测试单独检查脚本行为。这些检查不能证明真机兼容。

手动检查时，使用支持的非 `www.google.com` Google 搜索域名和普通搜索词，观察目标地址，再试普通结果链接和后退按钮。部分搜索或主机有意保持不变。如果没有变化，请检查脚本是否启用、Scripts 扩展和网站权限，然后停用其他管理器重试。网站异常时停用脚本并刷新。不要在陌生域名输入私人测试数据。

`google.con` 不在支持的匹配范围内，也不保证能解析或拥有有效证书。用户脚本不能修复 DNS/TLS 错误页面，也不能拦截地址栏首次请求。这里不推荐未经验证的过滤或重定向规则：错误规则可能阻止导航、泄露搜索词或影响其他网站。不能保证提升速度。
