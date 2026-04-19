<p align="center">
  <img src="logo.png" alt="Saasworks" height="48" />
</p>

# Add to Claude Context

A VS Code extension that adds **"Add to Claude Context"** to the right-click menu for files, folders, and editor tabs — injecting them as `@mentions` directly into the [Claude Code](https://marketplace.visualstudio.com/items?itemName=Anthropic.claude-code) sidebar chat input.

## Features

- **Right-click any file** in the Explorer, editor body, or tab bar → instantly injects `@relativePath` into the Claude Code sidebar input (identical to pressing `Alt+K`).
- **Right-click any folder** → copies `@folderPath` to your clipboard and focuses the sidebar; one `Ctrl+V` adds it to the chat.
- **Multi-select** in the Explorer → injects all selected files in sequence.
- **Binary files** (images, PDFs, etc.) fall back gracefully to clipboard, since they can't be opened as text editors.
- **No Claude Code?** Falls back to clipboard for everything with a clear notification.

## How it works

For text files, the extension opens the file as the active editor and fires Claude Code's internal `insertAtMention` command — the same mechanism used by `Alt+K`. This writes the `@mention` directly into the sidebar input without any clipboard step.

For folders and binary files, VS Code's WebView sandboxing prevents direct injection, so the mention is copied to clipboard and the sidebar is focused for a one-keystroke paste.

## Installation

**From the VS Code Marketplace** *(once published)*
Search for **"Add to Claude Context"** in the Extensions panel, or:
```
ext install saasworks.claude-context-fix
```

**From source**
```bash
git clone https://github.com/saasworks/claude-context-fix.git
cd claude-context-fix
npx @vscode/vsce package --no-dependencies --allow-missing-repository
code --install-extension claude-context-fix-*.vsix
```
Then reload VS Code.

## Requirements

- [Claude Code](https://marketplace.visualstudio.com/items?itemName=Anthropic.claude-code) VS Code extension installed and active.

## Usage

Right-click any file or folder in:
- The **Explorer** (file tree)
- The **editor body**
- An **editor tab** (title bar)

Then select **"Add to Claude Context"**.

## License

MIT — see [LICENSE](LICENSE).

---

<p align="center">Built by <a href="https://saasworks.io">Saasworks</a></p>
