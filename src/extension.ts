import * as vscode from 'vscode';
import { spliceIntoCode, validatePythonSyntax } from './engine';
import { HistoryProvider } from './historyProvider';
import { getWorkspaceSignatures } from './rag';

class NtentActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] {
        if (range.isEmpty) return [];
        const action = new vscode.CodeAction('Ntent: Extract to OOP Class', vscode.CodeActionKind.RefactorRewrite);
        action.command = { command: 'ntent.extractToOOP', title: 'Extract to OOP Class' };
        return [action];
    }
}

export function activate(context: vscode.ExtensionContext) {
    const historyProvider = new HistoryProvider();
    vscode.window.registerTreeDataProvider('ntentHistoryView', historyProvider);

    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    context.subscriptions.push(statusBar);

    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(async (doc) => {
        if (doc.uri.fsPath.endsWith('.tmp')) {
            try { await vscode.workspace.fs.delete(doc.uri); } catch (e) {}
        }
    }));

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('python', new NtentActionProvider())
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ntent.insertFromHistory', (code: string) => {
            const editor = vscode.window.activeTextEditor;
            if (editor) editor.edit(b => b.insert(editor.selection.active, code));
        })
    );

    let scaffoldCmd = vscode.commands.registerCommand('ntent.scaffold', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const userPrompt = await vscode.window.showInputBox({ prompt: "Ntent Intent Engine:" });
        if (!userPrompt) return;

        statusBar.text = "$(sync~spin) Ntent: Compiling Architecture...";
        statusBar.show();

        try {
            const fileContext = editor.document.getText();
            const workspaceContext = await getWorkspaceSignatures();
            let currentPrompt = `${workspaceContext}\nCURRENT FILE:\n${fileContext}\nUSER REQUEST:\n${userPrompt}`;
            let finalCode = "";
            let isClean = false;
            let attempt = 0;

            while (attempt < 3 && !isClean) {
                attempt++;
                const response = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'qwen2.5-coder:1.5b',
                        prompt: currentPrompt,
                        system: "Output ONLY valid Python code.",
                        stream: false
                    })
                });

                const data = await response.json() as { response?: string };
                let rawCode = (data.response || "").replace(/^```[a-z]*\n?/gm, '').replace(/```$/gm, '').trim();

                const check = await validatePythonSyntax(rawCode);
                if (check.valid) {
                    isClean = true;
                    finalCode = rawCode;
                } else {
                    currentPrompt = `Fix syntax errors:\n${check.error}\nRegenerate for: ${userPrompt}`;
                }
            }

            const structuredCode = spliceIntoCode(fileContext, finalCode);
            const tempUri = vscode.Uri.file(editor.document.uri.fsPath + '.ntent.tmp');
            await vscode.workspace.fs.writeFile(tempUri, Buffer.from(structuredCode, 'utf8'));
            
            vscode.commands.executeCommand('vscode.diff', editor.document.uri, tempUri, 'Ntent: Review Architecture');
            historyProvider.addEntry(userPrompt, finalCode);
        } finally {
            statusBar.hide();
        }
    });

    let extractOOPCmd = vscode.commands.registerCommand('ntent.extractToOOP', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) return;

        statusBar.text = "$(sync~spin) Ntent: Encapsulating Logic...";
        statusBar.show();

        try {
            const selectionText = editor.document.getText(editor.selection);
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'qwen2.5-coder:1.5b',
                    prompt: `Refactor this procedural Python block into a clean, typed OOP class structure:\n${selectionText}`,
                    system: "Output ONLY valid Python code.",
                    stream: false
                })
            });

            const data = await response.json() as { response?: string };
            const refactoredCode = (data.response || "").replace(/^```[a-z]*\n?/gm, '').replace(/```$/gm, '').trim();
            
            const tempUri = vscode.Uri.file(editor.document.uri.fsPath + '.refactor.tmp');
            await vscode.workspace.fs.writeFile(tempUri, Buffer.from(refactoredCode, 'utf8'));
            vscode.commands.executeCommand('vscode.diff', editor.document.uri, tempUri, 'Ntent: Review OOP Extraction');
        } finally {
            statusBar.hide();
        }
    });

    let diagnoseTerminalCmd = vscode.commands.registerCommand('ntent.diagnoseTerminal', async () => {
        const clipboardText = await vscode.env.clipboard.readText();
        if (!clipboardText.includes("Traceback") && !clipboardText.includes("Error")) {
            vscode.window.showErrorMessage("Copy a Python Traceback from the terminal first.");
            return;
        }

        statusBar.text = "$(sync~spin) Ntent: Diagnosing Stack Trace...";
        statusBar.show();

        try {
            const editor = vscode.window.activeTextEditor;
            const fileContext = editor ? editor.document.getText() : "No file context.";

            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'qwen2.5-coder:1.5b',
                    prompt: `I received this terminal error:\n${clipboardText}\n\nHere is my code:\n${fileContext}\n\nIdentify the exact line causing the crash and write the corrected code.`,
                    system: "Act as an expert Python debugger.",
                    stream: false
                })
            });

            const data = await response.json() as { response?: string };
            const doc = await vscode.workspace.openTextDocument({ content: data.response, language: 'markdown' });
            vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
        } finally {
            statusBar.hide();
        }
    });

    context.subscriptions.push(scaffoldCmd, extractOOPCmd, diagnoseTerminalCmd);
}
export function deactivate() {}