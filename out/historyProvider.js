"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryProvider = void 0;
const vscode = require("vscode");
class HistoryProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    history = [];
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    addEntry(prompt, code) {
        this.history.unshift({ prompt, code });
        this.refresh();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
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
exports.HistoryProvider = HistoryProvider;
//# sourceMappingURL=historyProvider.js.map