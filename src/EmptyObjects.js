//Enums
//Formato
const vscode = require('vscode');
const tableExtensionDec = 'TABLEEXTENSION';
const tableDec = 'TABLE';
const carriage = '\r\n';
const ObjectCaption = 'OBJECT';
module.exports = {
	CreateTableObjectsWithoutLogic: function () {
		CreateTableObjectsWithoutLogicGeneric();
	},
	CreateTableObjectsWithoutLogicCAL: function () {
		CreateTableObjectsWithoutLogicGenericCSIDE();
	},
	IsTableExtensionObject: function (DeclarationLineText = '') { return IsTableExtensionObject(DeclarationLineText) },
	GetFieldsText: function (ALDocument) { return GetFieldsText(ALDocument) },
	ConvertObjectTextToCAL: function (ObjectText) { return ConvertObjectTextToCAL(ObjectText) }
}
async function CreateTableObjectsWithoutLogicGeneric() {
	const fromObjectNumber = await getFromObjectNumer();
	if (fromObjectNumber == 0)
		{return;}
	let emptyObjectNumber = fromObjectNumber;
	let codeunitDataT = '';
	const FolderName = await SelectFolder();	
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index])
		const Library = require('./Library');
		const DeclarationLineText = Library.GetDeclarationLineText(ALDocument);
		if (IsTableObject(DeclarationLineText)) {			
			WriteFileWithOutCode(ALDocument, FolderName[0].fsPath,emptyObjectNumber);
			codeunitDataT = codeunitDataT + getTransferProcedure(ALDocument,emptyObjectNumber);
			emptyObjectNumber = emptyObjectNumber + 1;			
		}
	}
	createCodeunitFile(codeunitDataT,fromObjectNumber,FolderName[0].fsPath);
}

async function CreateTableObjectsWithoutLogicGenericCSIDE() {
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	let FinalText = '';
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index])
		const DeclarationLineText = ALDocument.lineAt(0).text;
		if (IsTableObject(DeclarationLineText)) {
			let ObjectText = GetAllEmptyObjectContent(ALDocument);
			ObjectText = ConvertObjectTextToCAL(ObjectText);
			if (IsTableExtensionObject(DeclarationLineText)) {
				ObjectText = '';
			}
			if (ObjectText !== '') {
				ObjectText = carriage + ObjectText;
			}
			FinalText = FinalText + ObjectText;
		}
	}
	await vscode.workspace.fs.writeFile(await SelectTextTargetFile(), Buffer.from(FinalText));
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
async function SelectTextTargetFile() {
	const options = {
		canSelectMany: false,
		openLabel: 'Select target new txt CSIDE file',
		canSelectFiles: true,
		canSelectFolders: false,
		filters: { 'Txt file': ['txt'] }
	};
	return await vscode.window.showSaveDialog(options);
}

function IsTableObject(DeclarationLineText = '') {
	let Library = require('./Library')
	let CurrentObject = Library.GetCurrentObjectFromLineText(DeclarationLineText);
	if (!CurrentObject) {
		return false;
	}
	if (CurrentObject.ObjectType.toUpperCase() == tableDec) {
		return true;
	}
	return IsTableExtensionObject(DeclarationLineText);
}
function IsTableExtensionObject(DeclarationLineText = '') {
	let Library = require('./Library')
	let CurrentObject = Library.GetCurrentObjectFromLineText(DeclarationLineText);
	if (!CurrentObject) {
		return false;
	}
	if (CurrentObject.ObjectType.toUpperCase() == tableExtensionDec) {
		return true;
	}
	return false;
}
async function WriteFileWithOutCode(ALDocument, FolderName = '',emptyObjectNumber=0) {
	let FinalText = GetAllEmptyObjectContent(ALDocument,emptyObjectNumber);
	if (FinalText == '') {
		return;
	}
	let OnlyName = ALDocument.uri.path.replace(/^.*[\\\/]/, '');
	const fileUri = vscode.Uri.file(FolderName + '/' + 'Empty.' + OnlyName);
	await vscode.workspace.fs.writeFile(fileUri, Buffer.from(FinalText));
}
function GetAllEmptyObjectContent(ALDocument,emptyObjectNumber) {
	let FinalText = '';
	let FinalFieldsText = GetFinalFieldsText(ALDocument);
	let Library = require('./Library');
	FinalText = FinalText + convertDeclarationLineText(Library.GetDeclarationLineText(ALDocument),emptyObjectNumber) + carriage;
	FinalText = FinalText + '{' + carriage;
	FinalText = FinalText + 'DataClassification = CustomerContent;' + carriage;
	FinalText = FinalText + FinalFieldsText + carriage;
	if (FinalFieldsText == '') {
		return '';
	}
	if (!IsTableExtensionObject(Library.GetDeclarationLineText(ALDocument))) {
		FinalText = FinalText + GetFinalKeysText(ALDocument) + carriage;
	}
	FinalText = FinalText + '}';
	return FinalText;
}
function GetFinalFieldsText(ALDocument) {
	let FinalText = GetFieldsText(ALDocument);
	if (FinalText != '') {
		FinalText = 'fields' + carriage + '{' + carriage + FinalText + carriage + '}';
	}
	return FinalText;
}
function GetFieldsText(ALDocument) {
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
				if (GetIsFlowField(CurrElement.ElementText)) {
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
	return FinalText;
}
function GetFinalKeysText(ALDocument) {
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
	var ElementMatch = lineText.match(/\s*field\s*\(\s*\d+\s*;.*;.*\)/i);
	if (ElementMatch) {
		return ElementMatch[0].toString();
	}
}
function MatchWithKeyDeclaration(lineText = '') {
	var ElementMatch = lineText.match(/\s+key\s*\(.*\)/gi);
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
function GetIsFlowField(ElementText = '') {
	return (ElementText.search(/FieldClass\s*=\s*(FlowField|FlowFilter)\s*;/i) >= 0)
}
function ConvertObjectTextToCAL(ObjectText = '') {
	let ObjectTextCAL = ObjectText.replace(/field\((.*)\;(.*)\;(.*?)\)\s*\{\s*(.*)\s*\}/gmi, ConvertToCALFields);
	ObjectTextCAL = ObjectTextCAL.replace(/key\(.*?;(.*?)\)/gm, ConvertToCALKey);
	ObjectTextCAL = ObjectTextCAL.replace(/\{\s*\}/gm, '');
	ObjectTextCAL = ObjectTextCAL.replace(/"/gm, '');
	ObjectTextCAL = ObjectTextCAL.replace(/fields\s*{/gmi, ConvertToUppercase);
	ObjectTextCAL = ObjectTextCAL.replace(/keys\s*{/gmi, ConvertToUppercase);
	ObjectTextCAL = ObjectTextCAL.replace(/OptionMembers/gmi, ConvertToOptionCAL);
	return (ObjectCaption + ' ' + ObjectTextCAL);
}
function ConvertToCALFields(fullMatch, FieldNumber, FieldName, FieldType, FieldProperty) {
	let CALFields = FieldNumber + '; ;' + FieldName + '; ' + FieldType.replace(/[\[|\]]/gm, '');
	if (FieldProperty != '') {
		CALFields = CALFields + ';' + FieldProperty.replace(';', '');
	}
	CALFields = '{' + CALFields + '}';
	return CALFields;
}
function ConvertToCALKey(fullMatch, KeyFields) {
	let CALKey = ' ;' + KeyFields;
	CALKey = '{' + CALKey + '}';
	return CALKey;
}
function ConvertToOptionCAL(fullMatch) {
	return 'OptionString';
}
function ConvertToUppercase(fullMatch) {
	return fullMatch.toUpperCase();
}
async function getFromObjectNumer()
{
	const firstInValue = await vscode.window.showInputBox({"valueSelection":[50000,99999],"prompt":"Type first object ID (number of 5 digits sugested)","value":"99010"});
	try {
		return parseInt(firstInValue);
	} catch (error) {
		vscode.window.showErrorMessage(error);
	}
}
function convertDeclarationLineText(OldDeclarationLineText = '',newObjectNumber)
{
	const Library = require('./Library.js');
	const objectDeclaration = Library.GetCurrentObjectFromLineText(OldDeclarationLineText);
	const newObjectName = getNewObjectName(objectDeclaration.ObjectName, newObjectNumber);
	const newDeclarationText =  'table ' + newObjectNumber.toString() + ' ' + newObjectName;
	
	return newDeclarationText;
}
function getNewObjectName(ObjectName, newObjectNumber) {
	
	let ObjectNameWithoutQuotes = ObjectName.replace(/"/g, '');
	const newObjectName = newObjectNumber.toString() + ' ' + ObjectNameWithoutQuotes;
	return '"' + newObjectName.substring(0,29) + '"';
}

function getTransferProcedure(ALDocument,newObjectNumber)
{
	const Library = require('./Library.js');
	const fromObjDeclaration = Library.GetCurrentObjectFromDocument(ALDocument);
	const fromObjectName = fromObjDeclaration.ObjectName;	
	const toObjectName = getNewObjectName(fromObjectName,newObjectNumber);
	const procedureName = 'Save' + fromObjectName.replace(/\s|"/g,'') + '()';
	let processText = 'local procedure ' + procedureName + carriage;
	processText = processText +  'var' + carriage;
	processText = processText +  'DataTransfer: DataTransfer;' + carriage;
	processText = processText +  'FromTable: Record ' + fromObjectName + ';' + carriage;
	processText = processText +  'ToTable: Record ' + toObjectName + ';' + carriage;
	processText = processText +  'begin' + carriage;
	processText = processText + 'DataTransfer.SetTables(FromTable.RecordId.TableNo, ToTable.RecordId.TableNo);' + carriage;
	for (let index = 1; index < ALDocument.lineCount - 1; index++) {
		if (MatchWithFieldDeclaration(ALDocument.lineAt(index).text)) {
			let fieldName = ALDocument.lineAt(index).text;
			fieldName = fieldName.replace(/\s*field\s*\(\s*\d+\s*;\s*/i,'');
			fieldName = fieldName.replace(/\s*;.*/i,'');
			processText = processText + 'DataTransfer.AddFieldValue(FromTable.fieldno(' + fieldName + '), ToTable.fieldno(' + fieldName + '));' + carriage;
		}
	}
	processText = processText + 'DataTransfer.CopyRows();' + carriage;
	processText = processText + 'end;' + carriage;
	return processText;
}
async function createCodeunitFile(ProcedureText='',objectID=0,FolderName='')
{
	let finalText = 'codeunit ' + objectID.toString() + '"Save Data To TempTables"' + carriage;
	finalText = finalText + '{ '+ carriage;
	finalText = finalText + 'Subtype = Install;'+ carriage;
	finalText = finalText + 'trigger OnInstallAppPerCompany()' + carriage;
	finalText = finalText + 'begin' + carriage;
	finalText = finalText + 'end;' + carriage;
	finalText = finalText + ProcedureText + carriage;
	finalText = finalText + '}';
	const fileUri = vscode.Uri.file(FolderName + '/' + 'SaveDataToTempTables.codeunit.al');
	await vscode.workspace.fs.writeFile(fileUri, Buffer.from(finalText));
}