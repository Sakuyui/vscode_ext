import { count } from 'console';
import { type } from 'os';
import * as vscode from 'vscode';

export function dictToString(m : {[index: string]:number}){
	let a = '';
	for(const k in m){
		a += "[" + k + ", " + m[k] + "]\r\n";
	}
	return a;
}

export class REPosition{
	start : vscode.Position;
	end : vscode.Position;
	constructor(s : vscode.Position, e: vscode.Position){
		this.start = s;
		this.end = e;
	}
}
export class WordFreq{
	times = 0;
	positions : Array<REPosition> = new Array<REPosition>();
	constructor(){
		this.times = 0;
	}
}

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('decorator sample is activated');

	let timeout: NodeJS.Timer | undefined = undefined;

	// create a decorator type that we use to decorate small numbers
	const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		light: {
			// this color will be used in light color themes
			borderColor: 'darkblue'
		},
		dark: {
			// this color will be used in dark color themes
			borderColor: 'lightblue'
		}
	});


	

	
	// create a decorator type that we use to decorate large numbers
	const largeNumberDecorationType = vscode.window.createTextEditorDecorationType({
		cursor: 'crosshair',
		// use a themable color. See package.json for the declaration and default values.
		backgroundColor: { id: 'myextension.largeNumberBackground' }
	});

	let activeEditor = vscode.window.activeTextEditor;

	
	let blockBackgraoudStyle : vscode.TextEditorDecorationType[] = [];
	
	// function createBlockBackgroundStyles(){
	// 	blockBackgraoudStyle = {};
	// 	blockBackgraoudStyleArray = {};
	// 	for(let f = 0.00; f < 1.00; f += 0.01){
	// 		const fStr = f.toFixed(2);
	// 		const decorationType = vscode.window.createTextEditorDecorationType({
	// 			cursor: 'crosshair',
	// 			// use a themable color. See package.json for the declaration and default values.
	// 			backgroundColor: 'rgba(255, 174, 185, '+ fStr +')'
	// 		});
	// 		blockBackgraoudStyle[fStr] = decorationType;
	// 		blockBackgraoudStyleArray[fStr] = [];
	// 	}
	//}
	
	function updateDecorations() {
		if (!activeEditor) {
			return;
		}

		if(blockBackgraoudStyle.length != 0){
			blockBackgraoudStyle.forEach((e) => {
				e.dispose();
			});
			blockBackgraoudStyle = [];
		}
		
		//const regEx = /\d+/g;
		const regEx = /[^\s]+/g;
		const text = activeEditor.document.getText();
	
		let match;
		
		const hist : {[index:string]: WordFreq} = {}; 
		
	

		let wcount = 0;
		while ((match = regEx.exec(text))) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			const a = match[0];
			wcount++;
			if(a in hist){
				hist[a].times++;
				hist[a].positions.push(new REPosition(startPos, endPos));
			}else{
				const wf = new WordFreq();
				wf.times = 1;
				wf.positions.push(new REPosition(startPos, endPos));
				hist[a] = wf;
			}
			
		}
		

		for(const k in hist){
			const wf = hist[k];
			const word = k;
			const f = wf.times / wcount;
			const fStr = f.toFixed(2);
			
			const CurDecorationType =  vscode.window.createTextEditorDecorationType({
				cursor: 'crosshair',
				backgroundColor: 'rgba(255, 174, 185, '+ fStr +')'
			});
			blockBackgraoudStyle.push(CurDecorationType);
			const dec: vscode.DecorationOptions[] = [];
			wf.positions.forEach(pos =>{
				const decoration = { range: new vscode.Range(pos.start, pos.end), hoverMessage: 'Token **' + word + '**, wf:' + f };	
				dec.push(decoration);
			});
			
			activeEditor.setDecorations(CurDecorationType, dec);
		}

		
		//activeEditor.setDecorations(smallNumberDecorationType, smallNumbers);
		//activeEditor.setDecorations(largeNumberDecorationType, largeNumbers);
	}

	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		timeout = setTimeout(updateDecorations, 100);
	}

	if (activeEditor) {
	
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

}

