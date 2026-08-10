import type { ExtensionContext } from 'vscode'
import { HighlightController } from './extension/controller'

export function activate(context: ExtensionContext): void {
  context.subscriptions.push(new HighlightController())
}

export function deactivate(): void {}
