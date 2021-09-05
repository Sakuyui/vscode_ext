import * as vscode from 'vscode';

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {

    private codeLenses: vscode.CodeLens[] = []; //存储需要的codeLenses
    private regex: RegExp;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        this.regex = /(.+)/g;

        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire(); //发射事件
        });
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {

        if (vscode.workspace.getConfiguration("codelens-sample").get("enableCodeLens", true)) { //从package.json里获取配置
            this.codeLenses = [];
            const regex = new RegExp(this.regex);
            const text = document.getText();
            let matches;
            while ((matches = regex.exec(text)) !== null) {
                const line = document.lineAt(document.positionAt(matches.index).line); //行 document.positionAt(matches.index).line是行索引，line是对象
                const indexOf = line.text.indexOf(matches[0]);
                const position = new vscode.Position(line.lineNumber, indexOf);
                const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));

                //加入Codelens
                if (range) {
                    this.codeLenses.push(new vscode.CodeLens(range));
                }
            }
            return this.codeLenses;
        }
        return [];
    }

    //在这里解析CodeLens
    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        if (vscode.workspace.getConfiguration("codelens-sample").get("enableCodeLens", true)) { //判断配置是否开启
            codeLens.command = {
                title: "Codelens: Line - " + codeLens.range.start.line + ", char count = " + (codeLens.range.end.character - codeLens.range.start.character),
                tooltip: "Tooltip provided by sample extension",
                command: "codelens-sample.codelensAction",
                arguments: ["lineIndex", codeLens.range.start.line],
            };
            return codeLens;
        }
        return null;
    }
}

