# NovaIDE Project Directory Structure
Version: 1.0.0
Date: 2025-03-04 22:57 MST
Author: Forge

## Overview
This repository contains the NovaIDE development environment, including VSCodium integration, MyCoderAI components, and supporting infrastructure.

## Directory Structure

### Projects
```
projects/
├── MyCoderAI_1.0/          # Original NovaIDE implementation
│   ├── docs/               # NovaIDE documentation
│   └── nova-ide-manager/   # IDE management system
│
└── MyCoderAI_2.0/          # Next generation implementation
    └── docs/               # MyCoderAI 2.0 documentation
```

### VSCodium Integration
```
vscodium/
├── configs/                # VSCodium configuration files
│   ├── base.json          # Base settings
│   ├── settings.json      # Global settings
│   └── profiles/          # Agent-specific profiles
├── docs/                  # VSCodium documentation
│   ├── master_settings/   # Settings management docs
│   └── best_practices/    # Best practices guides
├── scripts/              # VSCodium management scripts
│   ├── launch_*.sh       # Instance launch scripts
│   ├── setup_*.sh        # Setup scripts
│   └── vscodium_*.sh     # Utility scripts
└── systemd/             # Systemd service files
```

### Archive
```
archive/
├── config/              # Legacy configuration files
├── docs/               # Historical documentation
│   ├── best_practices/ # Legacy best practices
│   ├── core/          # Core documentation
│   ├── decisions/     # Decision records
│   └── versions/      # Document versions
├── scripts/           # Legacy scripts
└── systemd/          # Legacy service files
```

### Memory Bank
```
cline_docs/
├── activeContext.md    # Current work context
├── evolution/         # Evolution tracking
├── history/          # Operation history
├── productContext.md  # Project purpose
├── progress.md       # Status tracking
├── systemPatterns.md # Architecture patterns
└── techContext.md    # Technical setup
```

## Key Components

### 1. VSCodium Integration
- Settings management system
- Agent profile management
- Instance isolation
- Automated synchronization

### 2. MyCoderAI Components
- NovaIDE (1.0) implementation
- MyCoderAI (2.0) development
- IDE management tools
- Integration systems

### 3. Documentation
- Technical documentation
- Best practices guides
- Implementation guides
- Architecture documentation

### 4. Scripts
- Instance management
- Setup automation
- Monitoring tools
- Utility scripts

## Usage

### VSCodium Management
```bash
# Launch VSCodium instance
vscodium/scripts/launch_agent_vscodium.sh [agent_name]

# Sync settings
vscodium/scripts/sync_settings.sh

# Setup new instance
vscodium/scripts/setup_vscodium_complete.sh [agent_name]
```

### Documentation
- VSCodium settings: vscodium/docs/
- Implementation guides: projects/MyCoderAI_*/docs/
- Best practices: vscodium/docs/best_practices/

## Development

### Directory Guidelines
1. Keep projects separated in projects/
2. VSCodium files in vscodium/
3. Archive old files in archive/
4. Maintain clear documentation

### File Organization
1. Use semantic versioning
2. Follow naming conventions
3. Maintain directory structure
4. Update documentation

## Maintenance

### Regular Tasks
1. Update documentation
2. Archive old files
3. Maintain scripts
4. Review configurations

### Best Practices
1. Follow directory structure
2. Update documentation
3. Use version control
4. Maintain isolation