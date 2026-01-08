import * as vscode from 'vscode';
import { spawn } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerDocumentFormattingEditProvider('scheme', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
            return new Promise((resolve, reject) => {
                const config = vscode.workspace.getConfiguration('schemat');
                const command = config.get<string>('command') || 'schemat';

                // Spawn the process
                // We do not use shell: true to reliably catch ENOENT
                const process = spawn(command, { shell: false });

                let stdout = '';
                let stderr = '';
                let errorEmitted = false;

                process.stdout.on('data', (data) => {
                    stdout += data.toString();
                });

                process.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                process.on('error', (err) => {
                    errorEmitted = true;
                    if ((err as any).code === 'ENOENT') {
                        promptToInstall();
                        resolve([]);
                    } else {
                        vscode.window.showErrorMessage(`Schemat error: ${err.message}`);
                        reject(err);
                    }
                });

                process.on('close', (code) => {
                    if (errorEmitted) {
                        return;
                    }

                    if (code === 0) {
                        // Replace the entire document content with the formatted output
                        const fullRange = new vscode.Range(
                            document.positionAt(0),
                            document.positionAt(document.getText().length)
                        );
                        resolve([vscode.TextEdit.replace(fullRange, stdout)]);
                    } else {
                        // If schemat fails (e.g. syntax error in code), we don't format
                        // We can show a warning or just log it
                        console.warn(`Schemat exited with code ${code}: ${stderr}`);
                        vscode.window.showWarningMessage(`Schemat failed to format: ${stderr}`);
                        resolve([]);
                    }
                });

                // Write document content to stdin
                try {
                    process.stdin.write(document.getText());
                    process.stdin.end();
                } catch (e) {
                    console.error('Failed to write to stdin', e);
                    if (!errorEmitted) {
                        vscode.window.showErrorMessage('Failed to communicate with schemat process.');
                        resolve([]);
                    }
                }
            });
        }
    });

    context.subscriptions.push(provider);
}

function promptToInstall() {
    vscode.window.showInformationMessage(
        'Schemat is not installed. Would you like to install it?',
        'Install'
    ).then(selection => {
        if (selection === 'Install') {
            const terminal = vscode.window.createTerminal('Schemat Installation');
            terminal.show();
            terminal.sendText("curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash && cargo binstall schemat");
        }
    });
}

export function deactivate() { }
