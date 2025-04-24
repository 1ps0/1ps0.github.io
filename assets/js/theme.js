// assets/js/theme.js

document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const terminalInput = document.getElementById('terminal-input');
    const commandResponse = document.getElementById('command-response');

    // Command history
    const commandHistory = [];
    let historyIndex = -1;

    // Filesystem state
    const filesystemState = {
        filesystem: initializeFilesystem(),
        currentDirectory: '/',
        sudo: false,
        themes: {}
    };

    // Function to initialize the filesystem with default content
    function initializeFilesystem() {
        // Check if there's a saved filesystem in localStorage
        const savedFilesystem = localStorage.getItem('filesystem');
        if (savedFilesystem) {
            try {
                return JSON.parse(savedFilesystem);
            } catch (e) {
                console.error('Error parsing saved filesystem:', e);
                // Fall back to default filesystem
            }
        }

        // Default filesystem structure
        return {
            projects: {
                type: 'directory',
                contents: {
                    binaural: { 
                        type: 'directory', 
                        contents: {
                            'README.md': { 
                                type: 'file', 
                                content: 'A browser-based application for playing binaural beats, solfeggio frequencies, and other therapeutic tones.'
                            }
                        } 
                    },
                    'silicon-zen': { 
                        type: 'directory', 
                        contents: {
                            'README.md': { 
                                type: 'file', 
                                content: 'A collection of modern koans exploring the nature of large language models.'
                            }
                        } 
                    },
                    'claude-ui': { 
                        type: 'directory', 
                        contents: {
                            'README.md': { 
                                type: 'file', 
                                content: 'A lightweight, standalone viewer for exported Claude AI responses and artifacts.'
                            }
                        } 
                    }
                }
            },
            blog: {
                type: 'directory',
                contents: {
                    posts: { 
                        type: 'directory', 
                        contents: {
                            'turtles-all-the-way-up.md': { 
                                type: 'file', 
                                content: '# Turtles All The Way Up\n\nA philosophical exploration of recursion in AI systems.'
                            }
                        }
                    }
                }
            },
            themes: {
                type: 'directory',
                contents: {
                    'cyberpunk.css': { 
                        type: 'file', 
                        content: '/* CSS content for cyberpunk theme */'
                    },
                    'professional.css': { 
                        type: 'file', 
                        content: '/* CSS content for professional theme */' 
                    }
                }
            },
            'about.txt': { 
                type: 'file', 
                content: 'Welcome to my digital outpost. This is where I showcase my projects and experiments.'
            },
            'contact.txt': { 
                type: 'file', 
                content: 'GitHub: https://github.com/1ps0\nBluesky: https://bsky.app/profile/1ps0.bsky.social'
            },
            'readme.md': { 
                type: 'file', 
                content: '# 1ps0.github.io\n\nExploring the digital frontier. Use the terminal to navigate this site.\n\n## Getting Started\n\nThis site features an interactive terminal interface. Here are some tips for navigating:\n\n### Help System\n\nThere are two ways to get help:\n\n1. Use the `help` command for general assistance:\n   - `help` - Shows a complete list of available commands\n   - `help <command>` - Shows detailed help for a specific command\n\n2. Use the `--help` flag with any command for specific help:\n   - `ls --help` - Shows help for the ls command\n   - `cat --help` - Shows help for the cat command\n\n### Basic Navigation\n\n- `ls` - List files and directories\n- `cd [directory]` - Change to a directory\n- `pwd` - Show current location\n- `cat [file]` - Display file contents\n\nExplore and enjoy!'
            },
            'help-system.txt': {
                type: 'file',
                content: 'TERMINAL HELP SYSTEM\n\nThis terminal provides two ways to access help:\n\n1. General help command: "help"\n   - Shows a comprehensive overview of all available commands\n   - Can be used with a command name to get specific help: "help ls"\n\n2. Command-specific help flag: "--help"\n   - Add to any command to see its detailed documentation\n   - Example: "ls --help" or "cd --help"\n   - Provides detailed usage, options, and examples\n\nThe terminal help system is designed to be discoverable and easy to use, following Unix/Linux conventions while being user-friendly.\n\nExamples:\n- help        → General command overview\n- help cd     → Help for the cd command\n- ls --help   → Help for the ls command\n- pwd --help  → Help for the pwd command'
            }
        };
    }

    // Function to save the filesystem state to localStorage
    function saveFilesystemState() {
        localStorage.setItem('filesystem', JSON.stringify(filesystemState.filesystem));
    }

    // Path manipulation utilities
    function normalizePath(path) {
        // Handle absolute vs relative paths
        let normalizedPath = path;
        if (!path.startsWith('/')) {
            // Relative path - combine with current directory
            normalizedPath = filesystemState.currentDirectory === '/' 
                ? '/' + path 
                : filesystemState.currentDirectory + '/' + path;
        }
        
        // Resolve . and .. components
        const parts = normalizedPath.split('/').filter(p => p !== '');
        const resolvedParts = [];
        
        for (const part of parts) {
            if (part === '.') {
                continue;
            } else if (part === '..') {
                resolvedParts.pop();
            } else {
                resolvedParts.push(part);
            }
        }
        
        return '/' + resolvedParts.join('/');
    }

    // Get a filesystem node at a given path
    function getNodeAtPath(path) {
        const normalizedPath = normalizePath(path);
        if (normalizedPath === '/') {
            return { node: filesystemState.filesystem, path: '/' };
        }
        
        const parts = normalizedPath.split('/').filter(p => p !== '');
        let current = filesystemState.filesystem;
        let currentPath = '/';
        
        for (const part of parts) {
            if (!current[part] || current[part].type !== 'directory') {
                return null; // Path not found or not a directory
            }
            current = current[part].contents;
            currentPath += part + '/';
        }
        
        return { node: current, path: normalizedPath };
    }

    // Command parser with flag support
    function parseCommand(input) {
        // Extract sudo prefix if present
        const hasSudo = input.trim().startsWith('sudo ');
        if (hasSudo) {
            input = input.substring(5);
        }
        
        // Split input into parts
        const parts = input.trim().split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        // Check for --help flag with top priority
        if (args.includes('--help')) {
            return {
                command,
                args: [],
                flags: { help: true },
                sudo: hasSudo
            };
        }
        
        // Parse remaining flags
        const flags = {};
        const cleanArgs = [];
        
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg.startsWith('--')) {
                // Long flag
                const flagName = arg.substring(2);
                flags[flagName] = true;
            } else if (arg.startsWith('-') && arg.length > 1) {
                // Short flag(s)
                const shortFlags = arg.substring(1).split('');
                shortFlags.forEach(flag => {
                    flags[flag] = true;
                });
            } else {
                // Regular argument
                cleanArgs.push(arg);
            }
        }
        
        return {
            command,
            args: cleanArgs,
            flags,
            sudo: hasSudo
        };
    }

    // Function to update cursor position based on input text
    function updateCursorPosition() {
        const input = document.getElementById('terminal-input');
        if (!input) return;

        // Set a CSS variable to position cursor
        const textWidth = input.value.length;
        document.documentElement.style.setProperty('--cursor-pos', `${textWidth}ch`);
    }

    // Initialize theme based on URL parameter or localStorage or default to professional
    function initializeTheme() {
        const urlParams = new URLSearchParams(window.location.search);
        const themeParam = urlParams.get('theme');
        const storedTheme = localStorage.getItem('siteTheme');

        if (themeParam === 'cyberpunk' || themeParam === 'professional') {
            setTheme(themeParam);
        } else if (storedTheme) {
            setTheme(storedTheme);
        } else {
            setTheme('professional'); // Default to professional
        }
    }

    // Set theme and update URL, localStorage and UI
    function setTheme(theme) {
        // Update body class
        body.classList.remove('theme-cyberpunk', 'theme-professional');
        body.classList.add(`theme-${theme}`);

        // Update localStorage
        localStorage.setItem('siteTheme', theme);

        // Update URL without page reload
        const url = new URL(window.location);
        url.searchParams.set('theme', theme);
        window.history.pushState({}, '', url);

        // Filter blog posts based on theme
        filterBlogPosts(theme);
    }

    // Generate help text based on command
    function getHelpText(command) {
        switch (command) {
            case 'ls':
                return `
COMMAND: ls - List directory contents

Usage: ls [options] [directory]

List directory contents.

Options:
  -a, --all       Do not ignore entries starting with .
  -l              Use a long listing format
  --help          Display this help message

Examples:
  ls              List current directory contents
  ls -l           List in long format with details
  ls -a           List all files including hidden ones
  ls projects     List contents of projects directory
`;
            case 'cd':
                return `
COMMAND: cd - Change directory

Usage: cd [directory]

Change the current directory.

Arguments:
  directory       Directory to change to
                  If no directory is specified, returns to root
  ..              Move up one directory level
  .               Current directory (no change)

Options:
  --help          Display this command's help message

Examples:
  cd              Return to root directory
  cd projects     Go to projects directory
  cd ..           Go up one directory level
`;
            case 'cat':
                return `
COMMAND: cat - Display file contents

Usage: cat [options] <file>

Display the contents of a file.

Options:
  --help          Display this command's help message

Examples:
  cat readme.md   Display the content of readme.md
  cat about.txt   Show the about text file
`;
            case 'pwd':
                return `
COMMAND: pwd - Print working directory

Usage: pwd [options]

Print the current working directory.

Options:
  --help          Display this command's help message
`;
            case 'rm':
                return `
COMMAND: rm - Remove files

Usage: rm [options] <file/directory>

Remove files or directories.

Options:
  -r, --recursive Remove directories and their contents recursively
  -f, --force     Force removal without confirmation
  --help          Display this command's help message

WARNING: This command can permanently delete files from the filesystem.
         In this interactive website, removing certain directories like
         'projects/' and 'blog/' will hide those sections from the page.

Examples:
  rm file.txt     Remove a file
  rm -r dir       Remove a directory and its contents
  rm projects/    Hide the projects section from the page
  rm blog/        Hide the blog section from the page
`;
            case 'help':
                return `
COMMAND: help - Get help information

Usage: help [command]

Display help information for all commands or for a specific command.

Arguments:
  command         Show detailed help for the specified command

Examples:
  help            Show general command help
  help ls         Show detailed help for the ls command
  help cd         Show detailed help for the cd command

Note: You can also use the --help flag with any command to get help
      for that specific command (e.g., ls --help).
`;
            case 'import':
                return `
COMMAND: import - Import a CSS theme

Usage: import <themefile.css> [options]

Import a CSS theme file and apply it to the site.

Options:
  --validate      Validate CSS before applying
  --temp          Apply temporarily without saving
  --help          Display this command's help message
`;
            case 'export':
                return `
COMMAND: export - Export current theme

Usage: export <themefile.css> [options]

Export the current theme as a CSS file.

Options:
  --help          Display this command's help message
`;
            case 'save':
                return `
COMMAND: save - Save current state

Usage: save [options]

Save the current filesystem state to localStorage.

Options:
  --help          Display this command's help message
`;
            case 'clear':
                return `
COMMAND: clear - Clear terminal

Usage: clear [options]

Clear the terminal screen.

Options:
  --help          Display this command's help message
`;
            case 'matrix':
                return `
COMMAND: matrix - Toggle matrix effect

Usage: matrix [options]

Toggle the matrix effect on/off.

Options:
  --on            Force matrix effect on
  --off           Force matrix effect off
  --help          Display this command's help message
`;
            case 'sudo':
                return `
COMMAND: sudo - Elevated privileges

Usage: sudo <command>

Execute command with elevated privileges.

Some operations require sudo privileges. The sudo access
is temporary and will expire after some time.

Options:
  --help          Display this command's help message
`;
            case 'http':
                return `
COMMAND: http - HTTP Server View

Usage: http [options]

Display a Python-like http.server directory listing view of the site.
This command shows the site's filesystem structure in a browser-like interface.

Options:
  --help          Display this command's help message

Examples:
  http            Show directory listing for root
`;
            default:
                return `
Command '${command}' does not have specific help documentation.

For general help on available commands, type: help

For a list of all available commands and a brief description, run the help command.
`;
        }
    }

    // Handle commands with enhanced output formatting
    function handleCommand(commandInput) {
        // Parse command input
        const parsedCommand = parseCommand(commandInput);
        const { command, args, flags, sudo } = parsedCommand;

        // Handle sudo authorization if needed
        if (sudo && !filesystemState.sudo) {
            // For simplicity, we'll just grant sudo without a password
            filesystemState.sudo = true;
            setTimeout(() => {
                // Sudo expires after 5 minutes
                filesystemState.sudo = false;
            }, 300000);
        }

        // Handle help flag with top priority
        if (flags.help) {
            return getHelpText(command);
        }

        // Process command
        switch(command) {
            case 'ls':
                return handleLsCommand(args, flags);

            case 'cd':
                return handleCdCommand(args, flags);

            case 'pwd':
                return filesystemState.currentDirectory;

            case 'cat':
                return handleCatCommand(args, flags);

            case 'rm':
                return handleRmCommand(args, flags);

            case 'import':
                return handleImportCommand(args, flags);

            case 'export':
                return handleExportCommand(args, flags);

            case 'save':
                return handleSaveCommand(args, flags);

            case 'darkmode':
                setDarkMode(true);
                return 'Dark mode activated.';

            case 'lightmode':
                setDarkMode(false);
                return 'Light mode activated.';

            case 'cyberpunk':
                setTheme('cyberpunk');
                return 'Cyberpunk theme activated.';

            case 'professional':
                setTheme('professional');
                return 'Professional theme activated.';

            case 'clear':
                if (args.length > 0) {
                    return handleClearCommand(args, flags);
                }
                return 'clear';

            case 'reset':
                setTheme('professional');  // Reset to professional theme
                setDarkMode(false);        // Reset to light mode
                return 'clear';  // And clear terminal

            case 'whoami':
                return 'Developer, explorer, digital tinkerer.';

            case 'matrix':
                return handleMatrixCommand(args, flags);

            case 'date':
                return new Date().toLocaleString();

            case 'echo':
                return args.join(' ');

            case 'github':
                window.open('https://github.com/1ps0', '_blank');
                return 'Opening GitHub profile...';

            case 'bluesky':
                window.open('https://bsky.app/profile/1ps0.bsky.social', '_blank');
                return 'Opening Bluesky profile...';

            case 'shutdown':
                return handleShutdownCommand(args, flags);

            case 'help':
                return handleHelpCommand(args, flags);

            case 'http':
                return handleHttpCommand(args, flags);

            default:
                if (command.trim() === '') {
                    return '';
                }
                return `Command not found: ${command}. Try 'help' for available commands.`;
        }
    }

    // Handle ls command
    function handleLsCommand(args, flags) {
        let targetPath = filesystemState.currentDirectory;
        if (args.length > 0) {
            targetPath = args[0];
        }

        const pathInfo = getNodeAtPath(targetPath);
        if (!pathInfo) {
            return `ls: ${targetPath}: No such directory`;
        }

        // Convert the node's contents to an array of entries
        const contents = [];
        for (const name in pathInfo.node) {
            // Skip hidden files unless -a or --all flag is used
            if (!flags.a && !flags.all && name.startsWith('.')) {
                continue;
            }

            const item = pathInfo.node[name];
            if (flags.l) {
                // Long format
                const type = item.type === 'directory' ? 'd' : '-';
                const permissions = 'rwxr-xr-x';
                const owner = '1ps0';
                const size = item.type === 'file' ? (item.content.length + ' B') : '-';
                const date = new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                
                // For directories, add a trailing slash
                const displayName = item.type === 'directory' ? name + '/' : name;
                
                contents.push(`${type}${permissions} ${owner} ${size.padStart(8)} ${date} ${displayName}`);
            } else {
                // Simple format
                contents.push(item.type === 'directory' ? name + '/' : name);
            }
        }

        return contents.join('\n');
    }

    // Handle cd command
    function handleCdCommand(args, flags) {
        if (args.length === 0) {
            // No arguments, go to root
            filesystemState.currentDirectory = '/';
            return '';
        }

        const targetPath = args[0];
        
        // Special case for binaural, silicon-zen, and claude-ui
        if (targetPath === 'binaural') {
            window.location.href = 'https://1ps0.github.io/binaural';
            return 'Navigating to binaural...';
        } else if (targetPath === 'silicon-zen') {
            window.location.href = 'https://1ps0.github.io/silicon-zen';
            return 'Navigating to silicon-zen...';
        } else if (targetPath === 'claude-ui') {
            window.location.href = 'https://1ps0.github.io/claude-ui';
            return 'Navigating to claude-ui...';
        }

        // Handle normal filesystem navigation
        const normalizedPath = normalizePath(targetPath);
        const pathInfo = getNodeAtPath(normalizedPath);
        
        if (!pathInfo) {
            return `cd: ${targetPath}: No such directory`;
        }
        
        // Update current directory
        filesystemState.currentDirectory = pathInfo.path;
        return '';
    }

    // Handle cat command
    function handleCatCommand(args, flags) {
        if (args.length === 0) {
            return 'Usage: cat [file]';
        }

        const filePath = args.join(' ');
        const normalizedPath = normalizePath(filePath);
        
        // Parse the path to extract directory and filename
        const parts = normalizedPath.split('/').filter(p => p !== '');
        const filename = parts.pop();
        const dirPath = '/' + parts.join('/');
        
        const dirInfo = getNodeAtPath(dirPath);
        if (!dirInfo) {
            return `cat: ${filePath}: No such file or directory`;
        }
        
        if (!dirInfo.node[filename]) {
            return `cat: ${filePath}: No such file`;
        }
        
        const file = dirInfo.node[filename];
        if (file.type !== 'file') {
            return `cat: ${filePath}: Is a directory`;
        }
        
        return file.content;
    }

    // Handle rm command
    function handleRmCommand(args, flags) {
        if (args.length === 0) {
            return 'Usage: rm [options] <file/directory>';
        }

        const targetPath = args[0];
        const normalizedPath = normalizePath(targetPath);
        
        // Parse the path to extract directory and filename
        const parts = normalizedPath.split('/').filter(p => p !== '');
        const targetName = parts.pop();
        const dirPath = '/' + parts.join('/');
        
        const dirInfo = getNodeAtPath(dirPath);
        if (!dirInfo) {
            return `rm: ${targetPath}: No such file or directory`;
        }
        
        if (!dirInfo.node[targetName]) {
            return `rm: ${targetPath}: No such file or directory`;
        }
        
        const target = dirInfo.node[targetName];
        
        // Check if target is a directory and if recursive flag is set
        if (target.type === 'directory' && !flags.r && !flags.recursive) {
            return `rm: ${targetPath}: is a directory (use -r to remove)`;
        }
        
        // Check if sudo is required (for system directories/files)
        const systemPaths = ['projects', 'blog', 'themes'];
        if (systemPaths.includes(targetName) && !filesystemState.sudo) {
            return `rm: ${targetPath}: Permission denied (use sudo)`;
        }
        
        // Remove the target
        delete dirInfo.node[targetName];
        
        // Save filesystem state
        saveFilesystemState();
        
        // UI manipulation for system sections
        if (targetName === 'projects') {
            const projectsSection = document.querySelector('.projects');
            if (projectsSection) {
                projectsSection.style.display = 'none';
                return `Removed ${targetPath} - Projects section hidden from view.`;
            }
        } else if (targetName === 'blog') {
            const blogSection = document.querySelector('.blog-section');
            if (blogSection) {
                blogSection.style.display = 'none';
                return `Removed ${targetPath} - Blog section hidden from view.`;
            }
        } else if (targetName === 'about.txt') {
            const aboutContent = document.querySelector('.terminal-section');
            if (aboutContent) {
                const lines = aboutContent.querySelectorAll('.terminal-line');
                lines.forEach(line => {
                    if (line.textContent.includes('Welcome to my digital outpost')) {
                        line.style.display = 'none';
                    }
                });
                return `Removed ${targetPath} - About content hidden from view.`;
            }
        }
        
        return `Removed ${targetPath}`;
    }

    // Handle http command to view the site like a directory listing
    function handleHttpCommand(args, flags) {
        // Check if we're in dark mode
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // Determine current path
        let currentPath = args[0] || '/';
        if (!currentPath.endsWith('/')) {
            currentPath += '/';
        }
        
        // Create a function to render the view for a given path
        function renderView(path) {
            let content = '';
            let pathNode;
            
            if (path === '/') {
                pathNode = filesystemState.filesystem;
            } else {
                const pathParts = path.split('/').filter(p => p !== '');
                let currentNode = filesystemState.filesystem;
                
                for (const part of pathParts) {
                    if (currentNode[part] && currentNode[part].type === 'directory') {
                        currentNode = currentNode[part].contents;
                    } else {
                        return `<h2>Error: Path not found: ${path}</h2>`;
                    }
                }
                
                pathNode = currentNode;
            }
            
            // Create a Python http.server-like view of the site
            content = `<!DOCTYPE HTML>
<html>
<head>
<title>Directory listing for ${path}</title>
<style>
body { 
    font-family: monospace; 
    background-color: ${isDarkMode ? '#1e1e1e' : '#ffffff'};
    color: ${isDarkMode ? '#e0e0e0' : '#000000'};
}
h1 { 
    border-bottom: 1px solid ${isDarkMode ? '#444444' : '#c0c0c0'}; 
    margin-bottom: 10px; 
    padding-bottom: 10px; 
}
ul { list-style-type: none; padding-left: 20px; }
li { margin: 5px 0; }
a { 
    text-decoration: none; 
    color: ${isDarkMode ? '#569cd6' : '#0000ee'}; 
}
a:visited { 
    color: ${isDarkMode ? '#9e74d7' : '#551a8b'}; 
}
.directory { font-weight: bold; }
.file-content {
    background-color: ${isDarkMode ? '#252526' : '#f5f5f5'};
    border: 1px solid ${isDarkMode ? '#444444' : '#cccccc'};
    padding: 10px;
    margin-top: 10px;
    border-radius: 4px;
    white-space: pre-wrap;
}
hr { border-color: ${isDarkMode ? '#444444' : '#c0c0c0'}; }
.timestamp { 
    font-size: 0.8em; 
    color: ${isDarkMode ? '#888888' : '#666666'}; 
}
</style>
</head>
<body>
<h1>Directory listing for ${path}</h1>
<hr>
`;

            // Add parent directory link if not at root
            if (path !== '/') {
                const parentPath = path.split('/').slice(0, -2).join('/') + '/';
                content += `<p><a href="#" data-path="${parentPath}">Parent Directory</a></p>`;
            }

            content += `<ul>`;

            // List all directories and files in current path
            for (const name in pathNode) {
                const isDir = pathNode[name].type === 'directory';
                if (isDir) {
                    const itemPath = path + name + '/';
                    content += `\n  <li><a href="#" class="directory" data-path="${itemPath}">${name}/</a></li>`;
                } else {
                    // For files, show a link that will display the file content
                    content += `\n  <li><a href="#" class="file" data-file="${name}" data-path="${path}">${name}</a></li>`;
                }
            }

            content += `\n</ul>
<div id="file-content-display"></div>
<hr>
<p class="timestamp">Generated by 1ps0 Terminal HTTP Server at ${new Date().toISOString()}</p>
</body>
</html>`;

            return content;
        }
        
        // Function to handle file viewing
        function showFileContent(filePath, fileName, container) {
            const pathParts = filePath.split('/').filter(p => p !== '');
            let currentNode = filesystemState.filesystem;
            
            // Navigate to the directory containing the file
            for (const part of pathParts) {
                if (currentNode[part] && currentNode[part].type === 'directory') {
                    currentNode = currentNode[part].contents;
                } else {
                    container.innerHTML = `<div class="file-content">Error: File not found</div>`;
                    return;
                }
            }
            
            // Get the file content
            if (currentNode[fileName] && currentNode[fileName].type === 'file') {
                const fileContent = currentNode[fileName].content;
                container.innerHTML = `<h3>File: ${fileName}</h3><div class="file-content">${fileContent}</div>`;
            } else {
                container.innerHTML = `<div class="file-content">Error: File not found</div>`;
            }
        }

        // Display in a modal-like overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        overlay.style.zIndex = '9999';
        overlay.style.padding = '20px';
        overlay.style.boxSizing = 'border-box';
        overlay.style.overflow = 'auto';

        // Add a close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.position = 'fixed';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '10px';
        closeBtn.style.padding = '5px 10px';
        closeBtn.style.backgroundColor = isDarkMode ? '#c75450' : '#f44336';
        closeBtn.style.color = 'white';
        closeBtn.style.border = 'none';
        closeBtn.style.borderRadius = '4px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = function() {
            document.body.removeChild(overlay);
        };

        // Set the initial content
        const content = document.createElement('div');
        content.innerHTML = renderView(currentPath);
        
        // Add event delegation for directory and file clicks
        content.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                
                if (e.target.classList.contains('directory') || e.target.dataset.path) {
                    // Navigate to directory
                    const newPath = e.target.dataset.path;
                    content.innerHTML = renderView(newPath);
                } else if (e.target.classList.contains('file')) {
                    // Show file content
                    const filePath = e.target.dataset.path;
                    const fileName = e.target.dataset.file;
                    const fileContentDisplay = document.getElementById('file-content-display');
                    showFileContent(filePath, fileName, fileContentDisplay);
                }
            }
        });
        
        overlay.appendChild(closeBtn);
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        return 'Serving HTTP directory listing...';
    }

    // Handle import command
    function handleImportCommand(args, flags) {
        if (args.length === 0) {
            return 'Usage: import <themefile.css>';
        }
        
        // In a real implementation, this would allow importing a custom theme
        // For simplicity, we'll just return a message
        return 'Import functionality not fully implemented yet. Coming soon!';
    }

    // Handle export command
    function handleExportCommand(args, flags) {
        if (args.length === 0) {
            return 'Usage: export <themefile.css>';
        }
        
        // In a real implementation, this would export the current theme
        // For simplicity, we'll just return a message
        return 'Export functionality not fully implemented yet. Coming soon!';
    }

    // Handle save command
    function handleSaveCommand(args, flags) {
        if (args.length === 0) {
            return 'Usage: save <themefile.css>';
        }
        
        // In a real implementation, this would save a theme to localStorage
        // For simplicity, we'll just return a message
        return 'Save functionality not fully implemented yet. Coming soon!';
    }

    // Handle clear command for theme clearing
    function handleClearCommand(args, flags) {
        if (flags.storage) {
            // Clear theme from localStorage
            return 'Theme cleared from storage.';
        }
        
        // If no storage flag, just clear the terminal
        return 'clear';
    }

    // Handle matrix command
    function handleMatrixCommand(args, flags) {
        const canvas = document.getElementById('matrix-canvas');
        if (!canvas) {
            return 'Matrix effect not available.';
        }
        
        if (flags.on) {
            canvas.style.display = 'block';
            return 'Matrix effect activated.';
        } else if (flags.off) {
            canvas.style.display = 'none';
            return 'Matrix effect deactivated.';
        } else {
            // Toggle
            if (canvas.style.display === 'none') {
                canvas.style.display = 'block';
                return 'Matrix effect activated.';
            } else {
                canvas.style.display = 'none';
                return 'Matrix effect deactivated.';
            }
        }
    }

    // Handle shutdown command
    function handleShutdownCommand(args, flags) {
        // Create shutdown effect
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = '#000';
        overlay.style.color = '#fff';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 1s ease';
        overlay.textContent = 'System shutting down...';
        
        document.body.appendChild(overlay);
        
        // Fade in
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        // Wait and then fade out
        setTimeout(() => {
            overlay.textContent = 'System halted.';
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 1000);
            }, 2000);
        }, 2000);
        
        return 'Initiating shutdown sequence...';
    }

    function setDarkMode(isDark) {
        body.classList.toggle('dark-mode', isDark);
        localStorage.setItem('darkMode', isDark ? 'true' : 'false');

        // Update URL
        const url = new URL(window.location);
        url.searchParams.set('darkmode', isDark ? 'true' : 'false');
        window.history.pushState({}, '', url);
    }

    // Initialize dark mode
    function initializeDarkMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const darkModeParam = urlParams.get('darkmode');
        const storedDarkMode = localStorage.getItem('darkMode');

        if (darkModeParam === 'true' || darkModeParam === 'false') {
            setDarkMode(darkModeParam === 'true');
        } else if (storedDarkMode) {
            setDarkMode(storedDarkMode === 'true');
        } else {
            // Default to system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setDarkMode(prefersDark);
        }
    }

    // Terminal input handler with command history
    if (terminalInput) {
        // Initialize cursor position
        updateCursorPosition();

        // Update cursor position on input
        terminalInput.addEventListener('input', updateCursorPosition);

        terminalInput.addEventListener('keydown', function(e) {
            // Update cursor on any key
            setTimeout(updateCursorPosition, 0);

            if (e.key === 'Enter') {
                const command = terminalInput.value;

                if (command) {
                    // Add to command history
                    commandHistory.push(command);
                    historyIndex = commandHistory.length;

                    // Create a new terminal line with the command
                    const cmdLineDiv = document.createElement('div');
                    cmdLineDiv.className = 'terminal-line visible';
                    cmdLineDiv.innerHTML = `<span class="terminal-prompt">$</span> ${command}`;

                    // Insert the command line before the input container
                    const inputContainer = document.querySelector('.terminal-input-container');
                    inputContainer.parentNode.insertBefore(cmdLineDiv, inputContainer);

                    // Handle the command
                    const response = handleCommand(command);

                    if (response !== 'clear') {
                        // Create a response line if it's not a clear command
                        if (response) {
                            // Split multiline responses
                            const responseLines = response.split('\n');
                            responseLines.forEach(line => {
                                const responseDiv = document.createElement('div');
                                responseDiv.className = 'terminal-line visible';
                                responseDiv.textContent = line;
                                inputContainer.parentNode.insertBefore(responseDiv, inputContainer);
                            });
                        }
                    } else {
                        // Clear all terminal lines except the input
                        const terminalLines = document.querySelectorAll('.terminal-section .terminal-line:not(.terminal-input-container)');
                        terminalLines.forEach(line => {
                            line.remove();
                        });
                    }

                    // Clear the input
                    terminalInput.value = '';

                    // Reset cursor position
                    updateCursorPosition();

                    // Scroll to bottom of terminal
                    const terminalSection = document.querySelector('.terminal-section');
                    terminalSection.scrollTop = terminalSection.scrollHeight;
                }
            }
            // Command history navigation - Up arrow
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    terminalInput.value = commandHistory[historyIndex];
                    updateCursorPosition(); // Update cursor after changing input
                }
            }
            // Command history navigation - Down arrow
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    terminalInput.value = commandHistory[historyIndex];
                    updateCursorPosition(); // Update cursor after changing input
                } else if (historyIndex === commandHistory.length - 1) {
                    historyIndex = commandHistory.length;
                    terminalInput.value = '';
                    updateCursorPosition(); // Update cursor after changing input
                }
            }
        });

        // Make terminal input focus when clicking anywhere in the terminal section
        const terminalSection = document.querySelector('.terminal-section');
        if (terminalSection) {
            terminalSection.addEventListener('click', function() {
                terminalInput.focus();
            });
        }
    }

    // Filter blog posts based on current theme
    function filterBlogPosts(theme) {
        const blogCards = document.querySelectorAll('.blog-card');
        if (blogCards.length === 0) return;

        blogCards.forEach(card => {
            const categories = card.dataset.categories ? card.dataset.categories.split(' ') : [];

            if (theme === 'professional') {
                // Show only professional posts in professional mode
                card.style.display = categories.includes('professional') ? 'block' : 'none';
            } else {
                // Show all posts in cyberpunk mode
                card.style.display = 'block';
            }
        });
    }

    // Initialize terminal text appearing effect
    function initializeTerminalEffect() {
        const terminalLines = document.querySelectorAll('.terminal-line:not(.terminal-input-container)');
        terminalLines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('visible');
            }, 300 * (index + 1));
        });

        // Make input line visible after all other lines
        setTimeout(() => {
            const inputContainer = document.querySelector('.terminal-input-container');
            if (inputContainer) {
                inputContainer.classList.add('visible');
                // Focus the input for immediate typing
                const input = document.getElementById('terminal-input');
                if (input) input.focus();
            }
        }, 300 * (terminalLines.length + 1));
    }

    // Function to handle the general help command
    function handleHelpCommand(args, flags) {
        // If specific command help is requested, show that command's help
        if (args.length > 0) {
            const targetCommand = args[0];
            return getHelpText(targetCommand);
        }
        
        // Otherwise show general help overview
        return `
1ps0.github.io Terminal Interface
================================

COMMAND REFERENCE:

Navigation:
- pwd                    Print working directory
- ls [directory]         List contents of directory
- cd [directory]         Change directory

File Operations:
- cat <file>             Display file contents
- rm <file/directory>    Remove file or directory

System Commands:
- clear                  Clear terminal
- help                   Show this help message
- whoami                 Display user info
- date                   Show current date and time
- echo <message>         Display a message

Theme Control:
- cyberpunk              Switch to cyberpunk theme
- professional           Switch to professional theme
- darkmode               Switch to dark mode
- lightmode              Switch to light mode
- reset                  Reset theme to professional

External Links:
- github                 Open GitHub profile
- bluesky                Open Bluesky profile

Advanced Commands:
- matrix                 Toggle matrix effect
- shutdown               Simulate shutdown
- sudo <command>         Execute with elevated privileges
- import                 Import filesystem
- export                 Export filesystem
- save                   Save current filesystem state
- http                   Show Python-like directory listing

For detailed information about a specific command, type:
  <command> --help  or  help <command>
`;
    }

    // Initialize everything
    initializeTheme();
    initializeDarkMode();
    initializeTerminalEffect();
});
