import * as vscode from 'vscode'
import type { HighlightGroup, HighlightSpan } from '../core/types'

type RenderGroup = 'tailwind' | 'custom'

const renderGroups: RenderGroup[] = ['tailwind', 'custom']

function renderGroupFor(group: HighlightGroup): RenderGroup {
  return group === 'custom' ? 'custom' : 'tailwind'
}

export class DecorationRenderer implements vscode.Disposable {
  private decorations = new Map<RenderGroup, vscode.TextEditorDecorationType>()
  private signatures = new WeakMap<vscode.TextEditor, Map<RenderGroup, string>>()

  constructor() {
    this.decorations.set(
      'tailwind',
      vscode.window.createTextEditorDecorationType({
        borderColor: 'rgba(128, 128, 128, 0.18)',
        borderStyle: 'solid',
        borderWidth: '0 0 1px 0',
      }),
    )
    this.decorations.set(
      'custom',
      vscode.window.createTextEditorDecorationType({
        opacity: '0.78',
      }),
    )
  }

  apply(editor: vscode.TextEditor, spans: HighlightSpan[]): void {
    const grouped = new Map<RenderGroup, HighlightSpan[]>(renderGroups.map((group) => [group, []]))

    for (const span of spans) grouped.get(renderGroupFor(span.group))!.push(span)

    let editorSignatures = this.signatures.get(editor)
    if (!editorSignatures) {
      editorSignatures = new Map()
      this.signatures.set(editor, editorSignatures)
    }

    for (const group of renderGroups) {
      const groupSpans = grouped.get(group)!
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
