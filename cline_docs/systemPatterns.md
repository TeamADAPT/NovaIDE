# System Patterns

## Architecture Patterns

### VSCode Instance Isolation
- Separate user data directories
  * Vaeris: /home/x/.config/Code-Isolated/vaeris
  * Theseus: /home/x/.config/Code-Isolated/theseus

- Isolated extension directories
  * Vaeris: /home/x/.vscode-isolated/vaeris/extensions
  * Theseus: /home/x/.vscode-isolated/theseus/extensions

### Team Workspace Organization
- Team-specific directories
  * NovaOps: /data-nova/ax/NovaOps
  * DataOps: /data-nova/ax/DataOps

### Resource Management
- Memory limits: 3072MB per instance
- Extension loading controls
- Crash recovery mechanisms

## Technical Decisions

### Extension Management
1. Copy approach vs. symlink
   - Decision: Direct copy of extensions
   - Rationale: Better isolation, prevents shared state issues
   - Impact: Higher disk usage, but cleaner separation

2. Memory Configuration
   - Setting: --max-memory=3072
   - Purpose: Prevent memory exhaustion
   - Status: Under evaluation due to crashes

3. Display Configuration
   - DISPLAY=:20
   - XAUTHORITY=/home/x/.Xauthority
   - Purpose: Consistent X11 access

## Integration Points

### Extension Integration
- Roo Extension (v3.7.11)
  * Source: /home/x/.vscode/extensions/
  * Target: Isolated extension directories
  * Status: Experiencing stability issues

### System Services
- X11 Display Server
- VSCode/VSCodium base installation
- Team workspace mounts

## Evolution Paths

### Current State
- Basic workspace isolation
- Extension copying mechanism
- Resource limits implemented

### Next Evolution
1. Stable extension integration
2. Automated crash recovery
3. Enhanced monitoring
4. Resource optimization

### Future Considerations
1. Dynamic resource allocation
2. Extension preloading
3. Workspace templates
4. Team-specific configurations

Last Updated: 2025-03-02 12:44 MST
Author: Forge