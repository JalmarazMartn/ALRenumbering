const vscode = require('vscode');
const FieldDeclarationRegExp = /(\s*field\s*\(.*;\s*)(.*\))/i;
//export module function fixfielddeclaration
module.exports = {
    FixFieldDeclarationDocument:
        async function (ALDocument) {
            FixFieldDeclarationDocument(ALDocument);
        },
    FieldDeclarationAllWorkspace:
        function () {
            FieldDeclarationAllWorkspace();
        }
};
async function FieldDeclarationAllWorkspace() {
    const Confirm = await vscode.window.showInformationMessage('Do you want to add .rec declaration the page files in the workspace?', 'Yes', 'No');
    if (Confirm === 'No') { return };
    const WSDocs = await vscode.workspace.findFiles('**/*.{al}');
    WSDocs.forEach(ALDocumentURI => {
        vscode.workspace.openTextDocument(ALDocumentURI).then(
            ALDocument => {
                FixFieldDeclarationDocument(ALDocument);
            });
    });
}
async function FixFieldDeclarationDocument(ALDocument) {
    const AddAplicationArea = require('./AddApplicationArea.js');
    if (!AddAplicationArea.IsObjectPage(ALDocument)) {
        return;
    }
    for (var i = 0; i < ALDocument.lineCount; i++) {
        if (ALDocument.lineAt(i).text.match(FieldDeclarationRegExp)) {
            //move this code to a function
            await ProccessLine(ALDocument, i);
        }
    }
}
async function ProccessLine(ALDocument, LineNumber) {
    const lineText = ALDocument.lineAt(LineNumber).text;
    var WholeMatch = lineText.match(FieldDeclarationRegExp);
    if (!WholeMatch) {
        return;
    }
    //if find /;rec./i then return
    if (lineText.match(/\;\s*rec./i)) {
        return;
    }
    //get all match text replacing second group with rec. + second group
    var NewValue = WholeMatch[1] + 'Rec.' + WholeMatch[2];
    const WSEdit = new vscode.WorkspaceEdit;
    const PositionOpen = new vscode.Position(LineNumber, lineText.indexOf(WholeMatch[0]));
    const PositionClose = new vscode.Position(LineNumber, lineText.indexOf(WholeMatch[0]) + WholeMatch[0].length);
    WSEdit.replace(ALDocument.uri, new vscode.Range(PositionOpen, PositionClose ), NewValue);
    await vscode.workspace.applyEdit(WSEdit);
}