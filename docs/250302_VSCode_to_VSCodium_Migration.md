# VSCode to VSCodium Migration Plan
**Version**: 1.0.0
**Date**: 2025-03-02
**Author**: Forge

## Overview
This document outlines the migration strategy from our current VSCode team instances to the planned VSCodium development environment. It provides recommendations on agent setup, data migration, and configuration transfer.

## Migration Strategy

### Agent Setup
**Recommendation**: Set up agents in the new VSCodium environment rather than the current VSCode instances.

#### Rationale:
1. **Reduced Duplication**: Setting up agents once in the final environment avoids duplication of effort
2. **Environment Compatibility**: Agents configured for VSCodium will be properly initialized with the right paths and settings
3. **Dependency Management**: Agent dependencies can be installed directly in the target environment
4. **Configuration Cleanliness**: Prevents migration issues from mismatched configurations

### Data Migration Paths

#### Transferable Components:
- Agent configuration files (.json, .yml)
- Workspace settings (settings.json)
- Extension lists and configurations
- Project files and repositories
- MCP server configurations

#### Migration Tools:
1. **Key Synchronization**: Use vscode_key_sync.sh as a model for creating a VSCode-to-VSCodium key migration script
2. **Extension Transfer**: Create an extension export/import mechanism for the new environment
3. **Configuration Mapping**: Develop path remapping for configuration files to account for directory structure differences

## Implementation Plan

### Phase 1: Environment Setup
1. Setup base VSCodium installation
2. Configure isolated instances similar to current VSCode setup
3. Implement systemd services for VSCodium instances

### Phase 2: Tools Development
1. Create VSCode-to-VSCodium migration scripts
2. Test configuration transfer tools
3. Document migration procedures

### Phase 3: Agent Setup
1. Set up agents directly in VSCodium
2. Import necessary configurations from VSCode
3. Validate agent functionality

## Technical Considerations

### Environment Variables
- Ensure environment variables are properly set in VSCodium launch configurations
- Pay special attention to PATH, NODE_PATH, and custom agent variables

### File System Layout
- VSCodium uses a different root directory structure than VSCode
- Configuration paths must be updated accordingly

### Extension Compatibility
- Most VSCode extensions work in VSCodium, but some may require modification
- Extensions using proprietary services may need alternatives

## Recommendations

1. **Agent Setup**: Proceed with setting up agents in VSCodium rather than VSCode
2. **Configuration Transfer**: Develop automated tools to transfer configurations
3. **Incremental Testing**: Test one agent at a time in the new environment
4. **Documentation**: Maintain clear migration documentation

## Next Steps

1. Complete current VSCode instance setup
2. Begin VSCodium environment preparation
3. Develop migration tools
4. Document VSCodium-specific setup procedures