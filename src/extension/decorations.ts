import * as vscode from 'vscode'
import { highlightGroups, type HighlightGroup, type HighlightSpan } from '../core/types'

const palette: Record<HighlightGroup, { dark: string; light: string }> = {
  variant: { dark: '#56B6C2', light: '#007C91' },
  layout: { dark: '#C678DD', light: '#7B2CBF' },
  flexGrid: { dark: '#D19A66', light: '#A04B00' },
  spacing: { dark: '#61AFEF', light: '#005FB8' },
  sizing: { dark: '#4EC9B0', light: '#087F5B' },
  typography: { dark: '#E5C07B', light: '#8A6200' },
  color: { dark: '#E06C75', light: '#B4232A' },
  border: { dark: '#98C379', light: '#4D7C0F' },
  effects: { dark: '#D16DFF', light: '#8E24AA' },
  motion: { dark: '#F78C6C', light: '#C2410C' },
  interactivity: { dark: '#ABB2BF', light: '#4B5563' },
  accessibility: { dark: '#7F848E', light: '#6B7280' },
}

export class DecorationRenderer implements vscode.Disposable {
  private decorations = new Map<HighlightGroup, vscode.TextEditorDecorationType>()
  private signatures = new WeakMap<vscode.TextEditor, Map<HighlightGroup, string>>()

  constructor() {
    for (const group of highlightGroups) {
      const colors = palette[group]
      this.decorations.set(
        group,
        vscode.window.createTextEditorDecorationType({
          dark: { color: colors.dark },
          light: { color: colors.light },
        }),
      )
    }
  }

  apply(editor: vscode.TextEditor, spans: HighlightSpan[]): void {
    const grouped = new Map<HighlightGroup, HighlightSpan[]>()
    for (const group of highlightGroups) grouped.set(group, [])
    for (const span of spans) grouped.get(span.group)?.push(span)

    let editorSignatures = this.signatures.get(editor)
    if (!editorSignatures) {
      editorSignatures = new Map()
      this.signatures.set(editor, editorSignatures)
    }

    for (const group of highlightGroups) {
      const groupSpans = grouped.get(group) ?? []
      const signature = groupSpans.map((span) => `${span.start}:${span.end}`).join(',')
      if (editorSignatures.get(group) === signature) continue

      const ranges = groupSpans.map(
        (span) =>
          new vscode.Range(
            editor.document.positionAt(span.start),
            editor.document.positionAt(span.end),
          ),
      )
      editor.setDecorations(this.decorations.get(group)!, ranges)
      editorSignatures.set(group, signature)
    }
  }

  clear(editor: vscode.TextEditor): void {
    this.apply(editor, [])
  }

  dispose(): void {
    for (const decoration of this.decorations.values()) decoration.dispose()
    this.decorations.clear()
    this.signatures = new WeakMap()
  }
}
