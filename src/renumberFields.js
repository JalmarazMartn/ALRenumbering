
const vscode = require('vscode');
const Library = require('./Library');
const carriage = '\r\n';
const sep = ';';
//exports CreateCSVTableExtFieldsFile
module.exports = {
    CreateCSVTableExtFieldsFile: function () {
        CreateCSVTableExtFieldsFile();
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
    let tableExtDeclaration = DeclarationLineText.match(/tableextension\s*(\d+).*extends\s*(.*)/i);
	if (tableExtDeclaration === null) {
		return '';
	}	
	for (let index = 1; index < ALDocument.lineCount - 1; index++) {        
		let matchField = ALDocument.lineAt(index).text.match(/field\((.*);(.*);/i);
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
