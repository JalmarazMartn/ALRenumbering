const vscode = require('vscode');
const { GetCurrentObjectFromLineText } = require('./Library.js');
let menuNode = {
    Type: '',
    Id: '',
    UsageCategory: ''
}
let menuNodeList = [];
module.exports = {
    setUsageCategory: function () {
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
    const PositionOpen = new vscode.Position(DeclarationLineNumber, 0);
    await WSEdit.insert(ALDocument.uri, PositionOpen, 'UsageCategory = "' + menuNode.UsageCategory + '"');
    await vscode.workspace.applyEdit(WSEdit);
}
async function processMenuTxtfile() {
    const fs = require('fs');
    const filePath = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: 'Select Menu.txt file'
    });
    let menuTxtFile = fs.readFileSync(filePath[0].fsPath, 'utf8');

    //const itemRegex = /RunObjectType=(\w+);RunObjectID=(\d+);.+DepartmentCategory=(\w+)/gmi;
    const itemRegex1 = /RunObjectType=(\w+)/gmi;
    const itemRegex2 = /RunObjectID=(\d+)/gmi;
    const itemRegex3 = /DepartmentCategory=(\w+)/gmi;
    let menuLines = menuTxtFile.split('\r\n');
    menuNodeList = [];
    for (let index = 0; index < menuLines.length; index++) {
        let match3 = itemRegex3.exec(menuLines[index]);
        if (match3) {
            menuNode.UsageCategory = match3[1];
            menuNodeList.push({
                Type: menuNode.Type,
                Id: menuNode.Id,
                UsageCategory: menuNode.UsageCategory
            });
        }
        let match2 = itemRegex2.exec(menuLines[index]);
        if (match2) {
            menuNode.Id = match2[1];
        }
        let match1 = itemRegex1.exec(menuLines[index]);
        if (match1) {
            menuNode.Type = match1[1];
        }
    }
    console.log(menuNodeList);
}