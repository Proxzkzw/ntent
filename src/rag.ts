import * as vscode from 'vscode';

export async function getWorkspaceSignatures(): Promise<string> {
    const files = await vscode.workspace.findFiles('**/*.py', '**/venv/**');
    let contextStr = "WORKSPACE ARCHITECTURE (Do not duplicate these classes, use them):\n";
    
    for (let i = 0; i < Math.min(files.length, 10); i++) {
        const fileData = await vscode.workspace.fs.readFile(files[i]);
        const content = Buffer.from(fileData).toString('utf8');
        
        const signatures = content.split('\n')
            .filter(line => line.trim().startsWith('class ') || line.trim().startsWith('def '))
            .map(line => line.trim())
            .join('\n');
            
        if (signatures) {
            contextStr += `--- ${files[i].path.split('/').pop()} ---\n${signatures}\n\n`;
        }
    }
    return contextStr;
}