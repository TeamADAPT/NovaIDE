#!/bin/bash

# VSCode to VSCodium Migration Tool
# Version: 1.0.0
# Author: Forge
# Date: 2025-03-02

# Configuration paths
VSCODE_CONFIG_ROOT="/home/x/.config/Code"
VSCODIUM_CONFIG_ROOT="/home/x/.config/VSCodium"
VSCODE_ISOLATED_ROOT="/home/x/.config/Code-Isolated"
VSCODIUM_ISOLATED_ROOT="/home/x/.config/VSCodium-Isolated"
EXTENSIONS_VSCODE="/home/x/.vscode-isolated"
EXTENSIONS_VSCODIUM="/home/x/.vscodium-isolated"

# Ensure target directories exist
mkdir -p "$VSCODIUM_CONFIG_ROOT/User/globalStorage"
mkdir -p "$VSCODIUM_ISOLATED_ROOT/vaeris/User/globalStorage"
mkdir -p "$VSCODIUM_ISOLATED_ROOT/theseus/User/globalStorage"
mkdir -p "$EXTENSIONS_VSCODIUM/vaeris/extensions"
mkdir -p "$EXTENSIONS_VSCODIUM/theseus/extensions"

# Function to migrate settings
migrate_settings() {
    local source=$1
    local target=$2
    
    echo "Migrating settings from $source to $target"
    
    # Copy and validate settings.json
    if [ -f "$source/settings.json" ]; then
        cp "$source/settings.json" "$target/settings.json"
        echo "- Settings migrated"
    else
        echo "- No settings.json found in $source"
    fi
    
    # Copy keybindings
    if [ -f "$source/keybindings.json" ]; then
        cp "$source/keybindings.json" "$target/keybindings.json"
        echo "- Keybindings migrated"
    fi
    
    # Copy snippets
    if [ -d "$source/snippets" ]; then
        mkdir -p "$target/snippets"
        cp -r "$source/snippets/"* "$target/snippets/"
        echo "- Snippets migrated"
    fi
}

# Function to migrate API keys
migrate_keys() {
    local source=$1
    local target=$2
    
    echo "Migrating API keys from $source to $target"
    
    # Copy API keys
    if [ -f "$source/globalStorage/api-keys.json" ]; then
        cp "$source/globalStorage/api-keys.json" "$target/globalStorage/api-keys.json"
        chmod 600 "$target/globalStorage/api-keys.json"
        echo "- API keys migrated (secure permissions set)"
    fi
}

# Function to migrate MCP settings
migrate_mcp() {
    local source_dir="$VSCODE_CONFIG_ROOT/User/globalStorage/rooveterinaryinc.roo-cline/settings"
    local target_dir="$VSCODIUM_CONFIG_ROOT/User/globalStorage/rooveterinaryinc.roo-cline/settings"
    
    mkdir -p "$target_dir"
    
    echo "Migrating MCP settings"
    if [ -f "$source_dir/cline_mcp_settings.json" ]; then
        cp "$source_dir/cline_mcp_settings.json" "$target_dir/cline_mcp_settings.json"
        echo "- MCP settings migrated"
    fi
}

# Function to migrate extensions
migrate_extensions() {
    local source_dir=$1
    local target_dir=$2
    
    echo "Migrating extensions from $source_dir to $target_dir"
    
    if [ -d "$source_dir" ]; then
        # Create list of installed extensions
        if [ -d "$source_dir" ]; then
            find "$source_dir" -maxdepth 1 -type d | tail -n +2 > /tmp/extensions_list.txt
            
            # Copy each extension to the target directory
            while read extension; do
                ext_name=$(basename "$extension")
                echo "- Migrating extension: $ext_name"
                
                if [ -d "$extension" ]; then
                    mkdir -p "$target_dir/$ext_name"
                    cp -r "$extension/"* "$target_dir/$ext_name/"
                fi
            done < /tmp/extensions_list.txt
            
            rm /tmp/extensions_list.txt
        fi
    else
        echo "No extensions directory found at $source_dir"
    fi
}

# Function to migrate instance settings
migrate_instance() {
    local instance=$1
    
    echo ""
    echo "===== Migrating $instance instance ====="
    
    # Migrate main settings
    migrate_settings "$VSCODE_ISOLATED_ROOT/$instance/User" "$VSCODIUM_ISOLATED_ROOT/$instance/User"
    
    # Migrate API keys
    migrate_keys "$VSCODE_ISOLATED_ROOT/$instance/User" "$VSCODIUM_ISOLATED_ROOT/$instance/User"
    
    # Migrate extensions
    migrate_extensions "$EXTENSIONS_VSCODE/$instance/extensions" "$EXTENSIONS_VSCODIUM/$instance/extensions"
}

# Main execution
echo "VSCode to VSCodium Migration"
echo "==========================="

# Migrate global settings
echo ""
echo "===== Migrating global settings ====="
migrate_settings "$VSCODE_CONFIG_ROOT/User" "$VSCODIUM_CONFIG_ROOT/User"
migrate_keys "$VSCODE_CONFIG_ROOT/User" "$VSCODIUM_CONFIG_ROOT/User"
migrate_mcp

# Migrate instance configurations
migrate_instance "vaeris"
migrate_instance "theseus"

echo ""
echo "Migration complete. Please verify the migrated configurations before launching VSCodium."
echo "To launch VSCodium instances, use the equivalent command patterns provided in the VSCode instance documentation."