import * as vscode from 'vscode';

export class HistoryProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;
    private history: { prompt: string; code: string }[] = [];

    refresh(): void { 
        this._onDidChangeTreeData.fire(); 
    }

    addEntry(prompt: string, code: string) {
        this.history.unshift({ prompt, code });
        this.refresh();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem { 
        return element; 
    }

    getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
        if (!element) {
            return this.history.map(h => {
                const item = new vscode.TreeItem(h.prompt, vscode.TreeItemCollapsibleState.None);
                item.command = { 
                    command: 'ntent.insertFromHistory', 
                    title: 'Insert', 
                    arguments: [h.code] 
                };
                item.tooltip = h.code;
                return item;
            });
        }
        return [];
    }
}