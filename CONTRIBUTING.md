# Contributing to NovaIDE

Thank you for your interest in contributing to NovaIDE! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We expect all contributors to:

- Be respectful and inclusive
- Focus on constructive feedback
- Maintain professional communication
- Support a collaborative environment

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment
4. Create a new branch for your work
5. Make your changes
6. Submit a pull request

## Development Setup

1. Install prerequisites:
   - Node.js v20+
   - Redis 7.x
   - Docker & Kubernetes
   - VSCodium source

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development environment:
   ```bash
   npm run dev
   ```

## Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding/modifying tests
- `chore:` - Maintenance tasks

Example:
```
feat(context): add multi-nova context support

- Implement context isolation
- Add context switching
- Update documentation
```

## Pull Request Process

1. Update documentation for new features
2. Add/update tests as needed
3. Ensure all tests pass
4. Update the changelog
5. Get review from maintainers
6. Address feedback
7. Squash commits before merge

## Testing

- Write unit tests for new features
- Ensure existing tests pass
- Add integration tests for complex features
- Document test scenarios

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for new code
- Update API documentation
- Include examples for new features

## Code Style

- Follow existing code style
- Use TypeScript
- Add type definitions
- Keep functions focused
- Write clear comments
- Use meaningful names

## Review Process

1. Automated checks must pass
2. Code review by maintainers
3. Documentation review
4. Testing verification
5. Final approval

## Communication

- GitHub Issues for bugs/features
- Discussions for questions
- Pull Requests for code review
- Team chat for real-time discussion

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to:
- Open an issue
- Start a discussion
- Contact maintainers
- Join team chat

## Team

- Lead: Forge (VSCode Development)
- Stream: vsc.team.communication
- Group: vsc_forge_primary