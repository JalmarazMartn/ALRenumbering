//Enums
//Formato

const vscode = require('vscode');
const tableExtensionDec = 'TABLEEXTENSION';
const tableDec = 'TABLE';
const carriage = '\r\n';
module.exports = {
	CreateTableObjectsWithoutLogic: function () {
		CreateTableObjectsWithoutLogic();
	}
}

async function CreateTableObjectsWithoutLogic() {
	const FolderName = await SelectFolder();
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index])
		const FirstLine = ALDocument.lineAt(0).text;
		if (IsTableObject(FirstLine)) {
			WriteFileWithOutCode(ALDocument, FolderName[0].fsPath);
		}
	}
}
async function SelectFolder() {
	const options = {
		canSelectMany: false,
		openLabel: 'Select target folder',
		canSelectFiles: false,
		canSelectFolders: true
	};
	return await vscode.window.showOpenDialog(options);
}
function IsTableObject(FirstLine = '') {
	let Library = require('./Library')
	let CurrentObject = Library.GetCurrentObject(FirstLine);
	if (!CurrentObject) {
		return false;
	}
	if (CurrentObject.ObjectType.toUpperCase() == tableDec) {
		return true;
	}
	return IsTableExtensionObject(FirstLine);
}
function IsTableExtensionObject(FirstLine = '') {
	let Library = require('./Library')
	let CurrentObject = Library.GetCurrentObject(FirstLine);
	if (!CurrentObject) {
		return false;
	}
	if (CurrentObject.ObjectType.toUpperCase() == tableExtensionDec) {
		return true;
	}
	return false;
}
async function WriteFileWithOutCode(ALDocument, FolderName = '') {
	let FinalText = '';
	FinalText = FinalText + ALDocument.lineAt(0).text + carriage;
	FinalText = FinalText + '{' + carriage;
	FinalText = FinalText + GetFinalFieldsText(ALDocument) + carriage;
	if (!IsTableExtensionObject(ALDocument.lineAt(0).text))
	{
		FinalText = FinalText + GetFinalKeysText(ALDocument) + carriage;
	}
	FinalText = FinalText + '}';
	const OnlyName = ALDocument.uri.path.replace(/^.*[\\\/]/, '')
	const fileUri = vscode.Uri.file(FolderName + '/' + 'Empty.' + OnlyName);
	await vscode.workspace.fs.writeFile(fileUri, Buffer.from(FinalText));	
}
function GetFinalFieldsText(ALDocument)
{
	let FinalText = '';
	let CurrElement = { ElementText: "", ElementOpenLine: 0 };
	for (let index = 1; index < ALDocument.lineCount - 1; index++) {
		if (MatchWithFieldDeclaration(ALDocument.lineAt(index).text)) {
			CurrElement.ElementText = ALDocument.lineAt(index).text;
			CurrElement.ElementOpenLine = index;
		}
		else {
			if (CurrElement.ElementText !== '') {
				CurrElement.ElementText = CurrElement.ElementText + ALDocument.lineAt(index).text;
				if (GetIsFlowField(CurrElement.ElementText))
				{
					CurrElement.ElementOpenLine = 0;
					CurrElement.ElementText = '';
				}
			}
		}
		let WriteElement = (MatchWithClose(ALDocument.lineAt(index).text)) && 
						(CurrElement.ElementText != '');
		if (WriteElement) {
				for (let ElemNumber = CurrElement.ElementOpenLine; ElemNumber <= index; ElemNumber++) {
					if (GetContentToWrite(ALDocument.lineAt(ElemNumber).text))
						FinalText = FinalText + (GetContentToWrite(ALDocument.lineAt(ElemNumber).text)) + carriage;
				}
			FinalText = FinalText + '}' + carriage;
			CurrElement.ElementText = '';
			CurrElement.ElementOpenLine = 0;
		}
	}
	if (FinalText != '')
	{
		FinalText = 'fields' + carriage + '{' + carriage + FinalText + carriage + '}';
	}
	return FinalText;
}
function GetFinalKeysText(ALDocument)
{
	for (let index = 1; index < ALDocument.lineCount - 1; index++) {
		if (MatchWithKeyDeclaration(ALDocument.lineAt(index).text)) {
			return 'keys' + carriage + '{' + carriage +
			MatchWithKeyDeclaration(ALDocument.lineAt(index).text) + carriage + '{}' +
			carriage + '}';
			
		}
}
	return '';
}
function MatchWithFieldDeclaration(lineText = '') {
	var ElementMatch = lineText.match(/\s*field\s*\(.*;.*;.*\)/i);
	if (ElementMatch) {
		return ElementMatch[0].toString();
	}
}
function MatchWithKeyDeclaration(lineText = '') {
	var ElementMatch = lineText.match(/\s*key\s*\(.*\)/gi);
	if (ElementMatch) {
		return ElementMatch[0].toString();
	}
}
function MatchWithOptionMembers(lineText = '') {
	var ElementMatch = lineText.match(/\s*OptionMembers =.*;/gi);
	if (ElementMatch) {
		return ElementMatch[0].toString();
	}
}
function MatchWithClose(lineText = '') {
	return (lineText.indexOf('}') >= 0)
}
function GetContentToWrite(lineText = '') {
	if (MatchWithFieldDeclaration(lineText)) {
		return MatchWithFieldDeclaration(lineText) + carriage + '{';
	}
	if (MatchWithKeyDeclaration(lineText)) {
		return MatchWithKeyDeclaration(lineText) + carriage + '{}' + carriage + '}';
	}
	if (MatchWithOptionMembers(lineText)) {
		return MatchWithOptionMembers(lineText) + carriage;
	}
}
function GetIsFlowField(ElementText='')
{
	return (ElementText.search(/FieldClass\s*=\s*(FlowField|FlowFilter)\s*;/i) >= 0)
}