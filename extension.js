const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let RenumSubs = vscode.commands.registerCommand('JAMRenumbering.Renumber', function () {
		const Library = require('./src/Library.js');

		Library.RenumberObjects();
	});
	context.subscriptions.push(RenumSubs);

	let CreateCSVSubs = vscode.commands.registerCommand('JAMRenumbering.CreateCSVFile', function () {
		const Library = require('./src/Library.js');		
		Library.CreateNewCSVFile();
	});
	context.subscriptions.push(CreateCSVSubs);

	let UpdatePreviousCSVFile = vscode.commands.registerCommand('JAMRenumbering.UpdatePreviousCSVFile', function () {
		const Library = require('./src/Library.js');		
		Library.UpdatePreviousCSVFile();
	});
	context.subscriptions.push(UpdatePreviousCSVFile);
	context.subscriptions.push(CreateCSVSubs);

	let CreateTableObjectsWithoutLogic = vscode.commands.registerCommand('JAMRenumbering.CreateTableObjectsWithoutLogic', function () {
		const EmptyObjects = require('./src/EmptyObjects.js');		
		EmptyObjects.CreateTableObjectsWithoutLogic();
	});
	context.subscriptions.push(CreateTableObjectsWithoutLogic);	
	let CreateTableObjectsWithoutLogicCAL = vscode.commands.registerCommand('JAMRenumbering.CreateTableObjectsWithoutLogicCAL', function () {
		const EmptyObjects = require('./src/EmptyObjects.js');		
		EmptyObjects.CreateTableObjectsWithoutLogicCAL();
	});
	context.subscriptions.push(CreateTableObjectsWithoutLogicCAL);	

	let InsertExtensionFieldsInCSIDEFile = vscode.commands.registerCommand('JAMRenumbering.InsertExtensionFieldsInCSIDEFile', function () {
		const fieldsFromExtension = require('./src/FieldsFromExtension.js');		
		fieldsFromExtension.InsertExtensionFieldsInCSIDEFile();
	});
	context.subscriptions.push(InsertExtensionFieldsInCSIDEFile);

	let CreateCSVTableExtFieldsFile = vscode.commands.registerCommand('JAMRenumbering.CreateCSVTableExtFieldsFile', function () {
		const fieldsFromExtension = require('./src/renumberFields.js');		
		fieldsFromExtension.CreateCSVTableExtFieldsFile();
	});
	context.subscriptions.push(CreateCSVTableExtFieldsFile);

	let RenumberFields = vscode.commands.registerCommand('JAMRenumbering.RenumberFields', function () {
		const fieldsFromExtension = require('./src/renumberFields.js');		
		fieldsFromExtension.ProcessRenumFile();
	}
	);
	context.subscriptions.push(RenumberFields);

	let showRenumberHTMLView = vscode.commands.registerCommand('JAMRenumbering.showRenumberHTMLView', function () {
		const renumberView = require('./src/renumberView.js');
		renumberView.showRenumberHTMLView(context);
	});
	context.subscriptions.push(showRenumberHTMLView);
}
// @ts-ignore
exports.activate = activate;

function deactivate() { }


module.exports = {
	// @ts-ignore
	activate,
	deactivate
}