# 发布插件到市场

## 前置要求

- 插件仓库托管在 GitHub
- 仓库根目录有 `plugin.yaml`（统一配置清单）
- 插件可正常安装运行

## 插件类型

| type | runtime | 语言 | 说明 |
|---|---|---|---|
| `builtin` | `compiled` | Go | 编译到服务端二进制的内置插件 |
| `js` | `interpreted` | JavaScript | Goja JS 引擎解释执行 |
| `yaml` | `interpreted` | YAML | 零代码声明式配置（Webhook、过滤规则） |
| `ui` | — | Vue/TypeScript | 纯前端组件（管理面板、前台 UI） |
| `full` | `compiled` | Go + Vue | 全栈插件（Go 后端 + Vue 前端） |

## 插件项目结构

### JS 插件（type: js）

```
your-plugin/
├── plugin.yaml          ← 统一配置清单
├── plugin.js            ← JS 源码（CommonJS 格式）
├── .github/workflows/
│   └── release.yml      ← 发布工作流
└── README.md
```

### 全栈插件（type: full）

```
your-plugin/
├── plugin.yaml
├── plugin.js
├── .github/workflows/
│   └── release.yml
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── admin/           ← 管理后台 Vue 组件
│   │   └── index.ts
│   └── public/          ← 前台 Vue 组件
│       └── index.ts
└── README.md
```

## plugin.yaml 配置清单

`plugin.yaml` 是插件的唯一配置源，服务端和前端均从此文件读取元信息。

```yaml
# ── 基础信息 ──
id: your-plugin-id              # 唯一标识符（必填）
title: 插件名称                  # 显示名称（必填）
version: 1.0.0                  # 语义化版本（必填）
icon: i-tabler-plug             # Tabler Icons 图标名
author: your-name               # 作者名
description: 一句话功能描述      # 市场展示用

# ── 类型与运行时 ──
type: js                        # builtin / js / yaml / ui / full
runtime: interpreted            # compiled / interpreted
trust_level: community          # official / community / local
license: MIT
sdk_version: "1.0.0"
priority: 10                    # 加载优先级（数字越小越先）

# ── 市场信息 ──
repo: https://github.com/you/your-plugin
homepage: https://github.com/you/your-plugin
tags: [tag1, tag2]

# ── JS 入口 ──
js_entry: plugin.js             # type: js / full 必填

# ── 前端产物 ──
admin_js: admin.mjs             # type: ui / full，管理后台 JS
public_js: public.mjs           # type: ui / full，前台 JS

# ── 设置项 ──
settings:
  - key: setting_key
    label: 设置名称
    type: string                # string / number / boolean / select / textarea / password
    default: ""
    description: 设置说明
    group: 分组名

# ── 前端页面 ──
pages:
  - path: /admin/your-page
    slot: admin
    component: YourComponent
    title: 页面标题
    nav:
      group: 分组名
      icon: i-tabler-icon
      order: 50

# ── 自定义路由 ──
routes:
  - method: GET
    path: /api/plugin/your-plugin/endpoint
    auth: admin                 # admin / public
    description: 路由说明

# ── 数据库迁移 ──
migrations:
  - version: 1
    up: "CREATE TABLE IF NOT EXISTS ..."
    down: "DROP TABLE ..."

# ── UI 贡献点 ──
contributes:
  commands:
    - id: "your-plugin:action"
      title: 命令名称
      icon: i-tabler-icon
  menus:
    post-list:row-action:
      - command: "your-plugin:action"
```

## plugin.js 编写规范

JS 插件通过 [Goja](https://github.com/dop251/goja) 引擎执行，使用 CommonJS 模块格式：

```javascript
// plugin.js — CommonJS 格式

function onPostCreate(fc) {
  var enabled = ctx.settings.get("enabled")
  if (enabled === false) return

  var title = fc.data.title || ""
  ctx.log.info("new post: " + title)
}

module.exports = {
  activate: function () {
    ctx.log.info("plugin activated")
  },

  deactivate: function () {},

  filters: [
    { event: "filter:post.create", handler: function (fc) { onPostCreate(fc) } }
  ]
}
```

**注意事项：**
- 使用 CommonJS 格式（`module.exports`），不支持 ESM（`import/export`）
- 不支持 `async/await`、`Promise`
- 宿主自动注入全局 `ctx` 对象，提供 `ctx.log`、`ctx.settings`、`ctx.store`、`ctx.db`、`ctx.http`
- 正则中不支持 `\u{xxxxx}` 语法，用 `charCodeAt()` 替代

## 可用的 SDK 接口

通过全局 `ctx` 对象访问平台能力：

| 接口 | 说明 |
|---|---|
| `ctx.log` | 日志（info/warn/error） |
| `ctx.settings.get(key)` | 读取插件设置值 |
| `ctx.store.get/set/delete/increment` | KV 持久化存储 |
| `ctx.db.query/execute` | 数据库读写 |
| `ctx.http.get/post` | 发送外部 HTTP 请求 |

可导出的接口方法：

| 属性 | 说明 |
|---|---|
| `filters` | 数据过滤器数组 `[{event, handler}]` |
| `events` | 事件监听数组 `[{event, handler}]` |
| `routes` | HTTP 路由数组 `[{method, path, handler}]` |
| `activate` | 插件激活回调 |
| `deactivate` | 插件停用回调 |

## 发布流程

### 1. 创建 GitHub Release

打 git tag 并推送：

```bash
git tag v1.0.0
git push origin v1.0.0
```

如果配置了 `.github/workflows/release.yml`，Release 会自动创建。

### 2. 提交 PR 到 Registry

Fork 本仓库，在 `plugins/` 目录下新建 JSON 文件：

- 文件命名：`{owner}_{plugin-id}.json`（例：`nuxtblog_nuxtblog-plugin-ai-polish.json`）
- **不要修改 `registry.json`**，该文件由 CI 自动生成

```json
{
  "name": "your-plugin-id",
  "title": "插件名称",
  "description": "一句话功能描述",
  "version": "1.0.0",
  "author": "your-name",
  "icon": "i-tabler-plug",
  "repo": "your-name/your-plugin",
  "homepage": "https://github.com/your-name/your-plugin",
  "tags": ["tag1", "tag2"],
  "type": "js",
  "runtime": "interpreted",
  "is_official": false,
  "license": "MIT",
  "sdk_version": "1.0.0",
  "trust_level": "community",
  "capabilities": ["store", "http"],
  "features": ["routes", "filters"],
  "published_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

### 3. 等待审核

CI 自动校验字段。合并后 `registry.json` 自动重建，插件即出现在博客管理后台的插件市场中。

---

## 字段说明

### 基础字段（必填）

| 字段 | 类型 | 说明 |
|---|---|---|
| `name` | string | 唯一标识符，与 plugin.yaml 的 `id` 一致 |
| `title` | string | 市场展示名称 |
| `description` | string | 一句话功能描述 |
| `version` | string | 当前版本号（semver） |
| `author` | string | 作者名或 GitHub 用户名 |
| `repo` | string | GitHub 仓库路径 `owner/repo` |
| `type` | string | 插件类型，见下方 |
| `runtime` | string | 运行时，见下方 |
| `published_at` | string | 首次发布时间（ISO 8601） |
| `updated_at` | string | 最后更新时间（ISO 8601） |

### 可选字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `icon` | string | Tabler Icons 图标名 |
| `homepage` | string | 主页 URL |
| `tags` | string[] | 分类标签（小写英文 + 数字 + 连字符） |
| `is_official` | boolean | 官方插件标识（PR 中不可设为 true） |
| `license` | string | 开源协议 |
| `sdk_version` | string | SDK 版本（semver） |
| `trust_level` | string | 信任等级：`official` / `community` / `local` |
| `capabilities` | string[] | 需要的平台能力 |
| `features` | string[] | 使用的功能特性 |

### type 值说明

| 值 | 说明 |
|---|---|
| `builtin` | Go 编译插件，内置到服务端二进制 |
| `js` | JavaScript 后端插件（Goja 引擎解释执行） |
| `yaml` | 声明式 YAML 插件（零代码） |
| `ui` | 纯前端 Vue 插件 |
| `full` | 全栈插件（Go 后端 + Vue 前端） |

### runtime 值说明

| 值 | 说明 |
|---|---|
| `compiled` | Go 编译，需要 `nuxtblog build` 重新构建服务端 |
| `interpreted` | 解释执行，下载后即可使用，重启服务端生效 |

### capabilities 值说明

| 值 | 含义 |
|---|---|
| `http` | 发送外部 HTTP 请求 |
| `store` | KV 持久化存储 |
| `db` | 自定义数据库表 |
| `ai` | 使用宿主 AI 服务 |
| `events` | 事件订阅 |

### features 值说明

| 值 | 含义 |
|---|---|
| `routes` | 注册自定义 HTTP 路由 |
| `filters` | 注册数据过滤器 |
| `events` | 监听事件 |
| `migrations` | 数据库迁移 |
| `admin_js` | 管理后台前端脚本 |
| `public_js` | 前台前端脚本 |
| `pages` | 注册前端页面 |
| `contributes` | UI 贡献点（菜单、命令等） |

---

## 更新插件

修改你的 `plugins/{name}.json`，更新 `version` 和 `updated_at`，提 PR 即可。

## 下架插件

提 PR 删除对应的 `plugins/{name}.json`，在 PR 描述中说明原因。
