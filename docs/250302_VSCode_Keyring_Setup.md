# VSCode Keyring Setup Guide
Version: 1.0.0
Date: 2025-03-02 12:57 MST
Author: Forge

## Overview
This guide outlines the setup process for GNOME keyring integration with isolated VSCode instances.

## Prerequisites
1. GNOME keyring daemon
2. VSCode/VSCodium
3. Systemd

## Installation Steps

### 1. Install GNOME Keyring
```bash
sudo apt-get update
sudo apt-get install gnome-keyring libsecret-1-0 libsecret-1-dev
```

### 2. Service Files Setup
1. Copy service files to systemd user directory:
```bash
sudo cp systemd/gnome-keyring.service /etc/systemd/system/
sudo cp systemd/code-vaeris.service /etc/systemd/system/
sudo cp systemd/code-theseus.service /etc/systemd/system/
sudo cp systemd/vscode-instances.target /etc/systemd/system/
```

2. Reload systemd:
```bash
sudo systemctl daemon-reload
```

### 3. Enable Services
```bash
sudo systemctl enable gnome-keyring.service
sudo systemctl enable code-vaeris.service
sudo systemctl enable code-theseus.service
sudo systemctl enable vscode-instances.target
```

### 4. Start Services
```bash
sudo systemctl start vscode-instances.target
```

## Verification

### Check Service Status
```bash
systemctl status gnome-keyring.service
systemctl status code-vaeris.service
systemctl status code-theseus.service
systemctl status vscode-instances.target
```

### Verify Keyring
1. Launch VSCode instances
2. Check for keyring errors in logs:
```bash
journalctl -u gnome-keyring.service
journalctl -u code-vaeris.service
journalctl -u code-theseus.service
```

## Troubleshooting

### Common Issues

1. Keyring Not Starting
- Check DISPLAY environment variable
- Verify user permissions
- Check keyring daemon logs

2. VSCode Crashes
- Review crash logs
- Verify extension compatibility
- Check memory limits

3. Authentication Errors
- Reset keyring password
- Clear keyring data
- Verify libsecret installation

## Maintenance

### Regular Tasks
1. Monitor service logs
2. Check keyring status
3. Update VSCode extensions
4. Verify backup integrity

### Backup
1. Keyring data: ~/.local/share/keyrings/
2. VSCode settings: ~/.config/Code-Isolated/
3. Extensions: ~/.vscode-isolated/

## Security Notes
- Keyring stores sensitive data
- Keep system updated
- Monitor access logs
- Regular security audits

Last Updated: 2025-03-02 12:57 MST
Author: Forge