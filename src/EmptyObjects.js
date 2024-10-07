//Enums
//Formato
const vscode = require('vscode');
const Library = require('./Library.js');
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
	ConvertObjectTextToCAL: function (ObjectText) { return ConvertObjectTextToCAL(ObjectText) }
}
async function CreateTableObjectsWithoutLogicGeneric() {
	const fromObjectNumber = await getFromObjectNumer();
	if (fromObjectNumber == 0) { return; }
	let emptyObjectNumber = fromObjectNumber;
	let codeunitDataT = '';
	const FolderName = await SelectFolder();
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	let saveToProcedure = 'local procedure SaveTables()' + carriage + 'begin' + carriage;
	let backToProcedure = 'local procedure BackToTables()' + carriage + 'begin' + carriage;
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index])
		const DeclarationLineText = Library.GetDeclarationLineText(ALDocument);
		if (IsTableObject(DeclarationLineText)) {
			let ALDocExtended = {};
			await WriteFileWithOutCode(ALDocument, FolderName[0].fsPath, emptyObjectNumber);
			if (Library.IsTableExtensionObject(Library.GetDeclarationLineText(ALDocument))) {
				ALDocExtended = await Library.getALDocExtended(ALDocument);
			}
			const transferProcElements = getTransferProcedure(ALDocument, emptyObjectNumber, ALDocExtended);//aqui
			codeunitDataT = codeunitDataT + transferProcElements[0] + transferProcElements[2];
			saveToProcedure = saveToProcedure + transferProcElements[1] + ';' + carriage;
			backToProcedure = backToProcedure + transferProcElements[3] + ';' + carriage;
			emptyObjectNumber = emptyObjectNumber + 1;
		}
	}
	saveToProcedure = saveToProcedure + 'end;' + carriage;
	backToProcedure = backToProcedure + 'end;' + carriage;
	codeunitDataT = saveToProcedure + backToProcedure + codeunitDataT;
	createCodeunitFile(codeunitDataT, fromObjectNumber, FolderName[0].fsPath);
	vscode.window.showInformationMessage('Review new transfer codeunit and empty tables from table extensions.');
}

async function CreateTableObjectsWithoutLogicGenericCSIDE() {
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	let FinalText = '';
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index])
		const DeclarationLineText = ALDocument.lineAt(0).text;
		if (IsTableObject(DeclarationLineText)) {
			let ObjectText = GetAllEmptyObjectContent(ALDocument, {});
			ObjectText = ConvertObjectTextToCAL(ObjectText);
			if (Library.IsTableExtensionObject(DeclarationLineText)) {
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
	return Library.IsTableExtensionObject(DeclarationLineText);
}
async function WriteFileWithOutCode(ALDocument, FolderName = '', emptyObjectNumber = 0) {
	const ALDocExtended = await Library.getALDocExtended(ALDocument);
	let FinalText = GetAllEmptyObjectContent(ALDocument, emptyObjectNumber, ALDocExtended);
	if (FinalText == '') {
		return;
	}
	let OnlyName = ALDocument.uri.path.replace(/^.*[\\\/]/, '');
	const fileUri = vscode.Uri.file(FolderName + '/' + 'Empty.' + OnlyName);
	await vscode.workspace.fs.writeFile(fileUri, Buffer.from(FinalText));
}
function GetAllEmptyObjectContent(ALDocument, emptyObjectNumber, ALDocExtended) {
	let Library = require('./Library');
	let FinalText = '';
	let fieldsText = Library.GetFieldsText(ALDocument);
	if (ALDocExtended) {
		fieldsText = Library.GetFieldsText(ALDocExtended) + carriage + fieldsText;
	}
	let FinalFieldsText = GetFinalFieldsText(fieldsText);	
	FinalText = FinalText + convertDeclarationLineText(Library.GetDeclarationLineText(ALDocument), emptyObjectNumber) + carriage;
	FinalText = FinalText + '{' + carriage;
	FinalText = FinalText + 'DataClassification = CustomerContent;' + carriage;
	FinalText = FinalText + FinalFieldsText + carriage;
	if (FinalFieldsText == '') {
		return '';
	}
	if (!Library.IsTableExtensionObject(Library.GetDeclarationLineText(ALDocument))) {
		FinalText = FinalText + GetFinalKeysText(ALDocument) + carriage;
	}
	else {
		if (ALDocExtended) {
			FinalText = FinalText + GetFinalKeysText(ALDocExtended) + carriage;
		}
	}
	FinalText = FinalText + '}';
	return FinalText;
}
function GetFinalFieldsText(fieldsText = '') {
	let FinalText = fieldsText;
	if (FinalText != '') {
		FinalText = 'fields' + carriage + '{' + carriage + FinalText + carriage + '}';
	}
	return FinalText;
}
function GetFinalKeysText(ALDocument) {
	const primaryKeyText = Library.GetPrimaryKeyText(ALDocument);
	if (primaryKeyText !== '') {
		return 'keys' + carriage + '{' + carriage +
			primaryKeyText + carriage + '{}' +
			carriage + '}';

	}
	return '';
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
async function getFromObjectNumer() {
	const firstInValue = await vscode.window.showInputBox({ "valueSelection": [50000, 99999], "prompt": "Type first object ID (number of 5 digits sugested)", "value": "99010" });
	try {
		return parseInt(firstInValue);
	} catch (error) {
		vscode.window.showErrorMessage(error);
	}
	return 0;
}
function convertDeclarationLineText(OldDeclarationLineText = '', newObjectNumber) {
	const objectDeclaration = Library.GetCurrentObjectFromLineText(OldDeclarationLineText);
	const newObjectName = getNewObjectName(objectDeclaration.ObjectName, newObjectNumber);
	const newDeclarationText = 'table ' + newObjectNumber.toString() + ' ' + newObjectName;

	return newDeclarationText;
}
function getNewObjectName(ObjectName, newObjectNumber) {

	let ObjectNameWithoutQuotes = ObjectName.replace(/"/g, '');
	const newObjectName = newObjectNumber.toString() + ' ' + ObjectNameWithoutQuotes;
	return '"' + newObjectName.substring(0, 29) + '"';
}

function getTransferProcedure(ALDocument, newObjectNumber, ALDocExtended) {
	const fromObjDeclaration = Library.GetCurrentObjectFromDocument(ALDocument);
	const fromObjectName = fromObjDeclaration.ObjectName;
	const toObjectName = getNewObjectName(fromObjectName, newObjectNumber);
	const fromObjectCompact = fromObjectName.replace(/\s|"|\./g, '');
	const SaveProcedureName = 'Save' + fromObjectCompact + '()';
	const BackToProcedureName = 'BackTo' + fromObjectCompact + '()';
	let SaveProcessText = getBeginDataTProcedure(SaveProcedureName, fromObjectName, toObjectName);
	let BackToProcessText = getBeginDataTProcedure(BackToProcedureName, toObjectName, fromObjectName);

	let FieldAddValueText = '';
	const realFieldList = Library.getRealFieldList(ALDocument);
	for (let index = 1; index < realFieldList.length - 1; index++) {
			const fieldName = realFieldList[index];
			FieldAddValueText = FieldAddValueText + 'DataTransfer.AddFieldValue(FromTable.fieldno(' + fieldName + '), ToTable.fieldno(' + fieldName + '));' + carriage;		
	}
	let primaryKeySave = '';
	let primaryKeyBack = '';
	const isTableExtensionObject = Library.IsTableExtensionObject(Library.GetDeclarationLineText(ALDocument));
	if (isTableExtensionObject) {
		const primaryKeyFields = Library.getPrimaryKeyFields(ALDocExtended);
		for (let index = 0; index < primaryKeyFields.length; index++) {
			primaryKeySave = primaryKeySave + 'DataTransfer.AddFieldValue(FromTable.fieldno(' + primaryKeyFields[index] + '), ToTable.fieldno(' + primaryKeyFields[index] + '));' + carriage;
			primaryKeyBack = primaryKeyBack + 'DataTransfer.AddJoin(FromTable.fieldno(' + primaryKeyFields[index] + '), ToTable.fieldno(' + primaryKeyFields[index] + '));' + carriage;
		}
	}
	const endTableProcess = 'DataTransfer.CopyRows();' + carriage + 'end;' + carriage;
	const endTableExtProcess = 'DataTransfer.CopyFields();' + carriage + 'end;' + carriage;
	SaveProcessText = SaveProcessText + FieldAddValueText + primaryKeySave;
	BackToProcessText = BackToProcessText + FieldAddValueText + primaryKeyBack;
	SaveProcessText = SaveProcessText + endTableProcess;
	if (isTableExtensionObject) {
		BackToProcessText = BackToProcessText + endTableExtProcess;
	}
	else {
		BackToProcessText = BackToProcessText + endTableProcess;
	}
	return [SaveProcessText, SaveProcedureName, BackToProcessText, BackToProcedureName];

	function getBeginDataTProcedure(procedureName, fromObjectName, toObjectName) {
		let beginProcessText = 'local procedure ' + procedureName + carriage;
		beginProcessText = beginProcessText + 'var' + carriage;
		beginProcessText = beginProcessText + 'DataTransfer: DataTransfer;' + carriage;
		beginProcessText = beginProcessText + 'FromTable: Record ' + fromObjectName + ';' + carriage;
		beginProcessText = beginProcessText + 'ToTable: Record ' + toObjectName + ';' + carriage;
		beginProcessText = beginProcessText + 'begin' + carriage;
		beginProcessText = beginProcessText + 'DataTransfer.SetTables(FromTable.RecordId.TableNo, ToTable.RecordId.TableNo);' + carriage;
		return beginProcessText;
	}
}
async function createCodeunitFile(ProcedureText = '', objectID = 0, FolderName = '') {
	let finalText = 'codeunit ' + objectID.toString() + '"Save Data To TempTables"' + carriage;
	finalText = finalText + '{ ' + carriage;
	finalText = finalText + 'Subtype = Install;' + carriage;
	finalText = finalText + 'trigger OnInstallAppPerCompany()' + carriage;
	finalText = finalText + 'begin' + carriage;
	finalText = finalText + '//SaveTables();' + carriage;
	finalText = finalText + '//BackToTables();' + carriage;
	finalText = finalText + 'end;' + carriage;
	finalText = finalText + ProcedureText + carriage;
	finalText = finalText + '}';
	const fileUri = vscode.Uri.file(FolderName + '/' + 'SaveDataToTempTables.codeunit.al');
	await vscode.workspace.fs.writeFile(fileUri, Buffer.from(finalText));
	let doc = await vscode.workspace.openTextDocument(fileUri);
	await vscode.window.showTextDocument(doc);
}