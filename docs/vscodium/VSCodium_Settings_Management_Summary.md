# VSCodium Settings Management System
Version: 1.0.0
Date: 2025-03-04 21:46 MST
Author: Forge

## Overview
This document summarizes the new centralized settings management system for VSCodium instances across the Nova agent fleet. The system provides consistent configuration, automated synchronization, and proper isolation between instances.

## Directory Structure

### Master Settings (/data-nova/00/master_settings/vscodium/)
```
vscodium/
├── configs/           # Configuration files
│   ├── base.json     # Base settings
│   ├── nova_agents.json  # Agent definitions
│   └── profiles/     # Role-specific settings
├── profiles/         # Agent profile definitions
├── scripts/         # Management scripts
│   └── sync_settings.sh  # Settings sync script
├── systemd/         # Systemd service files
│   ├── vscodium-settings-sync.service
│   └── vscodium-settings-sync.timer
├── logs/            # Centralized logging
└── backups/         # Settings backups
```

### Instance Settings (/home/x/.vscodium-isolated/)
```
.vscodium-isolated/
└── [agent-name]/     # Per-agent isolated environment
    ├── User/
    │   ├── settings.json
    │   └── globalStorage/
    └── extensions/
```

## Components

### 1. Configuration Files
- **base.json**: Universal settings for all instances
- **nova_agents.json**: Agent definitions and configurations
- **[profile].json**: Role-specific settings profiles

### 2. Management Scripts
- **sync_settings.sh**: Core synchronization script
  - Backs up current settings
  - Applies base configuration
  - Applies profile settings
  - Applies agent-specific overrides
  - Syncs extensions
  - Maintains logs

### 3. Systemd Services
- **vscodium-settings-sync.service**: Settings sync service
- **vscodium-settings-sync.timer**: Automated sync scheduler
  - Runs every 15 minutes
  - Includes randomized delay
  - Starts 5 minutes after boot

## Settings Hierarchy

1. Base Settings (Lowest)
   - Universal configurations
   - Core editor settings
   - Common preferences

2. Profile Settings (Middle)
   - Role-specific settings
   - Extension configurations
   - Workflow customizations

3. Agent Settings (Highest)
   - Instance-specific overrides
   - Custom configurations
   - Local preferences

## Features

### 1. Automated Synchronization
- Periodic settings sync (15-minute intervals)
- Backup creation before changes
- Detailed logging
- Error handling and recovery

### 2. Extension Management
- Centralized extension control
- Version-locked extensions
- Profile-specific extensions
- Automatic installation

### 3. Security
- Process isolation
- Strict file permissions
- Secure backup system
- Audit logging

### 4. Monitoring
- Real-time sync status
- Error detection
- Performance tracking
- Configuration validation

## Usage

### 1. Manual Sync
```bash
/data-nova/00/master_settings/vscodium/scripts/sync_settings.sh
```

### 2. Service Management
```bash
# Enable automatic sync
sudo systemctl enable vscodium-settings-sync.timer
sudo systemctl start vscodium-settings-sync.timer

# Check status
sudo systemctl status vscodium-settings-sync.service
```

### 3. Log Viewing
```bash
# View sync logs
tail -f /data-nova/00/master_settings/vscodium/logs/sync_$(date +%Y%m%d).log
```

## Best Practices

### 1. Configuration Changes
- Test changes in isolation
- Update base settings first
- Document all modifications
- Monitor for issues

### 2. Profile Management
- Keep profiles role-focused
- Test profile changes
- Document dependencies
- Regular reviews

### 3. Extension Management
- Version lock extensions
- Test compatibility
- Document requirements
- Regular updates

### 4. Monitoring
- Check logs regularly
- Monitor sync status
- Verify configurations
- Track performance

## Maintenance

### 1. Regular Tasks
- Log rotation
- Backup cleanup
- Configuration review
- Extension updates

### 2. Troubleshooting
- Check sync logs
- Verify file permissions
- Validate configurations
- Test in isolation

### 3. Recovery
- Use backup restoration
- Verify file integrity
- Test functionality
- Document incidents

## References
1. VSCodium Directory Structure (/docs/vscodium/master_settings/VSCodium_Directory_Structure.md)
2. Settings Management Best Practices (/docs/vscodium/best_practices/Settings_Management_Best_Practices.md)
3. Settings Incident Report (/docs/vscodium/master_settings/VSCodium_Settings_Incident_250304.md)