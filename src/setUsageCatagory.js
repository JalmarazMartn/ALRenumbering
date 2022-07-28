const vscode = require('vscode');
const { GetCurrentObjectFromLineText } = require('./Library.js');
let menuNode = {
    Type: '',
    Id: '',
    UsageCategory: ''
}
let menuNodeList = [];
async function processMenuNodes(menuNodeList) {
    let OutputChannel = vscode.window.createOutputChannel('Set Usage Category');
    OutputChannel.clear();
	OutputChannel.show();

	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocumentURI = AllDocs[index];
		var ALDocument = await vscode.workspace.openTextDocument(ALDocumentURI);
		var DeclarationLineText = await GetDeclarationLineText(ALDocument);
		OutputChannel.appendLine('Processing ' + DeclarationLineText);	
        let CurrentObjectFromLineText = GetCurrentObjectFromLineText(DeclarationLineText);
		let menuNode = menuNodeList.find(x => x.Id === CurrentObjectFromLineText.ObjectID
                && x.Type === CurrentObjectFromLineText.ObjectType);
		if (menuNode) {
            await appendUsageinDocument(ALDocument, menuNode.UsageCategory);
            OutputChannel.appendLine(DeclarationLineText + ' With usage');
		}
	};

}

function GetDeclarationLineText(ALDocument) {
    const Library = require('./Library.js');
    return Library.GetDeclarationLineText(ALDocument);
}
function GetDeclarationLineNumber(ALDocument) {
    const Library = require('./Library.js');
    return Library.GetDeclarationLineNumber(ALDocument);    
}

async function appendUsageinDocument(ALDocument, UsageCategory) {    
    const WSEdit = new vscode.WorkspaceEdit;
    const DeclarationLineNumber = GetDeclarationLineNumber(ALDocument);
    const PositionOpen = new vscode.Position(DeclarationLineNumber , 0);
    await WSEdit.insert(ALDocument.uri, PositionOpen, 'UsageCategory = "' + menuNode.UsageCategory + '"');
    await vscode.workspace.applyEdit(WSEdit);    
}

