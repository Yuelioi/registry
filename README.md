# nuxtblog Plugin Registry

This repository is the official plugin registry for [nuxtblog](https://github.com/nuxtblog/nuxtblog).

The `registry.json` file is periodically synced by nuxtblog instances to populate the **Plugin Marketplace** in the admin panel.

## Submit a plugin

Read [PUBLISHING.md](./PUBLISHING.md) for the full submission guide.

**Quick summary:**

1. Host your plugin on GitHub (with a `package.json` containing a `"plugin"` field, and a built `index.js`)
2. Create a GitHub Release with a version tag
3. Fork this repo, add your entry to `registry.json`, open a PR
4. CI validates the entry — once merged, it appears in the marketplace

## Plugin types

| type | Description |
|---|---|
| `hook` | Listens to or intercepts blog events |
| `integration` | Third-party service integrations (analytics, comments, search, etc.) |
| `theme` | CSS-only themes and style overrides |

## Plugin SDK

To develop a plugin with full TypeScript support:

```bash
npm install -D @nuxtblog/plugin-sdk
```

See [@nuxtblog/plugin-sdk](https://github.com/nuxtblog/plugin-sdk) for documentation.
