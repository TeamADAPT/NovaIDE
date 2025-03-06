# VSCodium Settings Management Quick Start Guide
Version: 1.0.0
Date: 2025-03-04 21:46 MST
Author: Forge

## Overview
This guide provides quick-start instructions for using the new VSCodium settings management system. The system provides centralized configuration management and automated synchronization for all Nova agent VSCodium instances.

## Quick Setup

### 1. Directory Structure
```bash
# Master settings location
/data-nova/00/master_settings/vscodium/
  ├── configs/         # Configuration files
  ├── profiles/        # Agent profiles
  ├── scripts/         # Management scripts
  ├── systemd/         # Service files
  ├── logs/           # Log files
  └── backups/        # Backup storage
```

### 2. Enable Automatic Sync
```bash
# Enable and start the sync timer
sudo systemctl enable vscodium-settings-sync.timer
sudo systemctl start vscodium-settings-sync.timer
```

### 3. Manual Sync
```bash
# Run sync manually
/data-nova/00/master_settings/vscodium/scripts/sync_settings.sh
```

## Common Tasks

### 1. Add New Agent
1. Edit `/data-nova/00/master_settings/vscodium/configs/nova_agents.json`:
```json
{
  "agents": {
    "new_agent": {
      "name": "New Agent",
      "role": "Role Description",
      "profile": "nova_base",
      "workspace": "/path/to/workspace",
      "extensions": {
        "additional": [
          "extension.id"
        ]
      },
      "settings_overrides": {
        "setting.name": "value"
      }
    }
  }
}
```

2. Run sync:
```bash
/data-nova/00/master_settings/vscodium/scripts/sync_settings.sh
```

### 2. Modify Settings

1. Base Settings (All Agents):
   - Edit `/data-nova/00/master_settings/vscodium/configs/base.json`

2. Profile Settings (Role-based):
   - Edit `/data-nova/00/master_settings/vscodium/profiles/[profile].json`

3. Agent Settings (Instance-specific):
   - Modify settings_overrides in nova_agents.json

### 3. Monitor Status

1. Check Service Status:
```bash
sudo systemctl status vscodium-settings-sync.service
sudo systemctl status vscodium-settings-sync.timer
```

2. View Logs:
```bash
# Current day's log
tail -f /data-nova/00/master_settings/vscodium/logs/sync_$(date +%Y%m%d).log
```

3. Check Backups:
```bash
ls -l /data-nova/00/master_settings/vscodium/backups/
```

## Troubleshooting

### 1. Sync Issues
```bash
# Check logs for errors
grep ERROR /data-nova/00/master_settings/vscodium/logs/sync_$(date +%Y%m%d).log

# Verify file permissions
ls -l /data-nova/00/master_settings/vscodium/scripts/sync_settings.sh
ls -l /home/x/.vscodium-isolated/
```

### 2. Settings Not Applying
1. Check agent configuration:
```bash
jq '.agents.[agent_name]' /data-nova/00/master_settings/vscodium/configs/nova_agents.json
```

2. Verify instance directory:
```bash
ls -la /home/x/.vscodium-isolated/[agent_name]/User/
```

### 3. Extension Issues
1. Check extension logs:
```bash
ls -l /home/x/.vscodium-isolated/[agent_name]/logs/
```

2. Verify extension installation:
```bash
ls -l /home/x/.vscodium-isolated/[agent_name]/extensions/
```

## Best Practices

### 1. Configuration Changes
- Test changes in isolation first
- Document all modifications
- Use version control
- Monitor for issues

### 2. Backup Management
- Keep regular backups
- Test restoration process
- Document changes
- Maintain history

### 3. Monitoring
- Check logs regularly
- Monitor sync status
- Verify configurations
- Track performance

## Reference Documentation

1. Full Documentation:
   - VSCodium Settings Management Summary
   - VSCodium Directory Structure
   - Settings Management Best Practices

2. Configuration Templates:
   - Base Settings Template
   - Profile Settings Template
   - Agent Configuration Template

3. Service Documentation:
   - Systemd Service Configuration
   - Sync Script Documentation
   - Monitoring Guide

## Support

### 1. Log Locations
- Sync Logs: `/data-nova/00/master_settings/vscodium/logs/`
- VSCodium Logs: `/home/x/.vscodium-isolated/[agent]/logs/`
- Service Logs: `journalctl -u vscodium-settings-sync`

### 2. Common Commands
```bash
# Force immediate sync
/data-nova/00/master_settings/vscodium/scripts/sync_settings.sh

# Check service status
sudo systemctl status vscodium-settings-sync.service

# View recent logs
tail -f /data-nova/00/master_settings/vscodium/logs/sync_$(date +%Y%m%d).log
```

### 3. File Locations
- Settings: `/data-nova/00/master_settings/vscodium/configs/`
- Profiles: `/data-nova/00/master_settings/vscodium/profiles/`
- Scripts: `/data-nova/00/master_settings/vscodium/scripts/`
- Backups: `/data-nova/00/master_settings/vscodium/backups/`