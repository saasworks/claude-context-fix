const vscode = require('vscode');
const {addToClaudeContext} = require('./claude-context');

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'claudeContextFix.addToContext',
            addToClaudeContext));
}

function deactivate() {}

module.exports = {activate, deactivate};
