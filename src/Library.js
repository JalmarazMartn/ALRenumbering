const vscode = require('vscode');
module.exports = {
	ProcessWorkSpace: function (RenumberJSON = []) {
		ProcessWorkSpace(RenumberJSON);
	},
	GetWorkspaceObjects: function (
	) {
		return GetWorkspaceObjects();
	}
}

async function ProcessWorkSpace(RenumberJSON = []) {
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	AllDocs.forEach(ALDocumentURI => {
		vscode.workspace.openTextDocument(ALDocumentURI).then(
			ALDocument => {
				const FirstLine = ALDocument.lineAt(0).text;
				var NumberRelation = FindNumberRelation(FirstLine, RenumberJSON);
				if (NumberRelation) {
					if ((NumberRelation.NewID != '') && (NumberRelation.NewID != NumberRelation.OldID)) {
						const LineReplaced = FirstLine.replace(NumberRelation.OldID, NumberRelation.NewID);
						const WSEdit = new vscode.WorkspaceEdit;
						const PositionOpen = new vscode.Position(0, 0);
						const PostionEnd = new vscode.Position(0, FirstLine.length);
						WSEdit.replace(ALDocumentURI, new vscode.Range(PositionOpen, PostionEnd),
							LineReplaced);
						vscode.workspace.applyEdit(WSEdit);
					}
				}
			});
	});
}
function FindNumberRelation(FirstLine, RenumberJSON) {
	var NumberRelation = {
		OldID: '',
		NewID: ''
	};
	const CurrentObject = GetCurrentObject(FirstLine);
	if (!CurrentObject) {
		return NumberRelation;
	}
	var RenumberCurrent = (RenumberJSON.find(RenumberJSON => (RenumberJSON.ObjectType.toUpperCase == CurrentObject.ObjectType.toUpperCase)
		&& (RenumberJSON.PreviousID == CurrentObject.ObjectID)
	))
	if (RenumberCurrent) {
		NumberRelation.OldID = RenumberCurrent.PreviousID;
		NumberRelation.NewID = RenumberCurrent.NewID;
		return NumberRelation;
	}
}
function GetCurrentObject(FirstLine = '') {
	var CurrentObject =
	{
		ObjectType: '',
		ObjectID: '',
		ObjectName: ''
	}
		;
	var DeclaratioMatch = FirstLine.match(/\s*([a-zA-Z]+)\s*([0-9]+)\s+(.*)/);
	if (!DeclaratioMatch) {
		return CurrentObject;
	}
	CurrentObject =
	{
		ObjectType: DeclaratioMatch[1],
		ObjectID: DeclaratioMatch[2],
		ObjectName: DeclaratioMatch[3]
	}
	return CurrentObject;
}
async function GetWorkspaceObjects() {
	var WorkspaceObjects = [];
	const AllDocs = await vscode.workspace.findFiles('**/*.{al}');
	for (let index = 0; index < AllDocs.length; index++) {
		var ALDocument = await vscode.workspace.openTextDocument(AllDocs[index])
		const FirstLine = ALDocument.lineAt(0).text;
		console.log(FirstLine);
		var CurrentObject = GetCurrentObject(FirstLine);
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