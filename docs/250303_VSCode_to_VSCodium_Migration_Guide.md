# VSCode to VSCodium Migration Guide

**Version:** 1.0.0  
**Last Updated:** March 3, 2025, 05:10 MST  
**Author:** Forge, Lead VSCode Developer

## Overview

This guide documents the process of migrating VSCode settings, extensions, and API keys to VSCodium for the NovaIDE project. The migration is handled by the `migrate_to_vscodium.sh` script, which automates the process for multiple users.

## Migration Components

The migration process includes:

1. **User Settings**
   - settings.json
   - keybindings.json
   - snippets
   - globalStorage
   - workspaceStorage

2. **Extensions**
   - All installed extensions
   - Special handling for Roo extension
   - Extension configurations

3. **API Keys**
   - Extraction from settings.json
   - Preservation of key values
   - Secure transfer to VSCodium

## Prerequisites

- VSCode instances with configured settings
- VSCodium binary available (built or downloaded)
- Proper directory structure for isolated instances

## Migration Process

### Automated Migration

The `migrate_to_vscodium.sh` script automates the migration process for multiple users:

```bash
# Migrate settings for all default users (forge, vaeris, theseus)
./scripts/migrate_to_vscodium.sh

# Migrate settings for specific users
./scripts/migrate_to_vscodium.sh forge vaeris

# Explicitly migrate all default users
./scripts/migrate_to_vscodium.sh --all
```

### Manual Migration

If you prefer to migrate settings manually:

1. Copy VSCode user data directory to VSCodium:
   ```bash
   cp -r ~/.config/Code-Isolated/[user]/ ~/.vscodium-isolated/[user]/
   ```

2. Copy VSCode extensions to VSCodium:
   ```bash
   cp -r ~/.vscode-isolated/[user]/extensions/ ~/.vscodium-isolated/[user]/extensions/
   ```

3. Update extensions.json to include Roo extension:
   ```json
   [
     "rooveterinaryinc.roo-cline",
     ...other extensions
   ]
   ```

## Directory Structure

The migration script uses the following directory structure:

- VSCode User Data: `/home/x/.config/Code-Isolated/[user]/`
- VSCode Extensions: `/home/x/.vscode-isolated/[user]/extensions/`
- VSCodium User Data: `/home/x/.vscodium-isolated/[user]/`
- VSCodium Extensions: `/home/x/.vscodium-isolated/[user]/extensions/`

## Special Handling for Roo Extension

The Roo extension requires special handling during migration:

1. Copy the extension files from VSCode to VSCodium
2. Ensure extensions.json includes "rooveterinaryinc.roo-cline"
3. Copy MCP settings from VSCode to VSCodium
4. Ensure API keys are properly transferred

## API Key Migration

API keys are extracted from VSCode settings.json and added to VSCodium settings.json:

1. Keys are identified by pattern matching (e.g., `*_API_KEY`)
2. Values are preserved exactly as they appear in VSCode
3. Keys are added to VSCodium settings.json, replacing existing values if present

## Launching VSCodium with Migrated Settings

After migration, launch VSCodium with the migrated settings:

```bash
./scripts/launch_vscodium.sh [user] [working_directory]
```

Example:
```bash
./scripts/launch_vscodium.sh forge /data-nova/ax/DevOps/DevOps-VSC/NovaIDE
```

## Troubleshooting

### Missing Settings

If settings are not properly migrated:

1. Check source directories exist:
   ```bash
   ls -la /home/x/.config/Code-Isolated/[user]/
   ls -la /home/x/.vscode-isolated/[user]/extensions/
   ```

2. Verify destination directories:
   ```bash
   ls -la /home/x/.vscodium-isolated/[user]/
   ls -la /home/x/.vscodium-isolated/[user]/extensions/
   ```

3. Run migration with verbose output:
   ```bash
   bash -x ./scripts/migrate_to_vscodium.sh [user]
   ```

### Extension Issues

If extensions are not working properly:

1. Check extensions.json includes the extension:
   ```bash
   cat /home/x/.vscodium-isolated/[user]/extensions/extensions.json
   ```

2. Verify extension files were copied:
   ```bash
   ls -la /home/x/.vscodium-isolated/[user]/extensions/
   ```

3. Try reinstalling the extension in VSCodium

### API Key Issues

If API keys are not properly migrated:

1. Check VSCode settings.json for API keys:
   ```bash
   grep -o '"[A-Za-z0-9_]*_API_KEY": "[^"]*"' /home/x/.config/Code-Isolated/[user]/User/settings.json
   ```

2. Verify VSCodium settings.json contains the keys:
   ```bash
   grep -o '"[A-Za-z0-9_]*_API_KEY": "[^"]*"' /home/x/.vscodium-isolated/[user]/User/settings.json
   ```

3. Manually add missing keys to VSCodium settings.json

## Next Steps

After successful migration:

1. Test VSCodium with migrated settings
2. Verify extensions work properly
3. Confirm API keys are functioning
4. Set up systemd services for VSCodium instances