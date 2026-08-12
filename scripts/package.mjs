import { spawnSync } from 'node:child_process'

const targets = {
  'darwin:arm64': 'darwin-arm64',
  'darwin:x64': 'darwin-x64',
  'linux:arm64': 'linux-arm64',
  'linux:x64': 'linux-x64',
  'win32:arm64': 'win32-arm64',
  'win32:x64': 'win32-x64',
}

const target = targets[`${process.platform}:${process.arch}`]
if (!target) {
  throw new Error(`Unsupported packaging platform: ${process.platform}-${process.arch}`)
}

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const result = spawnSync(
  npx,
  [
    'vsce',
    'package',
    '--target',
    target,
    '--allow-missing-repository',
    '--out',
    `dist/tailwind-class-highlighting-${target}.vsix`,
  ],
  { stdio: 'inherit' },
)

process.exit(result.status ?? 1)
