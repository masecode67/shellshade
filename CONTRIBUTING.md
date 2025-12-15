# Contributing to ShellShade

Thank you for your interest in contributing to ShellShade! This document provides guidelines and instructions for contributing.

## Ways to Contribute

- **Report Bugs** — Open an issue describing the bug
- **Suggest Features** — Open an issue with your idea
- **Add Themes** — Submit new color schemes
- **Improve Documentation** — Fix typos, add examples
- **Submit Code** — Fix bugs or implement features

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/masecode67/shellshade.git
   cd shellshade
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   # Run the Electron app
   npm run dev

   # Or build and test the CLI
   npm run build:cli
   npm run cli
   ```

## Project Structure

```
src/
├── cli/           # CLI application (TUI)
├── main/          # Electron main process
├── renderer/      # Electron React frontend
├── preload/       # Electron preload scripts
└── shared/        # Shared types and utilities

resources/
├── builtin-themes/  # Theme JSON files
└── icons/           # App icons
```

## Adding a New Theme

1. Create a JSON file in `resources/builtin-themes/`
2. Use kebab-case for the filename (e.g., `my-awesome-theme.json`)
3. Follow this format:

```json
{
  "name": "My Awesome Theme",
  "author": "Your Name",
  "colors": {
    "background": "#1a1b26",
    "foreground": "#c0caf5",
    "cursor": "#c0caf5",
    "cursorText": "#1a1b26",
    "selection": "#33467c",
    "selectionText": "#c0caf5",
    "ansi": {
      "black": "#15161e",
      "red": "#f7768e",
      "green": "#9ece6a",
      "yellow": "#e0af68",
      "blue": "#7aa2f7",
      "magenta": "#bb9af7",
      "cyan": "#7dcfff",
      "white": "#a9b1d6",
      "brightBlack": "#414868",
      "brightRed": "#f7768e",
      "brightGreen": "#9ece6a",
      "brightYellow": "#e0af68",
      "brightBlue": "#7aa2f7",
      "brightMagenta": "#bb9af7",
      "brightCyan": "#7dcfff",
      "brightWhite": "#c0caf5"
    }
  }
}
```

4. Test your theme by running the app
5. Submit a pull request

## Adding Terminal Support

To add support for a new terminal:

1. Add the terminal type to `src/cli/index.ts`:
   - Add to the `Terminal` type
   - Add to `platformTerminals`
   - Add to `terminalNames`
   - Add detection logic in `detectTerminal()`

2. Create an `applyTo<Terminal>()` function that:
   - Takes `ThemeColors` and `themeName` as parameters
   - Returns `{ success: boolean; message: string }`
   - Writes the appropriate config file or executes commands

3. Add the case to the `applyTheme()` switch statement

4. Test on the target platform

## Code Style

- Use TypeScript for all code
- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code patterns

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add support for Hyper terminal
fix: correct color parsing for iTerm2
docs: update installation instructions
chore: update dependencies
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test your changes locally
4. Update documentation if needed
5. Submit a pull request with a clear description

## Reporting Bugs

When reporting bugs, please include:

- Operating system and version
- Terminal application and version
- Steps to reproduce
- Expected vs actual behavior
- Error messages (if any)

## Feature Requests

When suggesting features:

- Describe the use case
- Explain why it would be useful
- Consider if it fits the project scope

## Questions?

Open an issue with your question or start a discussion.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
