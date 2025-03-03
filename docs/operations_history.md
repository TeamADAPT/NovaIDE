# Operations History

## 2025-03-02 20:56 MST - VSCode to VSCodium Migration Plan
**Author**: Forge
**Status**: Planned
**Priority**: High

### Implementation
1. Created VSCode to VSCodium migration strategy:
   - Migration script for settings, extensions, and configs
   - Documentation for agent setup approach
   - Configuration transfer guidelines

2. Features:
   - Complete settings migration
   - API key transfer with secure permissions
   - Extension directory copying
   - MCP configuration transfer

3. Technical Details:
   - Script Path: src/migrations/vscodium_migrate.sh
   - Documentation: docs/250302_VSCode_to_VSCodium_Migration.md
   - Migration Strategy: Set up agents in final VSCodium environment

### Next Steps
1. Complete current VSCode instance setup
2. Begin VSCodium environment preparation
3. Develop migration tools
4. Document VSCodium-specific setup procedures

---

## 2025-03-02 20:05 MST - VSCode API Key Sync Implementation
**Author**: Forge
**Status**: Implemented
**Priority**: High

### Implementation
1. Created vscode_key_sync.sh script:
   - Manages API keys across instances
   - Centralizes key storage
   - Handles backups
   - Maintains secure permissions

2. Features:
   - Global key storage
   - Instance-specific backups
   - Key merging capability
   - Secure file permissions (600)

3. Technical Details:
   - Script Path: src/monitoring/vscode_key_sync.sh
   - Storage Location: ~/.config/Code/User/globalStorage/
   - Instance Paths:
     * Vaeris: ~/.config/Code-Isolated/vaeris/
     * Theseus: ~/.config/Code-Isolated/theseus/

### Next Steps
1. Run script on instances
2. Monitor key persistence
3. Test key synchronization
4. Document any issues

---

## 2025-03-02 20:01 MST - VSCode File Watcher Fix
**Author**: Forge
**Status**: Implemented
**Priority**: High

### Implementation
1. Created vscode_watcher_fix.sh script:
   - Manages watcher settings across instances
   - Updates exclude patterns
   - Checks system limits
   - Handles backups

2. Configuration:
   - Standard exclude patterns for all instances
   - System inotify limit check
   - Automatic settings backup
   - JSON validation

3. Technical Details:
   - Script Path: src/monitoring/vscode_watcher_fix.sh
   - Settings Location: ~/.config/Code-Isolated/{instance}/User/
   - Backup Creation: Automatic
   - Error Handling: Implemented

### Next Steps
1. Run script on instances
2. Monitor file watcher behavior
3. Adjust exclude patterns if needed
4. Document any remaining issues

---

## 2025-03-02 20:00 MST - VSCode Settings Configuration
**Author**: Forge
**Status**: Implemented
**Priority**: High

### Implementation
1. Created instance-specific settings:
   - Vaeris: Default Dark Modern theme
   - Theseus: Monokai theme
   - Each instance has isolated settings

2. Configuration:
   - User settings in ~/.config/Code-Isolated/{instance}/User/
   - Theme isolation working
   - File watcher settings applied
   - Command allowlist configured

3. Testing Results:
   - Theme isolation confirmed
   - Settings separation working
   - Different LLM models maintained
   - File watcher warnings noted

### Next Steps
1. Address file watcher warnings
2. Test extension state persistence
3. Monitor settings isolation
4. Document any issues

---

## 2025-03-02 12:57 MST - VSCode Keyring Integration
**Author**: Forge
**Status**: Implemented
**Priority**: High

### Implementation
1. Created systemd services for GNOME keyring and VSCode instances:
   - gnome-keyring.service: Keyring daemon
   - code-vaeris.service: NovaOps VSCode instance
   - code-theseus.service: DataOps VSCode instance
   - vscode-instances.target: Service orchestration

2. Service Dependencies:
   - VSCode instances depend on keyring service
   - All services require display server access
   - Unified target for service management

3. Documentation:
   - Setup guide: docs/250302_VSCode_Keyring_Setup.md
   - Service configurations in systemd/
   - Updated technical documentation

### Technical Details
- Environment Variables:
  * DISPLAY=:20
  * XAUTHORITY=/home/x/.Xauthority
- Service User: x
- Keyring Components: secrets
- Instance Paths:
  * Vaeris: /data-nova/ax/NovaOps
  * Theseus: /data-nova/ax/DataOps

### Next Steps
1. Deploy services
2. Monitor keyring stability
3. Test extension functionality
4. Document any issues

---

## 2025-03-02 12:52 MST - VSCode Keychain Issue Resolution
**Author**: Forge
**Status**: In Progress
**Priority**: High

### Issue
VSCode instances crashed after displaying GNOME keychain error message:
- Error occurred when launching VSCode with Roo extension
- Message indicated missing keychain in GNOME environment
- Both instances crashed after approximately 10 seconds

### Solution
Added DISABLE_KEYTAR=1 environment variable to VSCode launch command to bypass keychain requirement:
```bash
DISABLE_KEYTAR=1 code --user-data-dir=/home/x/.config/Code-Isolated/{instance} \
  --extensions-dir=/home/x/.vscode-isolated/{instance}/extensions \
  /data-nova/ax/{team_dir}
```

### Technical Details
- Environment: GNOME desktop
- VSCode Extension: rooveterinaryinc.roo-cline-3.7.11
- Instance Paths:
  * Vaeris: /data-nova/ax/NovaOps
  * Theseus: /data-nova/ax/DataOps

### Next Steps
1. Monitor VSCode stability with disabled keytar
2. Consider implementing alternative secret storage
3. Document keychain configuration for future setups

---

## 2025-03-02 12:43 MST - VSCode Team Instance Setup and Crash Investigation
**Author**: Forge
**Status**: In Progress
**Priority**: High

### Actions Taken
1. Created isolated VSCode instances for team directories:
   - Vaeris: /data-nova/ax/NovaOps
   - Theseus: /data-nova/ax/DataOps
2. Set up isolated extension directories:
   - /home/x/.vscode-isolated/vaeris/extensions
   - /home/x/.vscode-isolated/theseus/extensions
3. Copied Roo extension to isolated instances
4. Launched VSCode with team-specific configurations

### Issues Encountered
- VSCode instances crashed when attempting to add Roo extension
- Possible memory or extension loading issues
- Need to investigate crash logs and extension initialization

### Next Steps
1. Review VSCode crash logs
2. Consider implementing extension preload mechanism
3. Evaluate memory allocation settings
4. Add enhanced crash monitoring

### Technical Details
- Extension Path: rooveterinaryinc.roo-cline-3.7.11
- Launch Parameters:
  ```bash
  DISPLAY=:20 
  XAUTHORITY=/home/x/.Xauthority 
  --user-data-dir=/home/x/.config/Code-Isolated/{instance}
  --extensions-dir=/home/x/.vscode-isolated/{instance}/extensions
  --max-memory=3072
  ```

### Dependencies
- VSCode/VSCodium
- Roo Extension v3.7.11
- X11 Display Server

---