import * as vscode from 'vscode';

import { flipQuotes, SUPPORTED_LANGUAGES } from './quote';


const EXT = "ReQuote";

const DEBOUNCE_DELAY = 600;


// Core logic

let isEditing = false;

async function runOnEditor(editor = vscode.window.activeTextEditor): Promise<void> {
    if (!editor || isEditing) { return; }

    if (!SUPPORTED_LANGUAGES.has(editor.document.languageId)) { return; }

    if (isCursorInsideUnclosedString(editor)) { return;}

    isEditing = true;
    try {
        await editor.edit((builder) => {
        for (const sel of editor.selections) {
            const range = sel.isEmpty
            ? editor.document.lineAt(sel.active.line).range
            : sel;

            const original = editor.document.getText(range);
            const flipped = flipQuotes(original);
            if (flipped !== original) { builder.replace(range, flipped); }
        }
        });
    } finally {
        isEditing = false;
    }
}

async function formatFile(
  editor = vscode.window.activeTextEditor,
): Promise<void> {
  if (!editor || isEditing) { return; }
  if (!isLangSupported(editor.document)) { return; }

  const document = editor.document;
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(document.getText().length),
  );

  const original = document.getText();
  const flipped = flipQuotes(original);
  if (flipped === original) { return; }

  isEditing = true;
  try {
    await editor.edit((builder) => builder.replace(fullRange, flipped));
  } finally {
    isEditing = false;
  }
}


// Helpers

function isLangSupported(document: vscode.TextDocument): boolean {
  const config = vscode.workspace.getConfiguration(EXT);
  const langs = new Set(config.get<string[]>("languages") ?? []);
  return langs.has(document.languageId);
}

function isCursorInsideUnclosedString(editor: vscode.TextEditor): boolean {
  for (const sel of editor.selections) {
    const line = editor.document.lineAt(sel.active.line).text;
    const col = sel.active.character;
    const before = line.slice(0, col);

    const countUnescaped = (str: string, q: string) =>
      (str.match(new RegExp(`(?<!\\\\)${q}`, 'g')) ?? []).length;

    for (const q of ['"', "'", '`']) {
      if (countUnescaped(before, q) % 2 !== 0) { return true; }
    }
  }
  return false;
}


// Commands

const COMMANDS: Record<string, () => void> = {
    toggle: () => { void runOnEditor(); },
    formatFile: () => { void formatFile(); },
};

function registerCommands(context: vscode.ExtensionContext): void {
    for (const [name, handler] of Object.entries(COMMANDS)) {
        context.subscriptions.push(
        vscode.commands.registerCommand(`${EXT}.${name}`, handler),
        );
    }
}


// Auto refactor

let debounceTimer: ReturnType<typeof setTimeout> | undefined;

function registerAutoRefactor(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(({ document }) => {
            if (isEditing) { return; }

            const config = vscode.workspace.getConfiguration(EXT);
            if (!config.get<boolean>("autoRefactor")) { return; }

            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document !== document) { return; }
            if (!isLangSupported(document)) { return; }

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                void runOnEditor(editor);
            }, DEBOUNCE_DELAY);
        }),
    );
}


// Lifecycle

export function activate(context: vscode.ExtensionContext): void {
    registerCommands(context);
    registerAutoRefactor(context);
}

export function deactivate(): void {
    clearTimeout(debounceTimer);
}