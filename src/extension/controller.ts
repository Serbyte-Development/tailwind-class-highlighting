import * as path from 'node:path'
import * as vscode from 'vscode'
import { analyzeText } from '../core/analyze'
import { getConfiguration, type HighlightConfiguration } from './config'
import { DecorationRenderer } from './decorations'

const languageExtensions: Record<string, string> = {
  html: 'html',
  javascript: 'js',
  javascriptreact: 'jsx',
  typescript: 'ts',
  typescriptreact: 'tsx',
  vue: 'vue',
  svelte: 'svelte',
  astro: 'astro',
  php: 'php',
  blade: 'blade.php',
}

function documentExtension(document: vscode.TextDocument): string {
  const mapped = languageExtensions[document.languageId]
  if (mapped) return mapped
  const extension = path.extname(document.fileName).slice(1)
  return extension || 'html'
}

export class HighlightController implements vscode.Disposable {
  private config: HighlightConfiguration = getConfiguration()
  private renderer = new DecorationRenderer()
  private timers = new Map<string, NodeJS.Timeout>()
  private subscriptions: vscode.Disposable[] = []

  constructor() {
    this.subscriptions.push(
      vscode.window.onDidChangeVisibleTextEditors((editors) => {
        for (const editor of editors) this.schedule(editor, 0)
      }),
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) this.schedule(editor, 0)
      }),
      vscode.workspace.onDidChangeTextDocument((event) => {
        for (const editor of vscode.window.visibleTextEditors) {
          if (editor.document === event.document) this.schedule(editor)
        }
      }),
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (!event.affectsConfiguration('tailwindHighlight')) return
        this.config = getConfiguration()
        this.renderer.dispose()
        this.renderer = new DecorationRenderer()
        for (const editor of vscode.window.visibleTextEditors) this.schedule(editor, 0)
      }),
      vscode.workspace.onDidCloseTextDocument((document) => {
        const timer = this.timers.get(document.uri.toString())
        if (timer) clearTimeout(timer)
        this.timers.delete(document.uri.toString())
      }),
    )

    for (const editor of vscode.window.visibleTextEditors) this.schedule(editor, 0)
  }

  private schedule(editor: vscode.TextEditor, delay = this.config.debounceMs): void {
    const key = editor.document.uri.toString()
    const previous = this.timers.get(key)
    if (previous) clearTimeout(previous)

    const timer = setTimeout(() => {
      this.timers.delete(key)
      this.update(editor)
    }, delay)
    this.timers.set(key, timer)
  }

  private update(editor: vscode.TextEditor): void {
    const document = editor.document
    if (!this.config.enabled || !this.config.languages.has(document.languageId)) {
      this.renderer.clear(editor)
      return
    }

    const spans = analyzeText(document.getText(), {
      extension: documentExtension(document),
      classAttributes: this.config.classAttributes,
      classFunctions: this.config.classFunctions,
    })
    this.renderer.apply(editor, spans)
  }

  dispose(): void {
    for (const timer of this.timers.values()) clearTimeout(timer)
    this.timers.clear()
    for (const subscription of this.subscriptions) subscription.dispose()
    this.subscriptions = []
    this.renderer.dispose()
  }
}
