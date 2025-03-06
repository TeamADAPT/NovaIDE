# User Preferences Feature

## Overview
**Date:** 2025-03-02
**Author:** Forge, DevOps Lead
**Version:** 1.0.0

This document outlines the implementation of user preferences in the Nova IDE Manager, with initial support for custom user name settings. This feature enhances the personalization of the IDE environment and improves the user experience by providing consistent addressing in interfaces.

## Rationale

The Nova IDE Manager currently supports robust instance management but lacks personalization options. Adding user preferences will:

1. Improve user experience by providing personalized interaction
2. Set foundation for future preference-based customizations
3. Create consistent addressing across all interfaces (CLI, potential GUI)
4. Support team-based customization when multiple developers share the environment

## Implementation Details

### Technical Approach

1. **Configuration Storage**:
   - Extend the existing configuration system in `config.sh`
   - Create a dedicated user preferences section in the config file
   - Store in standardized location at `$CONFIG_DIR/user_prefs.conf`

2. **API Design**:
   - Add functions for getting/setting user preferences
   - Ensure backward compatibility with existing scripts
   - Use consistent naming conventions

3. **Default Settings**:
   - Default user name: "Chase"
   - Create automatic initialization for first-time use

### Module Changes

The implementation will extend the `config.sh` module with:

```bash
# User preferences functions
function get_user_name() {
  # Return the configured user name or default
}

function set_user_name() {
  # Set and persist the user name
}

function load_user_preferences() {
  # Load all user preferences from config file
}

function save_user_preferences() {
  # Save all user preferences to config file
}
```

### Usage Examples

In CLI interfaces:
```bash
# Setting user name
./nova-ide-manager.sh set-username "Chase"

# Using user name in output
echo "Hello, $(get_user_name)! Your VSCode instances are ready."
```

In UI module:
```bash
# Welcome message using user name
function display_welcome() {
  local user_name=$(get_user_name)
  echo -e "${GREEN}Welcome back, ${WHITE}${user_name}${GREEN}!${NC}"
  # Rest of welcome message
}
```

## Integration Points

1. **UI Module**:
   - Update all user-facing messages to use the custom name
   - Add menu option for changing preferences

2. **Instance Module**:
   - Pass user preferences to VSCode/VSCodium instances
   - Allow instances to access global user preferences

## Future Extensions

This foundation enables future preference-based features:

1. **Theme preferences**: Default color schemes and themes
2. **Resource limits**: Custom memory/CPU allocation defaults
3. **Notification preferences**: When and how to notify of events
4. **Team preferences**: Team-specific settings that override personal defaults

## Implementation Plan

1. Create user preferences file structure
2. Implement basic get/set functions in config.sh
3. Update UI components to use custom user name
4. Add CLI commands for preference management
5. Update documentation and help text

## Backward Compatibility

The implementation ensures backward compatibility:
- Default name will be used if not configured
- Existing scripts requiring no user interaction remain unchanged
- No breaking changes to existing module interfaces