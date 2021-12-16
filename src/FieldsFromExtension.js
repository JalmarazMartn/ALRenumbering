//Enums
//Formato

const vscode = require('vscode');
const carriage = '\r\n';
module.exports = {
	InsertExtensionFieldsInCSIDEFile: function () {
		InsertExtensionFieldsInCSIDEFile();
	}
}
async function InsertExtensionFieldsInCSIDEFile() {
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	let fieldsToAdd = [];
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index])
		writeFieldObject(ALDocument, fieldsToAdd);
	}
	if (fieldsToAdd.length == 0) {
		return;
	}
	ProcessOldCSIDEFile(fieldsToAdd);
}
async function ProcessOldCSIDEFile(fieldsToAdd) {
	let fileUri = await vscode.window.showOpenDialog(optionsTextOpen('Select old CSIDE file'));
	let fieldText = '';
	let lastLineRetrieved = '';
	let TargetFileText = '';
	var fs = require('fs'),
		readline = require('readline');
	var rd = readline.createInterface({		
		input: fs.createReadStream(fileUri[0].fsPath)
	});
	rd.on('line', function (line) {
		const tableName = getTableNameFromDeclaration(line);
		TargetFileText = TargetFileText + carriage + line;
		if (tableName !== '') {
			fieldText = GetExtendedFieldsFromTableName(tableName,fieldsToAdd);
		}
		const writeFields = (lastLineRetrieved.search(/FIELDS/mi) >= 0) && (line.search(/\{/) >= 0) && (fieldText !== '');
		if (writeFields) {
			TargetFileText = TargetFileText + carriage + fieldText;
		}
		lastLineRetrieved = line;		
	});
	rd.on('close', function () {
		vscode.window.showSaveDialog(optionsTextOpen('Select TARGET CSIDE file')).then(newFileUri => {
			vscode.workspace.fs.writeFile(newFileUri, Buffer.from(TargetFileText));
		});
	});
}
function optionsTextOpen(newOpenLabel = '') {
	const options = {
		canSelectMany: false,
		openLabel: newOpenLabel,
		title: 'Select txt File',
		filters: {
			'txt': ['txt'],
		}
	};
	return options;
}

function writeFieldObject(ALDocument, fieldsToAdd) {
	let Library = require('./Library');
	const DeclarationLineText = Library.GetDeclarationLineText(ALDocument);
	const EmptyObjects = require('./EmptyObjects.js')
	if (!EmptyObjects.IsTableExtensionObject(DeclarationLineText)) { return }
	let fieldText = EmptyObjects.GetFieldsText(ALDocument);
	if (fieldText == '') {
		return;
	}
	fieldText = EmptyObjects.ConvertObjectTextToCAL(fieldText).replace(/OBJECT/,' ');
	fieldsToAdd.push(
		{
			"tableName": getTableNameFromextensions(DeclarationLineText),
			"fieldDefinition": fieldText
		});

}

function getTableNameFromextensions(DeclarationLineText = '') {
	const matchTableName = DeclarationLineText.match(/tableextension.+?extends\s*(.*)/mi);
	return matchTableName[1].toString().replace(/"/g, '');
}
function getTableNameFromDeclaration(DeclarationLineText = '') {
	const matchTableName = DeclarationLineText.match(/OBJECT Table \d* \s*(.*)\s*/mi);
	if (!matchTableName) {
		return '';
	}
	return matchTableName[1].toString();
}
function GetExtendedFieldsFromTableName(CALtableName = '', fieldsToAdd) {
	const fieldToAdd = fieldsToAdd.find(Obj => Obj.tableName == CALtableName);
	if (!fieldToAdd) { return '' }
	return fieldToAdd.fieldDefinition;
}