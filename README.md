# 1ps0.github.io

![Status](https://img.shields.io/badge/status-active-success.svg)

A digital outpost showcasing projects, experiments and thoughts - featuring an interactive terminal interface for navigation.

## Overview

This personal site serves as a hub for my projects, blog posts, and digital experiments. The site features a unique terminal-based navigation system alongside traditional web navigation, providing both a practical interface and an opportunity to explore through commands.

## Features

### Interactive Terminal

The site includes a fully-functional terminal interface that allows you to:

- Navigate the site using commands like `cd`, `ls`, and `pwd`
- View file contents with `cat`
- Get help with the `help` command or `--help` flag
- Toggle between themes with `cyberpunk` and `professional` commands
- Access external profiles with `github` and `bluesky` commands

Try these basic commands to get started:
```
help               # Show all available commands
ls                 # List files and directories
cat readme.md      # View this documentation
cd projects        # Navigate to projects directory
```

### Projects Showcase

The site features a curated selection of my projects:

- **Binaural** - A browser-based application for therapeutic sound frequencies
- **Silicon Zen** - A collection of modern koans exploring large language models
- **Claude UI** - A lightweight viewer for Claude AI responses

### Blog

The blog section contains my thoughts on technology, development, and other topics. Posts are categorized and can be filtered based on the current theme.

## Testing

The site includes a comprehensive test suite for the terminal functionality.

### Running Tests

1. Navigate to the test environment at `/tests/terminal-test.html`
2. Click the "Run All Tests" button to execute all terminal tests
3. View test results in the panel that appears

### Test Structure

Tests are organized into categories:
- Navigation Commands (NC)
- Flag Handling (FH)
- System Commands (SC)
- Help System (HS)

## Development

### Local Setup

1. Clone the repository:
   ```
   git clone https://github.com/1ps0/1ps0.github.io.git
   cd 1ps0.github.io
   ```

2. Serve the site locally using any static file server:
   ```
   # Using Python
   python -m http.server 8000
   
   # OR using Node.js with http-server
   npx http-server
   ```

3. Visit `http://localhost:8000` in your browser

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by terminal interfaces and retro computing aesthetics
- Built with vanilla JavaScript, HTML and CSS
- Special thanks to contributors and testers

---

_"Exploring the digital frontier."_ 