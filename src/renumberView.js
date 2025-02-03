const vscode = require('vscode');
let ExecNumber = 0;
let HTMLContent = '';
let globalFilePath = '';
module.exports = {
  showRenumberHTMLView: async function (context) {
    await showCodeActionsHTMLView(context);
  }
}
async function showCodeActionsHTMLView(context) {
  HTMLContent = await GetHTMLContent(context);
  const WebviewSteps = vscode.window.createWebviewPanel(
    'Renumber AL objects and fields',
    '1. Create file..then 2.Open and edit new ids...and then 3.Apply renumber',
    vscode.ViewColumn.One,
    {
      enableScripts: true
    }
  );

  WebviewSteps.webview.onDidReceiveMessage(
    async function (message) {
      ExecNumber = ExecNumber + 1;
      try {
        switch (message.action) {
          case 'createCsv':
            await createRenumberfile(message.renumType);
            break;
          case 'openCsv':
            openCsv();
            break;
          case 'renumber':
            execRenumber(message.renumType);
            break;
          case 'clearFile':
            globalFilePath = '';
            break;
          case 'generateEmptyObjects':
            const EmptyObjects = require('./EmptyObjects.js');
            EmptyObjects.CreateTableObjectsWithoutLogic();
            break;
          case 'generateCSIDEEmptyObjects':
            const EmptyObjectsCAL = require('./EmptyObjects.js');
            EmptyObjectsCAL.CreateTableObjectsWithoutLogicCAL();
            break;
          case 'insertFieldsCSIDE':
            const fieldsFromExtension = require('./FieldsFromExtension.js');		
            fieldsFromExtension.InsertExtensionFieldsInCSIDEFile();
            break;
          case 'updatePrevFile':
            const Library = require('./Library.js');		
            Library.UpdatePreviousCSVFile();
            break;
        }          
      } catch (error) {
        vscode.window.showErrorMessage(error);
      }

      WebviewSteps.webview.html = HTMLContent + '<br>' +
              ExecNumber.toString() + '.' + message.action+'-' + message.renumType+ '<br>' +
            'Current file: ' + globalFilePath;
    },
    undefined,
    context.subscriptions
  );
  ExecNumber = 0;
  WebviewSteps.webview.html = HTMLContent;
}
async function GetHTMLContent(context) {
  const path = require('path');
  const fs = require('fs');
  const filePath = context.asAbsolutePath(path.join('src', 'html', 'renumber.html'));
  let FinalTable = fs.readFileSync(filePath, 'utf8');
  return FinalTable;
}

async function createRenumberfile(renumType = '') {
  if (renumType == 'fields') {
    const renumberFields = require('./renumberFields');
    globalFilePath = await renumberFields.CreateCSVTableExtFieldsFile();
  }
  else {
    const Library = require('./Library.js');
    globalFilePath = await Library.CreateNewCSVFile();

  }
}
async function openCsv() {
  if (globalFilePath == '')
  {
    const options = {
      canSelectMany: false,
      openLabel: 'Open',
      title: 'Select CSV File',
      filters: {
        'csv': ['csv'],
      }
    };
    const newFileUri = await vscode.window.showOpenDialog(options);
    globalFilePath = newFileUri[0].path;
  }
  vscode.env.openExternal(vscode.Uri.file(globalFilePath));

}
function execRenumber(renumType = '') {
  if (renumType == 'fields') {
    const renumberFields = require('./renumberFields');
    renumberFields.ProcessRenumFile();
  }
  else {
    const Library = require('./Library.js');
    Library.RenumberObjects();
  }
}

