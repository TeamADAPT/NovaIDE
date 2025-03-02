# Technical Context

## Technology Stack

### Core Components
1. VSCode/VSCodium
   - Version: Latest stable
   - Extensions: Roo v3.7.11
   - Memory limit: 3072MB
   - Display server: X11

2. GNOME Keyring
   - Components: secrets
   - Integration: libsecret
   - Authentication: PAM
   - Storage: encrypted

3. Systemd Services
   - Process management
   - Service orchestration
   - Resource control
   - State monitoring

### Infrastructure
1. Display Server
   - X11/Xorg
   - DISPLAY=:20
   - XAUTHORITY path
   - Window management

2. File System
   - User data: ~/.config/Code-Isolated/
   - Extensions: ~/.vscode-isolated/
   - Workspaces: /data-nova/ax/
   - Keyring: ~/.local/share/keyrings/

3. Process Management
   - Systemd units
   - Service dependencies
   - Resource limits
   - Restart policies

## Development Setup

### Environment Variables
```bash
DISPLAY=:20
XAUTHORITY=/home/x/.Xauthority
```

### Directory Structure
```
/home/x/
├── .config/Code-Isolated/
│   ├── vaeris/
│   └── theseus/
└── .vscode-isolated/
    ├── vaeris/extensions/
    └── theseus/extensions/

/data-nova/ax/
├── NovaOps/
└── DataOps/
```

### Service Configuration
```
/etc/systemd/system/
├── gnome-keyring.service
├── code-vaeris.service
├── code-theseus.service
└── vscode-instances.target
```

## Technical Constraints

### Resource Limits
1. Memory
   - VSCode: 3072MB per instance
   - Extensions: Shared allocation
   - Keyring: System default

2. Process
   - One instance per team
   - Isolated extension spaces
   - Shared display server
   - Independent workspaces

### Security
1. Authentication
   - Keyring integration
   - PAM configuration
   - Secret storage
   - Access control

2. Isolation
   - Process separation
   - Extension sandboxing
   - Workspace boundaries
   - Resource limits

### Performance
1. Startup
   - Service dependencies
   - Extension loading
   - Resource allocation
   - State initialization

2. Runtime
   - Memory management
   - Process monitoring
   - Crash recovery
   - Resource optimization

## Integration Requirements

### Service Dependencies
1. Display Server
   - X11 availability
   - Window management
   - Resource sharing
   - Access control

2. Authentication
   - GNOME keyring
   - Secret storage
   - PAM modules
   - Access tokens

3. File System
   - Directory permissions
   - Path isolation
   - Workspace access
   - Configuration files

### Monitoring
1. Service Health
   - Process status
   - Resource usage
   - Error logging
   - Performance metrics

2. Integration Points
   - Keyring status
   - Extension health
   - Workspace access
   - Resource allocation

Last Updated: 2025-03-02 12:58 MST
Author: Forge