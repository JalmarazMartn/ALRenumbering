const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let RenumSubs = vscode.commands.registerCommand('JAMRenumbering.Renumber', function () {
		Renumber();
	});
	context.subscriptions.push(RenumSubs);

	let CreateCSVSubs = vscode.commands.registerCommand('JAMRenumbering.CreateCSVFile', function () {
		CreateCSVFile();
	});
	context.subscriptions.push(CreateCSVSubs);
}
// @ts-ignore
exports.activate = activate;

function deactivate() { }

async function CreateCSVFile()
{
	const sep = ';';
	const carriage = '\r\n';
	const Library = require('./src/Library.js');
	var WorkspaceObjects = await Library.GetWorkspaceObjects();
	const options = {
		canSelectMany: false,
		openLabel: 'Save',
		title: 'Select CSV File',
		filters: {
			'csv': ['csv'],
		}
	};	
	let fileUri = await vscode.window.showSaveDialog(options);

	var LineText = 'ObjectType' +sep + 'OldId' +sep + 'Name'+sep + 'NewId'+ carriage;
	for (let index = 0; index < WorkspaceObjects.length; index++) {
		LineText = LineText + WorkspaceObjects[index].ObjectType +sep + WorkspaceObjects[index].ObjectID +sep + 
				WorkspaceObjects[index].ObjectName+sep+carriage;		
	}	
	await vscode.workspace.fs.writeFile(fileUri,Buffer.from(LineText));
	vscode.window.showInformationMessage('CSV file created in ' + fileUri.path);
}

async function Renumber() {
	var RenumberJSON = [];
	const options = {
		canSelectMany: false,
		openLabel: 'Open',
		title: 'Select CSV File',
		filters: {
			'csv': ['csv'],
		}
	};
	let fileUri = await vscode.window.showOpenDialog(options);
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
	rd.on('close', function () {
		const Library = require('./src/Library.js');
		Library.ProcessWorkSpace(RenumberJSON);
		vscode.window.showInformationMessage('Renumbered objects are open. Yoy can Save All or close whithout save these changes.');
	});
}
module.exports = {
	// @ts-ignore
	activate,
	deactivate
}