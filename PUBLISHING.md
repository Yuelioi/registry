# 发布插件到市场

## 前置要求

- 插件仓库托管在 GitHub 或 Gitee
- 仓库根目录有 `plugin.json`（格式见 [README](./README.md)）
- 插件可正常安装运行

## 发布流程

### 1. 准备仓库

确保仓库根目录包含：

```
your-plugin/
├── plugin.json   ← 必须（包含 name、title、description、version、author）
├── index.js      ← 编译后的单文件脚本（JS 插件必须）
└── README.md     ← 建议提供
```

`plugin.json` 中的 `name` 建议使用 `your-github-username/plugin-slug` 格式，安装后不可更改。

### 2. 发布 Release（推荐）

打好 git tag 并在 GitHub Releases 上附上版本说明，方便用户了解更新内容：

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 3. 提交 PR

Fork 本仓库，在 `registry.json` 末尾添加一条记录：

```json
{
  "name": "your-name/your-plugin",
  "title": "插件显示名称",
  "description": "一句话描述插件功能",
  "version": "1.0.0",
  "author": "your-name",
  "icon": "i-tabler-plug",
  "repo": "your-github-username/your-repo",
  "homepage": "https://github.com/your-github-username/your-repo",
  "tags": ["tag1", "tag2"],
  "type": "hook",
  "is_official": false,
  "license": "MIT",
  "published_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### 4. 等待审核

CI 会自动校验字段完整性和 repo 可访问性。审核通过合并后，插件将出现在博客管理后台的插件市场中。

---

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | ✅ | 唯一标识符，推荐 `owner/slug` 格式 |
| `title` | string | ✅ | 市场展示名称 |
| `description` | string | ✅ | 一句话功能描述 |
| `version` | string | ✅ | 当前版本号，如 `1.2.0` |
| `author` | string | ✅ | 作者名或 GitHub 用户名 |
| `repo` | string | ✅ | GitHub 仓库路径，如 `user/repo`（博客通过此安装）|
| `icon` | string | | [Tabler Icons](https://tabler.io/icons) 图标名，如 `i-tabler-bell` |
| `homepage` | string | | 主页 URL，默认与 repo 相同 |
| `tags` | string[] | | 分类标签，小写英文 |
| `type` | string | | `hook` / `integration` / `theme` |
| `is_official` | boolean | | 官方插件，由维护者标注，勿自行设为 true |
| `license` | string | | 开源协议，如 `MIT` |
| `published_at` | string | ✅ | 首次发布时间，ISO 8601 格式 |
| `updated_at` | string | ✅ | 最后更新时间，ISO 8601 格式 |

### type 值说明

| 值 | 适用场景 |
|---|---|
| `hook` | 监听/拦截博客事件（通知推送、数据处理等）|
| `integration` | 第三方服务集成（分析、评论、搜索等）|
| `theme` | 纯 CSS 主题/样式插件 |

---

## 更新插件

插件有新版本时，再提一个 PR，更新 `registry.json` 中对应条目的 `version` 和 `updated_at` 字段即可。

## 下架插件

提 PR 将对应条目从 `registry.json` 中删除，并说明原因。
