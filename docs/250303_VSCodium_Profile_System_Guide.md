# VSCodium Profile System Guide

**Version:** 1.0.0  
**Date:** March 3, 2025  
**Author:** Forge, DevOps Lead

## Overview

The VSCodium Profile System is a configuration management system for VSCodium instances that enables agent-specific settings, extensions, and resource allocations. This system allows for centralized management of configuration profiles while supporting inheritance and customization for different agent roles.

## Key Features

- **Profile Inheritance**: Profiles can extend other profiles to inherit settings
- **Agent-Specific Configurations**: Tailored settings for each agent's role
- **Resource Allocation**: Specify CPU, memory, and disk requirements
- **Extension Management**: Define required and recommended extensions
- **API Key Management**: Securely store and manage API keys
- **Centralized Management**: Manage all profiles from a single location

## Directory Structure

```
config/vscodium_profiles/
├── base.json           # Base profile with common settings
├── forge.json          # Profile for Forge (VSCode/VSCodium Developer)
├── vaeris.json         # Profile for Vaeris (Chief Operations Officer)
├── theseus.json        # Profile for Theseus (Head of DataOps)
└── ...                 # Additional agent profiles
```

## Profile Format

Each profile is a JSON file with the following structure:

```json
{
  "profile": {
    "name": "Profile Name",
    "description": "Profile description",
    "version": "1.0.0",
    "author": "Author Name",
    "lastUpdated": "YYYY-MM-DD",
    "extends": "base"  // Optional, name of parent profile
  },
  "settings": {
    // VSCodium settings to apply
    "window.title": "Agent Name - ${activeEditorShort}${separator}${rootName}",
    "workbench.colorTheme": "Default Dark+",
    // ... more settings
  },
  "resources": {
    "cpu": 8,       // CPU cores
    "memory": 32,   // Memory in GB
    "disk": 50      // Disk space in GB
  },
  "extensions": {
    "required": [
      // Extensions that must be installed
      "rooveterinaryinc.roo-cline"
    ],
    "recommended": [
      // Extensions that are recommended but not required
      "dbaeumer.vscode-eslint"
    ]
  },
  "api_keys": {
    // API keys for the agent
    "ANTHROPIC_API_KEY": "sk-ant-...",
    "OPENAI_API_KEY": "sk-..."
  }
}
```

## Profile Inheritance

Profiles can extend other profiles using the `extends` property. When a profile extends another profile, it inherits all settings, resources, extensions, and API keys from the parent profile. The child profile can then override or extend these values.

For example, if `forge.json` extends `base.json`, it will inherit all settings from `base.json` and can override or add new settings.

## Usage

### Creating a New Profile

1. Create a new JSON file in the `config/vscodium_profiles/` directory
2. Use the profile format shown above
3. Set the `extends` property to inherit from an existing profile
4. Customize settings, resources, extensions, and API keys as needed

### Applying a Profile

The profile system is integrated with the `launch_agent_vscodium.sh` script. When you launch a VSCodium instance for an agent, the script will automatically apply the appropriate profile based on the agent name.

```bash
./scripts/launch_agent_vscodium.sh Forge /data-nova/ax/DevOps/DevOps-VSC/NovaIDE
```

This will:
1. Look for a profile named `forge.json` (lowercase)
2. If found, apply the profile to the VSCodium instance
3. If not found, use the base profile

### Manual Profile Application

You can also manually apply a profile using the `vscodium_profile_manager.sh` script:

```bash
./scripts/vscodium_profile_manager.sh Forge /home/x/.vscodium-isolated/Forge
```

This will apply the `forge.json` profile to the specified user data directory.

## Profile Customization

### Agent-Specific Settings

Each agent profile should include settings specific to their role. For example:

- **Forge (VSCode/VSCodium Developer)**:
  - Development-focused extensions
  - Code editor optimizations
  - Git integration
  - Higher resource allocation for development tasks

- **Vaeris (Chief Operations Officer)**:
  - Operations-focused extensions
  - Infrastructure visualization tools
  - Monitoring integrations
  - Balanced resource allocation

- **Theseus (Head of DataOps)**:
  - Data-focused extensions
  - Python and Jupyter support
  - Database tools
  - Higher disk allocation for data processing

### Common Settings

The base profile includes common settings that apply to all agents:

- Window title format
- Basic editor settings
- Memory system configuration
- API keys
- Common extensions

## Best Practices

1. **Keep the Base Profile Minimal**: Include only essential settings in the base profile
2. **Use Inheritance**: Create specialized profiles that extend the base profile
3. **Document Profiles**: Include clear descriptions and version information
4. **Manage API Keys Centrally**: Store API keys in a central location
5. **Regular Updates**: Update profiles as agent roles evolve
6. **Version Control**: Track profile changes in version control
7. **Test Profiles**: Test profiles before deploying to production

## Troubleshooting

### Profile Not Applied

If a profile is not being applied correctly:

1. Check that the profile file exists in the `config/vscodium_profiles/` directory
2. Verify that the profile name matches the agent name (case-insensitive)
3. Check for JSON syntax errors in the profile file
4. Look for error messages in the console output

### Settings Not Applied

If specific settings are not being applied:

1. Check that the settings are correctly formatted in the profile
2. Verify that the settings are not being overridden by a higher-priority source
3. Check for conflicts with existing settings

### Extensions Not Installed

If required extensions are not being installed:

1. Verify that the extensions are correctly listed in the profile
2. Check that the extension IDs are correct
3. Ensure that the extensions are available in the marketplace

## Future Enhancements

1. **Profile Validation**: Automated validation of profile format and settings
2. **Profile UI**: Web-based UI for managing profiles
3. **Profile Templates**: Pre-defined templates for common agent roles
4. **Profile Versioning**: Track changes to profiles over time
5. **Profile Analytics**: Analyze profile usage and effectiveness
6. **Profile Sharing**: Share profiles between teams and organizations
7. **Profile Migration**: Migrate profiles between environments

## Conclusion

The VSCodium Profile System provides a powerful way to manage agent-specific configurations for VSCodium instances. By centralizing configuration management and supporting inheritance, it enables efficient and consistent configuration across all agents while allowing for customization based on agent roles and responsibilities.