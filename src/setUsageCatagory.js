const vscode = require('vscode');
const { GetCurrentObjectFromLineText } = require('./Library.js');
let menuNode = {
    Type: '',
    Id: '',
    UsageCategory: ''
}
let menuNodeList = [];
module.exports = {
    setUsageCategory: function()
    {
        processMenuTxtfile();
    }
}
    
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
async function processMenuTxtfile()
{
    const fs = require('fs');
    const filePath = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: 'Select Menu.txt file'
    });
    const menuTxtFile = fs.readFileSync(filePath[0].fsPath, 'utf8');

    const itemRegex = /RunObjectType=(\w+);RunObjectID=(\d+);.+DepartmentCategory=(\w+)/gmi;
    menuTxtFile.replace(/\\n/gm, '');
    let match = itemRegex.exec(menuTxtFile);
    while (match != null) {
        menuNode = {
            Type: match[1],
            Id: match[2],
            UsageCategory: match[3]
        }
        menuNodeList.push(menuNode);
        match = itemRegex.exec(menuTxtFile);
    }
    console.log(menuNodeList);
}