#!/bin/bash

# VSCode Persistent Configuration Script
# Version: 1.0.0
# Author: Forge
# Date: 2025-03-02

# Set strict error handling
set -euo pipefail
IFS=$'\n\t'

# Configuration paths
VSCODE_CONFIG_DIR="$HOME/.config/Code/User"
VSCODE_STORAGE_DIR="$HOME/.config/Code/User/globalStorage"
VSCODE_WORKSPACES_DIR="$HOME/.config/Code/Workspaces"

# Memory optimization settings
MEMORY_SETTINGS='{
    "files.useExperimentalFileWatcher": true,
    "files.watcherExclude": {
        "**/.git/objects/**": true,
        "**/.git/subtree-cache/**": true,
        "**/node_modules/**": true,
        "**/env/**": true,
        "**/venv/**": true,
        "**/.hg/store/**": true
    },
    "search.followSymlinks": false,
    "files.exclude": {
        "**/.git": true,
        "**/.svn": true,
        "**/.hg": true,
        "**/CVS": true,
        "**/.DS_Store": true,
        "**/Thumbs.db": true,
        "**/node_modules": true,
        "**/dist": true,
        "**/.cache": true
    }
}'

# Performance optimization settings
PERFORMANCE_SETTINGS='{
    "workbench.enableExperiments": false,
    "workbench.startupEditor": "none",
    "workbench.statusBar.visible": true,
    "workbench.tips.enabled": false,
    "workbench.tree.indent": 12,
    "workbench.view.alwaysShowHeaderActions": false,
    "editor.minimap.enabled": false,
    "editor.scrollBeyondLastLine": false,
    "editor.renderWhitespace": "selection",
    "editor.renderControlCharacters": false,
    "editor.renderLineHighlight": "line",
    "editor.suggestSelection": "first",
    "editor.snippetSuggestions": "top",
    "editor.suggest.localityBonus": true,
    "editor.suggest.shareSuggestSelections": true,
    "editor.suggest.maxVisibleSuggestions": 8
}'

# Extension optimization settings
EXTENSION_SETTINGS='{
    "extensions.autoCheckUpdates": false,
    "extensions.autoUpdate": false,
    "extensions.ignoreRecommendations": true,
    "extensions.showRecommendationsOnlyOnDemand": true,
    "npm.fetchOnlinePackageInfo": false,
    "npm.autoDetect": "off",
    "git.autofetch": false,
    "git.confirmSync": false,
    "git.enableSmartCommit": true
}'

# Create configuration directories if they don't exist
mkdir -p "$VSCODE_CONFIG_DIR"
mkdir -p "$VSCODE_STORAGE_DIR"
mkdir -p "$VSCODE_WORKSPACES_DIR"

# Apply memory optimizations
echo "$MEMORY_SETTINGS" > "$VSCODE_CONFIG_DIR/memory.json"

# Apply performance optimizations
echo "$PERFORMANCE_SETTINGS" > "$VSCODE_CONFIG_DIR/performance.json"

# Apply extension optimizations
echo "$EXTENSION_SETTINGS" > "$VSCODE_CONFIG_DIR/extensions.json"

# Set file permissions
chmod 644 "$VSCODE_CONFIG_DIR"/*.json

echo "VSCode persistent configuration applied successfully"