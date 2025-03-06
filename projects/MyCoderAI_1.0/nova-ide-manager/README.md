# Nova IDE Manager - Modular Architecture

*Version: 1.0.0*  
*Date: 2025-03-02*  
*Author: Forge, DevOps Lead*

## Overview

Nova IDE Manager is a modular, component-based solution for managing multiple isolated VSCode/VSCodium instances. This architecture replaces the previous monolithic script with a set of reusable, maintainable modules that can be extended independently.

## Directory Structure

```
scripts/
  └── launch_forge_manual.sh             # Legacy wrapper for backward compatibility
  └── nova-ide-manager/                  # Main package
      ├── nova-ide-manager.sh            # Main script
      ├── README.md                      # Documentation
      └── lib/                           # Library modules
          ├── common.sh                  # Common utilities and variables
          ├── config.sh                  # Configuration management
          ├── ui.sh                      # User interface components
          └── instance.sh                # Instance management
```

## Module System

The Nova IDE Manager follows a modular design with these components:

1. **common.sh**: Core utilities, constants, and shared functions
   - Color definitions
   - Module loading mechanism 
   - Utility functions
   - System detection

2. **config.sh**: Configuration management
   - Load/save instance configurations
   - Adding/removing instances
   - Config file handling

3. **ui.sh**: Text-based user interface
   - Header and logo display
   - System resource monitoring
   - Menu rendering
   - Interactive dialogs

4. **instance.sh**: VSCode instance management
   - Launch instances with proper isolation
   - Sync settings and extensions
   - Handle Roo extension integration
   - Resource management

5. **nova-ide-manager.sh**: Main orchestration script
   - Command-line argument processing
   - Interactive mode handling
   - Module coordination

## Key Benefits

1. **Maintainability**: Each module has a single responsibility, making the code easier to understand and modify
2. **Testability**: Modules can be tested independently
3. **Extensibility**: New functionality can be added with minimal changes to existing code
4. **Reusability**: Common functions and utilities can be shared across modules
5. **Readability**: Smaller, focused files are easier to navigate and understand

## Module Dependencies

```
nova-ide-manager.sh
  └── common.sh
  └── config.sh (depends on common.sh)
  └── ui.sh (depends on common.sh) 
  └── instance.sh (depends on common.sh)
```

All modules depend on common.sh, which provides the foundational utilities. The main script combines all modules to create the complete application.

## Usage

### Interactive Mode

```bash
./scripts/launch_forge_manual.sh
```

### Command Line Arguments

```bash
# Launch a specific instance
./scripts/launch_forge_manual.sh --instance forge

# List available instances
./scripts/launch_forge_manual.sh --list

# Launch with specific settings
./scripts/launch_forge_manual.sh --instance forge --no-settings --no-extensions

# Terminate an instance
./scripts/launch_forge_manual.sh --terminate forge
```

## Extending the System

### Adding a New Module

1. Create a new file in the `lib/` directory
2. Include module dependency checking
3. Implement the module's functionality
4. Mark the module as loaded
5. Update the main script to load your module

Example:

```bash
#!/bin/bash
# Check if common module is loaded
if ! type module_loaded &>/dev/null || ! module_loaded "common"; then
  echo "Error: common module must be loaded first"
  exit 1
fi

# Implement your module functionality here

# Mark this module as loaded
mark_module_loaded "your_module_name"
```

### Adding New Features

To add new features:

1. Identify which module should contain the feature
2. Add the feature to the appropriate module
3. Update any interfaces or dependencies as needed
4. Update documentation

## Best Practices

1. **Module Isolation**: Keep modules focused on a single responsibility
2. **Dependency Management**: Explicitly check and require dependencies
3. **Error Handling**: Provide clear error messages and graceful failure
4. **Documentation**: Document public functions and interfaces
5. **Version Control**: Update version numbers when making significant changes

## Future Development

Planned enhancements:

1. GUI Interface using Electron
2. Remote instance management via SSH
3. Extension management with fine-grained control
4. Configuration profiles for different use cases
5. Integration with source control systems

## License

MIT License

## Contact

For support or contributions, contact:
- Stream: devops.team.communication
- Group: devops_forge_primary