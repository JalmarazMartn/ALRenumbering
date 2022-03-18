const vscode = require('vscode');
const carriage = '\r\n';
const declarationRegExp = /\s*([a-zA-Z]+)\s*([0-9]+)\s+(.*)/i;
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
	CreateNewCSVFile: function () {
		let EmptyRenumberJSON = [];
		CreateCSVFile(EmptyRenumberJSON);
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
	}
}

async function ProcessWorkSpace(RenumberJSON = []) {
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	AllDocs.forEach(ALDocumentURI => {
		vscode.workspace.openTextDocument(ALDocumentURI).then(
			ALDocument => {
				const DeclarationLineText = ALDocument.lineAt(0).text;
				var NumberRelation = FindNumberRelation(DeclarationLineText, RenumberJSON);
				if (NumberRelation) {
					if ((NumberRelation.NewID != '') && (NumberRelation.NewID != NumberRelation.OldID)) {
						const LineReplaced = DeclarationLineText.replace(NumberRelation.OldID, NumberRelation.NewID);
						const WSEdit = new vscode.WorkspaceEdit;
						const PositionOpen = new vscode.Position(0, 0);
						const PostionEnd = new vscode.Position(0, DeclarationLineText.length);
						WSEdit.replace(ALDocumentURI, new vscode.Range(PositionOpen, PostionEnd),
							LineReplaced);
						vscode.workspace.applyEdit(WSEdit);
					}
				}
			});
	});
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
		ObjectType: DeclaratioMatch[1],
		ObjectID: DeclaratioMatch[2],
		ObjectName: extendsRemoved(DeclaratioMatch[3])
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
				"ObjectType": Elements[0],
				"PreviousID": Elements[1],
				"NewID": Elements[3]
			});
	});
	rd.on('close', EndProccesingFuntcion(RenumberJSON));
}
async function CreateCSVFile(RenumberJSON) {
	const sep = ';';

	var WorkspaceObjects = await GetWorkspaceObjects();
	let fileUri = await vscode.window.showSaveDialog(optionsCSVFile('Save'));
	var LineText = 'ObjectType' + sep + 'OldId' + sep + 'Name' + sep + 'NewId' + carriage;
	let NewId = '';
	let DeclarationText = '';
	for (let index = 0; index < WorkspaceObjects.length; index++) {
		if (RenumberJSON) {
			DeclarationText = WorkspaceObjects[index].ObjectType + ' ' + WorkspaceObjects[index].ObjectID +
				' ' + WorkspaceObjects[index].ObjectName;
			NewId = FindNumberRelation(DeclarationText, RenumberJSON).NewID;
		}
		LineText = LineText + WorkspaceObjects[index].ObjectType + sep + WorkspaceObjects[index].ObjectID + sep +
			WorkspaceObjects[index].ObjectName + sep + NewId + carriage;
	}
	await vscode.workspace.fs.writeFile(fileUri, Buffer.from(LineText));
	vscode.window.showInformationMessage('CSV file created in ' + fileUri.path);
}	
function extendsRemoved(OldName='')
	{
		var extendsPosition = OldName.search(/\s+extends\s+/i);
		if (extendsPosition < 0)
		{
			return OldName;
		}
		return OldName.substring(0,extendsPosition);
	}
function optionsCSVFile(newOpenLabel='')
{
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
async function CreateCSVTableExtFieldsFile() {
	const sep = ';';
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	var FinalText = 'OldId' + sep + 'Name' + sep + 'NewId' + carriage;
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index])
		const DeclarationLineText = ALDocument.lineAt(0).text;
		if ((DeclarationLineText.search(/Tablextension/i) >= 0)) 
		{

		}
	}
}
async function GetFieldsTextFromTableExtension(ALDocument)
{
let fieldsText = '';
for (let index = 1; index < ALDocument.lineCount - 1; index++) {
	let matchField = ALDocument.lineAt(index).text.match('/field\((.*);(.*);/i');
	if (matchField)
	{
	fieldsText = fieldsText + matchField;
	}
	}
}
function GetDeclarationLineText(ALDocument)
{
	let DeclarationLineLext = '';
	for (let index = 0; index < ALDocument.lineCount; index++) {
		let matchDeclaration = ALDocument.lineAt(index).text.match(declarationRegExp);
		if (matchDeclaration)
		{
			DeclarationLineLext = ALDocument.lineAt(index).text;
			return DeclarationLineLext;
		}
	}
	return DeclarationLineLext;
}
function GetCurrentObjectFromDocument(ALDocument)
{
	let DeclarationLineLext = GetDeclarationLineText(ALDocument);
	let ObjectDeclaration = GetCurrentObjectFromLineText(DeclarationLineLext);
	return ObjectDeclaration;
}