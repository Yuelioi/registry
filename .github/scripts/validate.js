// Validates registry.json entries on PR
const fs = require('fs')

const REQUIRED_FIELDS = ['name', 'title', 'description', 'version', 'author', 'repo', 'published_at', 'updated_at']
const VALID_TYPES = ['hook', 'integration', 'theme']

let exitCode = 0

function fail(msg) {
  console.error('❌', msg)
  exitCode = 1
}

function check(condition, msg) {
  if (!condition) fail(msg)
}

let registry
try {
  registry = JSON.parse(fs.readFileSync('registry.json', 'utf-8'))
} catch (e) {
  fail('registry.json 解析失败: ' + e.message)
  process.exit(1)
}

check(Array.isArray(registry), 'registry.json 根节点必须是数组')

const names = new Set()

for (const [i, plugin] of registry.entries()) {
  const prefix = `[${i}] ${plugin.name || '(unnamed)'}`

  // Required fields
  for (const field of REQUIRED_FIELDS) {
    check(plugin[field] !== undefined && plugin[field] !== '', `${prefix}: 缺少必填字段 "${field}"`)
  }

  // name uniqueness
  if (plugin.name) {
    check(!names.has(plugin.name), `${prefix}: name 重复`)
    names.add(plugin.name)
  }

  // type
  if (plugin.type) {
    check(VALID_TYPES.includes(plugin.type), `${prefix}: type 无效，可选值: ${VALID_TYPES.join(', ')}`)
  }

  // is_official — cannot be self-claimed (must be set by maintainers only; CI can't enforce this,
  // but we at least check it's a boolean)
  if ('is_official' in plugin) {
    check(typeof plugin.is_official === 'boolean', `${prefix}: is_official 必须是 boolean`)
  }

  // tags
  if (plugin.tags) {
    check(Array.isArray(plugin.tags), `${prefix}: tags 必须是数组`)
    for (const tag of plugin.tags || []) {
      check(typeof tag === 'string' && tag === tag.toLowerCase(), `${prefix}: tag "${tag}" 必须是小写字符串`)
    }
  }

  // dates (basic ISO format check)
  for (const dateField of ['published_at', 'updated_at']) {
    if (plugin[dateField]) {
      check(!isNaN(Date.parse(plugin[dateField])), `${prefix}: ${dateField} 不是有效的日期格式`)
    }
  }

  // repo format (basic check)
  if (plugin.repo) {
    check(/^[\w.-]+\/[\w.-]+$/.test(plugin.repo), `${prefix}: repo 格式应为 "owner/repo"`)
  }

  // version (semver basic)
  if (plugin.version) {
    check(/^\d+\.\d+\.\d+/.test(plugin.version), `${prefix}: version 应遵循 semver 格式，如 1.0.0`)
  }
}

if (exitCode === 0) {
  console.log(`✅ 校验通过，共 ${registry.length} 个插件`)
} else {
  console.error('\n请修复以上错误后重新提交')
}

process.exit(exitCode)
