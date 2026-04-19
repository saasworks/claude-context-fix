const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * Resolves the Claude Code insertAtMention command name,
 * or null if Claude Code isn't installed.
 * @return {Promise<string|null>}
 */
async function findClaudeCommand() {
    const all = await vscode.commands.getCommands(true);
    if (all.includes('claude-vscode.insertAtMention')) {
        return 'claude-vscode.insertAtMention';
    }
    if (all.includes('claude-code.insertAtMentioned')) {
        return 'claude-code.insertAtMentioned';
    }
    return null;
}

/**
 * Returns a workspace-relative @mention string for a URI.
 * @param {vscode.Uri} u
 * @return {string}
 */
function toMention(u) {
    const folders = vscode.workspace.workspaceFolders;
    const wsRoot = folders && folders.length > 0
        ? folders[0].uri.fsPath
        : (process.env.HOME || '/tmp');
    const rel = path.relative(wsRoot, u.fsPath);
    return '@' + (rel.startsWith('..') ? u.fsPath : rel);
}

/**
 * Returns true if the given URI points to a directory.
 * @param {vscode.Uri} u
 * @return {boolean}
 */
function isDirectory(u) {
    try {
        return fs.statSync(u.fsPath).isDirectory();
    } catch (_) {
        return false;
    }
}

/**
 * Injects a single file @mention into the Claude Code
 * sidebar input using the insertAtMention command (same
 * mechanism as Alt+K).  Opens the file as the active
 * editor so the command can read it.
 * @param {vscode.Uri} u
 * @param {string} claudeCmd
 */
async function injectFileToClaudeInput(u, claudeCmd) {
    try {
        await vscode.window.showTextDocument(u, {
            preview: true,
            preserveFocus: false,
        });
        await vscode.commands.executeCommand(claudeCmd);
    } catch (_) {
        // Binary/non-text files (images, PDFs, etc.) can't be opened
        // as text editors, so insertAtMention has nothing to read.
        // Fall back to clipboard.
        await injectFolderToClaudeInput(u);
    }
}

/**
 * Folders and binary files: copy @mention to clipboard,
 * focus the Claude Code sidebar so one Ctrl+V completes it.
 * @param {vscode.Uri} u
 */
async function injectFolderToClaudeInput(u) {
    const mention = toMention(u);
    await vscode.env.clipboard.writeText(mention);

    for (const cmd of [
        'claudeVSCodeSidebarSecondary.focus',
        'claudeVSCodeSidebar.focus',
    ]) {
        try {
            await vscode.commands.executeCommand(cmd);
            break;
        } catch (_) {}
    }

    vscode.window.showInformationMessage(
        `${mention} copied — Ctrl+V to add to Claude`);
}

/**
 * "Add to Claude Context" command handler.
 *
 * - Files   → opens as active editor + fires insertAtMention
 *             (identical to Alt+K, injects into sidebar input)
 * - Folders → sends @folderPath to Claude terminal, or clipboard
 * - Multi-select in Explorer passes all URIs as second arg.
 *
 * @param {vscode.Uri|undefined} uri
 * @param {vscode.Uri[]|undefined} uris
 */
async function addToClaudeContext(uri, uris) {
    let targets = [];
    if (uris && uris.length > 0) {
        targets = uris;
    } else if (uri) {
        targets = [uri];
    } else {
        const editor = vscode.window.activeTextEditor;
        if (editor) targets = [editor.document.uri];
    }

    if (targets.length === 0) {
        vscode.window.showWarningMessage(
            'Claude Context: no file or folder selected.');
        return;
    }

    const claudeCmd = await findClaudeCommand();

    if (!claudeCmd) {
        // Claude Code not installed — clipboard fallback for all.
        const text = targets.map(toMention).join(' ');
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage(
            `Claude Code not found — copied to clipboard: ${text}`);
        return;
    }

    for (const u of targets) {
        if (isDirectory(u)) {
            await injectFolderToClaudeInput(u, claudeCmd);
        } else {
            await injectFileToClaudeInput(u, claudeCmd);
        }
    }
}

module.exports = {addToClaudeContext};
