
const vscode = require('vscode');
const Library = require('./Library');
const carriage = '\r\n';
const sep = ';';
//declare all the regexps in module scope
const regexpTableExtension = /tableextension\s*(\d+).*extends\s*(.*)/i;
const regexpField = /field\((.*);(.*);/i;
module.exports = {
    CreateCSVTableExtFieldsFile: function () {
        CreateCSVTableExtFieldsFile();
    },
	ProcessRenumFile: function () {
		ProcessRenumFile();
	}
}

async function CreateCSVTableExtFieldsFile() {
	const sep = ';';
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');    
	var FinalText = 'TablexExtNumber' + sep + 'OriginalTable'+ sep +'FieldId' + sep + 'FieldName' + sep + 'NewFieldId' + carriage;
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index]);
        FinalText = FinalText + await GetFieldsTextFromTableExtension(ALDocument);
	}
    let fileUri = await vscode.window.showSaveDialog(optionsCSVFile('Save'));
	await vscode.workspace.fs.writeFile(fileUri, Buffer.from(FinalText));
	vscode.window.showInformationMessage('CSV file created in ' + fileUri.path);
}
async function GetFieldsTextFromTableExtension(ALDocument) {
    const DeclarationLineText = Library.GetDeclarationLineText(ALDocument);
    if ((DeclarationLineText.search(/tableextension/i) < 0)) {
        return '';
    }
    //
	let fieldsText = '';
    //get in DeclarationLineText line the number expresion: DeclarationLineText is as "tableextension 50000 miexte"
    let tableExtDeclaration = DeclarationLineText.match(regexpTableExtension);
	if (tableExtDeclaration === null) {
		return '';
	}	
	for (let index = 1; index < ALDocument.lineCount - 1; index++) {        
		let matchField = ALDocument.lineAt(index).text.match(regexpField);
		if (matchField) {			
            fieldsText +=  tableExtDeclaration[1] + sep + tableExtDeclaration[2] + sep +matchField[1] + sep + matchField[2] + sep + carriage;
		}
	}
    return fieldsText;
}
function optionsCSVFile(newOpenLabel = '') {
	const options = {
		canSelectMany: false,
		openLabel: newOpenLabel,
		title: 'Select CSV File',
		filters: {
			'csv': ['csv'],
		}
	};
	return options;
}

async function ProcessRenumFile() {
	let RenumberJSON = [];
	let fileUri = await vscode.window.showOpenDialog(optionsCSVFile('Open'));
	var fs = require('fs'),
		readline = require('readline');

	var rd = readline.createInterface({
		input: fs.createReadStream(fileUri[0].fsPath)
	});
	rd.on('line', function (line) {
		const Elements = line.split(sep);
		RenumberJSON.push(
			{
				"tableextNumber": Elements[0],
				"FieldID": Elements[2],
				"NewFieldID": Elements[4]
			});
	});
	rd.on('close',function () {			
			Renumber(RenumberJSON);	
	}
	);
}
async function Renumber(RenumberJSON) {
		const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
		for (let index = 0; index < AllDocs.length; index++) {
			var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index]);
			await RenumberFields(ALDocument, RenumberJSON);
		}
		vscode.window.showInformationMessage('Renumbering finished');	
}
async function RenumberFields(ALDocument, RenumberJSON) {
    const DeclarationLineText = Library.GetDeclarationLineText(ALDocument);
	let tableExtDeclaration = DeclarationLineText.match(regexpTableExtension);
    if ((DeclarationLineText.search(/tableextension/i) < 0)) {
        return;
    }

	for (let index = 1; index < ALDocument.lineCount ; index++) {
		const line = ALDocument.lineAt(index).text;
		if (line.search(regexpField) >= 0) {
			for (let indexJSON = 0; indexJSON < RenumberJSON.length; indexJSON++) {
				if ((line.match(regexpField)[1] === RenumberJSON[indexJSON].FieldID) &&
				(tableExtDeclaration[1] === RenumberJSON[indexJSON].tableextNumber)) {
					await RenumberField(ALDocument, RenumberJSON[indexJSON].FieldID, RenumberJSON[indexJSON].NewFieldID,index);
				}
			}
		}
	}
}
async function RenumberField(ALDocument, FieldID, NewFieldID, index) {
	if (NewFieldID === '') {
		return;
	}
	if (FieldID === NewFieldID) {
		return;
	}
	const line = ALDocument.lineAt(index).text;
	const newLine = line.replace(FieldID, NewFieldID);
	const WSEdit = new vscode.WorkspaceEdit;
	const PositionOpen = new vscode.Position(index, 0);
	const PostionEnd = new vscode.Position(index, line.length);
	await WSEdit.replace(await ALDocument.uri, new vscode.Range(PositionOpen, PostionEnd),
	newLine);
	await vscode.workspace.applyEdit(WSEdit);
}