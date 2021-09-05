"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodelensProvider = void 0;
const vscode = require("vscode");
/**
 * CodelensProvider
 */
class CodelensProvider {
    constructor() {
        this.codeLenses = []; //存储需要的codeLenses
        this._onDidChangeCodeLenses = new vscode.EventEmitter();
        this.onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;
        this.regex = /(.+)/g;
        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire(); //发射事件
        });
    }
    provideCodeLenses(document, token) {
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
    resolveCodeLens(codeLens, token) {
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
exports.CodelensProvider = CodelensProvider;
//# sourceMappingURL=CodelensProvider.js.map