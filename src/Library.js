const vscode = require('vscode');
const carriage = '\r\n';
const declarationRegExp = /\s*([a-zA-Z]+)\s*([0-9]+)\s+(.*)/i;
const OutputChannel = vscode.window.createOutputChannel(`Output Channel`);
const tableExtensionDec = 'TABLEEXTENSION';
module.exports = {
	ProcessWorkSpace: function (RenumberJSON = []) {
		ProcessWorkSpace(RenumberJSON);
	},
	GetWorkspaceObjects: function (
	) {
		return GetWorkspaceObjects();
	},
	RenumberObjects: function () {
		ProcessRenumFile(ProcessWorkSpace);
	},
	CreateNewCSVFile: async function () {
		//let EmptyRenumberJSON = [];
		//return await CreateCSVFile(EmptyRenumberJSON);
		return await CreateCSVFile();
	},
	UpdatePreviousCSVFile: function () {
		ProcessRenumFile(CreateCSVFile);
	},
	GetCurrentObjectFromLineText: function (DeclarationLineText = '') {
		return GetCurrentObjectFromLineText(DeclarationLineText);
	},
	GetDeclarationLineText: function (ALDocument) {
		return GetDeclarationLineText(ALDocument);
	},
	GetCurrentObjectFromDocument: function (ALDocument) {
		return GetCurrentObjectFromDocument(ALDocument);
	},
	GetDeclarationLineNumber: function (ALDocument) {
		return GetDeclarationLineNumber(ALDocument);
	},
	getALDocExtended: async function (ALDocument) {
		return await getALDocExtended(ALDocument);
	},
	IsTableExtensionObject: function (DeclarationLineText = '') {
		return IsTableExtensionObject(DeclarationLineText)
	},
	MatchWithKeyDeclaration: function (lineText = '') {
		return MatchWithKeyDeclaration(lineText = '');
	},
	GetPrimaryKeyText: function (ALDocument) {
		return GetPrimaryKeyText(ALDocument);
	},
	getPrimaryKeyFields: function (ALDocument) {
		return getPrimaryKeyFields(ALDocument);
	},
	GetFieldsText: function (ALDocument) { return GetFieldsText(ALDocument) },
	MatchWithFieldDeclaration: function (lineText) { return MatchWithFieldDeclaration(lineText) },
	getFieldNameFromDeclarationLine: function (lineText) {
		return getFieldNameFromDeclarationLine(lineText)
	},
	GetIsFlowField: function (ElementText) {
		return GetIsFlowField(ElementText);
	},
	getRealFieldList: function (ALDocument)
	{
		return getRealFieldList(ALDocument);
	},
	getOnlyFieldsKeyText: function(ALDocument)
	{
		return getOnlyFieldsKeyText(ALDocument);
	}
	,
	getNumberWithInputBox: async function () {
		return await getNumberWithInputBox();
	}
	,
	getNextObjectNumber: function (firstObjNumber, objLastNumbers, groupCriteria = '') {
		return getNextObjectNumber(firstObjNumber, objLastNumbers, groupCriteria);
	}
}

async function ProcessWorkSpace(RenumberJSON = []) {
	OutputChannel.clear();
	OutputChannel.show();

	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocumentURI = AllDocs[index];
		var ALDocument = await vscode.workspace.openTextDocument(ALDocumentURI);
		var DeclarationLineText = await GetDeclarationLineText(ALDocument);
		OutputChannel.appendLine('Processing ' + DeclarationLineText);
		var NumberRelation = FindNumberRelation(DeclarationLineText, RenumberJSON);
		if (NumberRelation) {
			if ((NumberRelation.NewID != '') && (NumberRelation.NewID != NumberRelation.OldID)) {
				const LineReplaced = DeclarationLineText.replace(NumberRelation.OldID, NumberRelation.NewID);
				const WSEdit = new vscode.WorkspaceEdit;
				const DeclarationLineNumber = GetDeclarationLineNumber(ALDocument);
				const PositionOpen = new vscode.Position(DeclarationLineNumber, 0);
				const PostionEnd = new vscode.Position(DeclarationLineNumber, DeclarationLineText.length);
				await WSEdit.replace(ALDocumentURI, new vscode.Range(PositionOpen, PostionEnd),
					LineReplaced);
				await vscode.workspace.applyEdit(WSEdit);
				OutputChannel.appendLine('Replaced ' + DeclarationLineText + ' with ' + LineReplaced);
			}
		}
		else {
			OutputChannel.appendLine('Object not found in Renumber JSON');
		}
	};
}
function FindNumberRelation(DeclarationLineText, RenumberJSON) {
	var NumberRelation = {
		OldID: '',
		NewID: ''
	};
	const CurrentObject = GetCurrentObjectFromLineText(DeclarationLineText);
	if (!CurrentObject) {
		return NumberRelation;
	}
	var RenumberCurrent = (RenumberJSON.find(RenumberJSON => (RenumberJSON.ObjectType == CurrentObject.ObjectType)
		&& (RenumberJSON.PreviousID == CurrentObject.ObjectID)
	))
	if (RenumberCurrent) {
		NumberRelation.OldID = RenumberCurrent.PreviousID;
		NumberRelation.NewID = RenumberCurrent.NewID;
	}
	return NumberRelation;
}
function GetCurrentObjectFromLineText(DeclarationLineText = '') {
	var CurrentObject =
	{
		ObjectType: '',
		ObjectID: '',
		ObjectName: ''
	}
		;
	var DeclaratioMatch = DeclarationLineText.match(declarationRegExp);
	if (!DeclaratioMatch) {
		return CurrentObject;
	}
	CurrentObject =
	{
		ObjectType: DeclaratioMatch[1].toLowerCase(),
		ObjectID: DeclaratioMatch[2],
		ObjectName: originalObjectName(DeclaratioMatch[3])
	}
	return CurrentObject;
}
async function GetWorkspaceObjects() {
	var WorkspaceObjects = [];
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index])
		var CurrentObject = GetCurrentObjectFromDocument(ALDocument);
		if (CurrentObject.ObjectID !== '') {
			WorkspaceObjects.push(CurrentObject);
		}
	}
	return WorkspaceObjects.sort(SortObjects);
}
function SortObjects(a, b) {
	if (a.ObjectType + a.ObjectID > b.ObjectType + b.ObjectID) {
		return 1;
	}
	else {
		return -1;
	}
}
async function ProcessRenumFile(EndProccesingFuntcion) {
	var RenumberJSON = [];
	let fileUri = await vscode.window.showOpenDialog(optionsCSVFile('Open'));
	var fs = require('fs'),
		readline = require('readline');

	var rd = readline.createInterface({
		input: fs.createReadStream(fileUri[0].fsPath)
	});
	rd.on('line', function (line) {
		const Elements = line.split(';');
		RenumberJSON.push(
			{
				"ObjectType": Elements[0].toLowerCase(),
				"PreviousID": Elements[1],
				"NewID": Elements[3]
			});
	});
	rd.on('close', EndProccesingFuntcion(RenumberJSON));
}
async function CreateCSVFile(RenumberJSON) {
	const sep = ';';
	let firstObjNumber = '';
	let objLastNumbers = [];
	if (!RenumberJSON) {		
	firstObjNumber = await getNumberWithInputBox();
	}
	var WorkspaceObjects = await GetWorkspaceObjects();
	let fileUri = await vscode.window.showSaveDialog(optionsCSVFile('Save'));
	var LineText = 'ObjectType' + sep + 'OldId' + sep + 'Name' + sep + 'NewId' + carriage;
	let NewId = '';
	let DeclarationText = '';
	for (let index = 0; index < WorkspaceObjects.length; index++) {
		NewId = '';
		if (RenumberJSON) {
			DeclarationText = WorkspaceObjects[index].ObjectType + ' ' + WorkspaceObjects[index].ObjectID +
				' ' + WorkspaceObjects[index].ObjectName;
			NewId = FindNumberRelation(DeclarationText, RenumberJSON).NewID;
		}
		if (NewId == '') {		
			NewId = getNextObjectNumber(firstObjNumber, objLastNumbers,WorkspaceObjects[index].ObjectType);
		}
		LineText = LineText + WorkspaceObjects[index].ObjectType + sep + WorkspaceObjects[index].ObjectID + sep +
			WorkspaceObjects[index].ObjectName + sep + NewId + carriage;
	}
	await vscode.workspace.fs.writeFile(fileUri, Buffer.from(LineText));
	vscode.window.showInformationMessage('CSV file created in ' + fileUri.path);
	return fileUri.path;
}
async function getNumberWithInputBox() {
	let firstObjNumber = await vscode.window.showInputBox({ 
    valueSelection: [50000, 9999999], 
    prompt: "Type initial ID (5 or 7 digits) to number the new IDS from by defalut",
    value: "50000",
    placeHolder: "Enter a 5 or 7-digit number",
    validateInput: text => {
        return /^\d{5}(\d{2})?$/.test(text) ? null : 'Please enter a 5 or 7-digit number';
    }
	});
	if (!firstObjNumber) {
		vscode.window.showErrorMessage('No number entered');
		return '';
	}
	return firstObjNumber;
}

function originalObjectName(OldName = '') {
	var extendsPosition = OldName.search(/\s+extends\s+/i);
	if (extendsPosition < 0) {
		return OldName;
	}
	return OldName.replace(/.*\s+extends\s+/i, '');
	//return OldName.substring(0, extendsPosition);
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
function GetDeclarationLineText(ALDocument) {
	const DeclarationLineNumber = GetDeclarationLineNumber(ALDocument);
	if (DeclarationLineNumber < 0) {
		return '';
	}
	return ALDocument.lineAt(DeclarationLineNumber).text;
}
function GetDeclarationLineNumber(ALDocument) {
	let DeclarationLineNumber = -1;
	for (let index = 0; index < ALDocument.lineCount; index++) {
		let matchDeclaration = ALDocument.lineAt(index).text.match(declarationRegExp);
		if (matchDeclaration) {
			DeclarationLineNumber = index;
			return DeclarationLineNumber;
		}
	}
	return DeclarationLineNumber;
}

function GetCurrentObjectFromDocument(ALDocument) {
	let DeclarationLineLext = GetDeclarationLineText(ALDocument);
	let ObjectDeclaration = GetCurrentObjectFromLineText(DeclarationLineLext);
	return ObjectDeclaration;
}
async function getObjectDefinition(currDocument, startRange) {
	//console.log('vscode.executeDefinitionProvider');
	let locations = await vscode.commands.executeCommand('vscode.executeDefinitionProvider',
		currDocument.uri, startRange);

	// console.log(await document.lineAt(vscode.window.activeTextEditor.selection.start.line).text);
	if (locations) {
		let doc = await vscode.workspace.openTextDocument(locations[0].uri);
		return doc;
	}
}
async function getALDocExtended(ALDocument) {
	const DeclarationLineLext = GetDeclarationLineText(ALDocument);
	const extendsTok = 'extends';
	const regexpExtends = new RegExp(extendsTok, 'i');
	if (!IsTableExtensionObject(DeclarationLineLext)) {
		return;
	}
	let originalNamePosition = DeclarationLineLext.search(regexpExtends) + extendsTok.length + 1;
	for (let index = originalNamePosition; index < DeclarationLineLext.length; index++) {
		if (DeclarationLineLext[index] !== ' ') {
			return await getObjectDefinition(ALDocument, new vscode.Position(GetDeclarationLineNumber(ALDocument), index));
		}
	}
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
function getPrimaryKeyFields(ALDocument) {
	let primaryKeyText = GetPrimaryKeyText(ALDocument);
	primaryKeyText = primaryKeyText.replace(/key\s*\(.*;/i, '');
	primaryKeyText = primaryKeyText.replace(/\)/i, '')
	if (primaryKeyText == '') {
		return;
	}
	let primaryKeyFields = primaryKeyText.split(',');
	for (let index = 0; index < primaryKeyFields.length; index++) {
		primaryKeyFields[index] = primaryKeyFields[index].trim();
	}
	return primaryKeyFields;
}
function GetPrimaryKeyText(ALDocument) {
	for (let index = 1; index < ALDocument.lineCount - 1; index++) {
		if (MatchWithKeyDeclaration(ALDocument.lineAt(index).text)) {
			return MatchWithKeyDeclaration(ALDocument.lineAt(index).text);
		}
	}
	return '';
}
function MatchWithKeyDeclaration(lineText = '') {
	var ElementMatch = lineText.match(/\s+key\s*\(.*\)/gi);
	if (ElementMatch) {
		return ElementMatch[0].toString();
	}
}
function GetFieldsText(ALDocument) {
	const fieldsInformation = getFieldsInformation(ALDocument);
	return fieldsInformation.fieldsTextDefinition;
}

function getRealFieldList(ALDocument) {
	const fieldsInformation = getFieldsInformation(ALDocument);
	return fieldsInformation.realFieldList;
}
function getOnlyFieldsKeyText(ALDocument)
{
	const fieldsInformation = getFieldsInformation(ALDocument);
	return fieldsInformation.onlyFieldsKeyText;
}

function getFieldsInformation(ALDocument) {
	let FinalText = '';
	let onlyFieldsKeyText = '';
	let realFieldList = [];
	const primaryKeyFields = getPrimaryKeyFields(ALDocument);
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
			const fieldName = getFieldNameFromDeclarationLine(CurrElement.ElementText);
			realFieldList.push(fieldName);
			FinalText = addFieldTextToExisting(index,CurrElement,ALDocument,FinalText);			
			if (isKeyField(fieldName,primaryKeyFields))
			{
				onlyFieldsKeyText = addFieldTextToExisting(index,CurrElement,ALDocument,onlyFieldsKeyText);
			}
			CurrElement.ElementText = '';
			CurrElement.ElementOpenLine = 0;		
		}
	}	
	return {
		fieldsTextDefinition: FinalText,
		realFieldList: realFieldList,
		onlyFieldsKeyText: onlyFieldsKeyText
	}
}
function addFieldTextToExisting(index,CurrElement,ALDocument,ExistingText='') {
	for (let ElemNumber = CurrElement.ElementOpenLine; ElemNumber <= index; ElemNumber++) {
		if (GetContentToWrite(ALDocument.lineAt(ElemNumber).text))
			ExistingText = ExistingText + (GetContentToWrite(ALDocument.lineAt(ElemNumber).text)) + carriage;
	}
	ExistingText = ExistingText + '}' + carriage;
	return ExistingText;
}
function MatchWithFieldDeclaration(lineText = '') {
	var ElementMatch = lineText.match(/\s*field\s*\(\s*\d+\s*;.*;.*\)/i);
	if (ElementMatch) {
		return ElementMatch[0].toString();
	}
}
function MatchWithClose(lineText = '') {
	return (lineText.indexOf('}') >= 0)
}
function GetIsFlowField(ElementText = '') {
	return (ElementText.search(/FieldClass\s*=\s*(FlowField|FlowFilter)\s*;/i) >= 0)
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
function MatchWithOptionMembers(lineText = '') {
	var ElementMatch = lineText.match(/\s*OptionMembers =.*;/gi);
	if (ElementMatch) {
		return ElementMatch[0].toString();
	}
}
function getFieldNameFromDeclarationLine(lineText) {
	let fieldName = lineText;
	fieldName = fieldName.replace(/\s*field\s*\(\s*\d+\s*;\s*/i, '');
	fieldName = fieldName.replace(/\s*;.*/i, '');
	return fieldName;
}
function isKeyField(fieldName, primaryKeyFields) {
	if (!primaryKeyFields)
	{
		return false;
	}
	if (primaryKeyFields.length == 0)
	{
		return false;
	}
	for (let index = 0; index < primaryKeyFields.length; index++) {		
		if (fieldName.replace('"','') == primaryKeyFields[index].replace('"',''))
		{return true}
	}
	return false;
}
function getNextObjectNumber(firstObjNumber, objLastNumbers, groupCriteria='') {
	if (firstObjNumber == '') {
		return '';
	}	
	let objLastNumber = objLastNumbers.find(Obj => Obj.ObjType == groupCriteria);
	if (objLastNumber) {
		objLastNumber.ObjNumber = objLastNumber.ObjNumber + 1;
		return objLastNumber.ObjNumber.toString();
	}
	objLastNumber = {
		ObjType: groupCriteria,
		ObjNumber: parseInt(firstObjNumber)
	};
	objLastNumbers.push(
		objLastNumber);
		return objLastNumber.ObjNumber.toString();
}