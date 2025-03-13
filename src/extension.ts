import * as vscode from "vscode";

let isInsertMode: boolean = true;
let lastKeyPress: string = "";
let lastKeyPressTime: number = 0;

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("Jason Mode Activated!");

  isInsertMode = true;
  vscode.commands.executeCommand("setContext", "vimMode", false);
  updateCursorStyle(false);

  let enterInsertMode = vscode.commands.registerCommand(
    "jason-test.enterInsertMode",
    () => {
      isInsertMode = true;
      vscode.commands.executeCommand("setContext", "vimMode", false);
      // vscode.window.showInformationMessage("Insert Mode");
      updateCursorStyle(true);
    }
  );

  let enterNormalMode = vscode.commands.registerCommand(
    "jason-test.enterNormalMode",
    () => {
      isInsertMode = false;
      vscode.commands.executeCommand("setContext", "vimMode", true);
      // vscode.window.showInformationMessage("Normal Mode");
      updateCursorStyle(false);
    }
  );

  context.subscriptions.push(enterInsertMode, enterNormalMode);

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (isInsertMode) detectAndRemoveKJ(event);
    },
    null,
    context.subscriptions
  );
}

function updateCursorStyle(isInsertMode: boolean) {
  const config = vscode.workspace.getConfiguration("editor");
  config.update(
    "cursorStyle",
    isInsertMode ? "line" : "block-outline",
    vscode.ConfigurationTarget.Global
  );
}

async function detectAndRemoveKJ(event: vscode.TextDocumentChangeEvent) {
  const now = Date.now();
  const timeDiff = now - lastKeyPressTime;
  lastKeyPressTime = now;

  const lastChange = event.contentChanges[event.contentChanges.length - 1];
  if (!lastChange || !lastChange.text) return;

  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  // Track key sequence, even on empty lines
  if (timeDiff > 500) {
    lastKeyPress = "";
  }

  if (lastKeyPress === "k" && lastChange.text === "j") {
    lastKeyPress = "";

    // Simulate two backspaces to delete "kj"
    await vscode.commands.executeCommand("deleteLeft");
    await vscode.commands.executeCommand("deleteLeft");

    // vscode.window.showInformationMessage('Entered Normal Mode via "kj"');

    isInsertMode = false;
    vscode.commands.executeCommand("setContext", "vimMode", true);
    updateCursorStyle(false);
  } else {
    lastKeyPress = lastChange.text;
  }
}

export function deactivate() {}
