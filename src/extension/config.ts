import * as vscode from 'vscode'

export interface HighlightConfiguration {
  enabled: boolean
  languages: Set<string>
  classAttributes: string[]
  classFunctions: string[]
  debounceMs: number
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}

export function getConfiguration(): HighlightConfiguration {
  const config = vscode.workspace.getConfiguration('tailwindHighlight')
  const tailwindConfig = vscode.workspace.getConfiguration('tailwindCSS')

  const classAttributes = config.get<string[]>('classAttributes', [
    'class',
    'className',
    'ngClass',
    'class:list',
    ':class',
    'v-bind:class',
  ])
  const classFunctions = config.get<string[]>('classFunctions', [
    'clsx',
    'classnames',
    'cn',
    'cva',
    'twMerge',
    'tw(?:\\.[A-Za-z_$][\\w$-]*)?',
  ])

  return {
    enabled: config.get('enabled', true),
    languages: new Set(
      config.get('languages', [
        'html',
        'javascript',
        'javascriptreact',
        'typescript',
        'typescriptreact',
        'vue',
        'svelte',
        'astro',
        'php',
        'blade',
      ]),
    ),
    classAttributes: unique([
      ...classAttributes,
      ...tailwindConfig.get<string[]>('classAttributes', []),
    ]),
    classFunctions: unique([
      ...classFunctions,
      ...tailwindConfig.get<string[]>('classFunctions', []),
    ]),
    debounceMs: Math.max(0, Math.min(250, config.get('debounceMs', 25))),
  }
}
