# Operations History

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