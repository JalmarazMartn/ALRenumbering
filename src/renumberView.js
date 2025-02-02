const vscode = require('vscode');
let ExecNumber = 0;
let HTMLContent = '';
let filePath = '';
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
        }          
      } catch (error) {
        vscode.window.showErrorMessage(error);
      }

      WebviewSteps.webview.html = HTMLContent + '<br>' +
              ExecNumber.toString() + '.' + message.action+'-' + message.renumType+ '<br>' +
            'Current file: ' + filePath;
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
    filePath = await renumberFields.CreateCSVTableExtFieldsFile();
  }
  else {
    const Library = require('./Library.js');
    filePath = await Library.CreateNewCSVFile();

  }
}
function openCsv() {
  vscode.env.openExternal(vscode.Uri.file(filePath));

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

