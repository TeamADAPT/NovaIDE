# File Versioning Guide

**Version:** 1.0.0  
**Date:** March 3, 2025  
**Author:** Forge, DevOps Lead

## Overview

This document outlines the semantic versioning system for files in the NovaIDE project. The system ensures that all file changes are properly versioned and archived, maintaining a complete history of changes while preserving the latest version for easy access.

## Versioning System

### File Structure

- **Latest Version**: The current version of a file is kept at its original path (e.g., `cline_docs/activeContext.md`)
- **Archived Versions**: Previous versions are stored in a `versions` subdirectory with version numbers in the filename (e.g., `cline_docs/versions/activeContext.v1.3.1.md`)

### Version Numbering

We follow semantic versioning principles:

- **Major Version**: Incremented for significant structural or conceptual changes (e.g., 1.0.0 → 2.0.0)
- **Minor Version**: Incremented for feature additions or substantial content updates (e.g., 1.0.0 → 1.1.0)
- **Patch Version**: Incremented for bug fixes, small updates, or corrections (e.g., 1.0.0 → 1.0.1)

### Version Headers

Each versioned file includes a header with version information:

```markdown
**Version:** 1.0.0  
**Last Updated:** March 3, 2025, 04:27 MST  
**Author:** Forge, DevOps Lead
```

## Using the Versioning Script

The `version_file.sh` script automates the versioning process:

### Basic Usage

```bash
./scripts/version_file.sh <file_path> <new_version>
```

### Example

```bash
./scripts/version_file.sh cline_docs/activeContext.md 1.3.2
```

This command will:
1. Copy the current file (`cline_docs/activeContext.md`) to the versions directory with its current version number (`cline_docs/versions/activeContext.v1.3.1.md`)
2. Update the version number in the original file to 1.3.2
3. Update the timestamp in the original file

### When to Version Files

Files should be versioned when:

- Making significant changes to content
- Updating architectural decisions
- Changing technical specifications
- Modifying system patterns
- Updating project status or progress

## Directories with Versioning

The following directories use the versioning system:

- `cline_docs/`: Memory Bank files
- `docs/`: Documentation files
- Other directories as needed

## Best Practices

1. **Always Version Before Editing**: Run the versioning script before making significant changes
2. **Meaningful Version Increments**: Use appropriate version increments based on the nature of changes
3. **Descriptive Commit Messages**: Include version information in commit messages
4. **Regular Archiving**: Regularly archive versions to maintain a complete history
5. **Never Delete**: Archive old versions instead of deleting them

## Implementation Details

The versioning system is implemented through:

1. **Directory Structure**: `versions` subdirectories in relevant directories
2. **Versioning Script**: `scripts/version_file.sh` for automating the versioning process
3. **Git Integration**: Versioned files are committed to the repository

## Example Workflow

1. Before updating a file, run the versioning script:
   ```bash
   ./scripts/version_file.sh cline_docs/activeContext.md 1.3.2
   ```

2. Make your changes to the file

3. Commit both the updated file and the archived version:
   ```bash
   git add cline_docs/activeContext.md cline_docs/versions/activeContext.v1.3.1.md
   git commit -m "Update activeContext.md to version 1.3.2"
   ```

## Conclusion

Following this versioning system ensures that we maintain a complete history of all important files in the project, allowing us to track changes, revert to previous versions if needed, and maintain a clear record of the project's evolution.