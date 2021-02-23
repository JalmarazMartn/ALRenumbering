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

}
// @ts-ignore
exports.activate = activate;

function deactivate() { }


module.exports = {
	// @ts-ignore
	activate,
	deactivate
}