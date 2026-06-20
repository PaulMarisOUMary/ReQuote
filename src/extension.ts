import * as vscode from 'vscode';

import { flipQuotes, SUPPORTED_LANGUAGES } from './quote';


const EXT = "ReQuote";


// Core logic

let isEditing = false;

async function runOnEditor(editor = vscode.window.activeTextEditor): Promise<void> {
    if (!editor || isEditing) { return; }

    if (!SUPPORTED_LANGUAGES.has(editor.document.languageId)) { return; }

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


// Commands

const COMMANDS: Record<string, () => void> = {
    toggle: () => { void runOnEditor(); },
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

            const langs = new Set(config.get<string[]>("languages") ?? []);
            if (!langs.has(document.languageId)) { return; }

            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document !== document) { return; }

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                void runOnEditor(editor);
            }, 300);
        }),
    );
}

export function activate(context: vscode.ExtensionContext): void {
    registerCommands(context);
    registerAutoRefactor(context);
}

export function deactivate(): void {
    clearTimeout(debounceTimer);
}