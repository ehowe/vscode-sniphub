import * as vscode from 'vscode';
import {
  createSnippet as apiCreateSnippet,
  getSnippets as apiGetSnippets,
} from './client';

export function activate(context: vscode.ExtensionContext) {
  const workspaceConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('sniphub');
  const url = workspaceConfig.get('apiUrl') as string;
  const token = workspaceConfig.get('apiToken') as string;
  const username = workspaceConfig.get('username') as string;
  const password = workspaceConfig.get('password') as string;

  const getSnippets = vscode.commands.registerCommand('vscode-sniphub.getSnippets', async () => {
    const snippets = await apiGetSnippets({ url, token, username, password });

    const { activeTextEditor } = vscode.window;

    if (activeTextEditor) {
      const { line, character } = activeTextEditor.selection.active;
      const { text } = activeTextEditor.document.lineAt(line);
      const snippetString = snippets.find(s => s.name === text)?.content;

      if (snippetString !== text) {
        const snippet = new vscode.SnippetString(snippetString);

        activeTextEditor.edit(() => {
          const startPosition = new vscode.Position(line, 0);
          const endPosition = new vscode.Position(line, character);
          const range = new vscode.Range(startPosition, endPosition);
          activeTextEditor.insertSnippet(snippet, range);
        });
      }
    }
  });

  const createSnippet = vscode.commands.registerCommand('vscode-sniphub.createSnippet', async () => {
    const { activeTextEditor } = vscode.window;

    if (activeTextEditor) {
      const selection = activeTextEditor.selection;

      if (selection && !selection.isEmpty) {
        const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
        const content = activeTextEditor.document.getText(selectionRange);
        const language = activeTextEditor.document.languageId;

        const name = await vscode.window.showInputBox({
          placeHolder: "New snippet name",
          prompt: "Trigger for new snippet",
        });

        await apiCreateSnippet({ url, token, username, password }, { content, language, name });
      }
    }
  });

  context.subscriptions.push(getSnippets);
  context.subscriptions.push(createSnippet);
}

export function deactivate() {}
