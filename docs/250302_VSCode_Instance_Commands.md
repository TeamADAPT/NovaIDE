# VSCode Instance Commands
Version: 1.0.0
Date: 2025-03-02 14:25 MST
Author: Forge

## Quick Launch Commands

### Forge (Default Instance)
```bash
code /data-nova/ax/DevOps/DevOps-VSC/NovaIDE
```

### Vaeris (NovaOps Instance)
```bash
DISPLAY=:20 XAUTHORITY=/home/x/.Xauthority code \
  --user-data-dir=/home/x/.config/Code-Isolated/vaeris \
  --extensions-dir=/home/x/.vscode-isolated/vaeris/extensions \
  /data-nova/ax/NovaOps
```

### Theseus (DataOps Instance)
```bash
DISPLAY=:20 XAUTHORITY=/home/x/.Xauthority code \
  --user-data-dir=/home/x/.config/Code-Isolated/theseus \
  --extensions-dir=/home/x/.vscode-isolated/theseus/extensions \
  /data-nova/ax/DataOps
```
### Forge (DevOps-VSC Instance)
```bash
DISPLAY=:20 XAUTHORITY=/home/x/.Xauthority code \
  --user-data-dir=/home/x/.config/Code-Isolated/forge \
  --extensions-dir=/home/x/.vscode-isolated/forge/extensions \
  /data-nova/ax/DevOps/DevOps-VSC/NovaIDE
```




## Systemd Service Commands

### Start All Instances
```bash
sudo systemctl start vscode-instances.target
```

### Start Individual Instances
```bash
# Start GNOME Keyring
sudo systemctl start gnome-keyring.service

# Start NovaOps Instance
sudo systemctl start code-vaeris.service

# Start DataOps Instance
sudo systemctl start code-theseus.service
```

### Check Status
```bash
# Check all instances
sudo systemctl status vscode-instances.target

# Check individual services
sudo systemctl status gnome-keyring.service
sudo systemctl status code-vaeris.service
sudo systemctl status code-theseus.service
```

### Stop Services
```bash
# Stop all instances
sudo systemctl stop vscode-instances.target

# Stop individual instances
sudo systemctl stop code-vaeris.service
sudo systemctl stop code-theseus.service
sudo systemctl stop gnome-keyring.service
```

## Directory Structure
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

## Environment Variables
```bash
DISPLAY=:20
XAUTHORITY=/home/x/.Xauthority
```

## Notes
- Each instance has its own user data and extensions directory
- GNOME keyring service must be running for VSCode secrets
- Use systemd services for production environments
- Quick launch commands for development/testing

Last Updated: 2025-03-02 14:25 MST
Author: Forge