// assets/js/theme.js

document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const terminalInput = document.getElementById('terminal-input');
    const commandResponse = document.getElementById('command-response');

    // Enhanced command history with persistence
    const commandHistory = JSON.parse(localStorage.getItem('terminalHistory') || '[]');
    let historyIndex = -1;
    let currentWorkingDirectory = '/home/user';
    
    // Virtual file system
    const virtualFS = {
        '/home/user': {
            type: 'directory',
            contents: {
                'projects': { type: 'directory', contents: {} },
                'blog': { type: 'directory', contents: {} },
                'about.txt': { type: 'file', content: 'Welcome to my digital outpost. This is where I showcase my projects and experiments.' },
                'contact.txt': { type: 'file', content: 'Email: contact@1ps0.info\nGitHub: https://github.com/1ps0\nBluesky: @1ps0.bsky.social' },
                'readme.md': { type: 'file', content: '# 1ps0 Digital Outpost\n\nWelcome to my terminal interface. Type `help` for available commands.' }
            }
        },
        '/home/user/projects': {
            type: 'directory',
            contents: {
                'binaural': { type: 'link', target: 'https://1ps0.github.io/binaural' },
                'silicon-zen': { type: 'link', target: 'https://1ps0.github.io/silicon-zen' },
                'claude-ui': { type: 'link', target: 'https://1ps0.github.io/claude-ui' },
                'fresh-air': { type: 'link', target: 'https://1ps0.info/fresh-air' },
                'keto': { type: 'link', target: 'https://1ps0.info/keto' },
                'staccade': { type: 'link', target: 'https://1ps0.github.io/staccade' },
                'cbrain-sciences': { type: 'link', target: 'https://1ps0.info/cbrain-sciences' }
            }
        },
        '/home/user/blog': {
            type: 'directory',
            contents: {
                'turtles-all-the-way-up.md': { type: 'file', content: '# Turtles All The Way Up\n\nA philosophical exploration of recursive thinking...' },
                'recent-thoughts.md': { type: 'file', content: '# Recent Thoughts\n\nRandom musings and observations...' },
                'ai-philosophy.md': { type: 'file', content: '# AI Philosophy\n\nThoughts on artificial intelligence and consciousness...' }
            }
        }
    };

    // Command aliases
    const aliases = JSON.parse(localStorage.getItem('terminalAliases') || '{}');

    // Environment variables
    const environment = {
        'USER': 'user',
        'HOME': '/home/user',
        'PWD': currentWorkingDirectory,
        'PATH': '/usr/local/bin:/usr/bin:/bin',
        'TERM': 'xterm-256color',
        'SHELL': '/bin/bash'
    };

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

    // File system utilities
    function getPath(path) {
        if (path.startsWith('/')) {
            return path;
        }
        return currentWorkingDirectory + '/' + path;
    }

    function resolvePath(path) {
        const fullPath = getPath(path);
        const parts = fullPath.split('/').filter(p => p);
        let current = virtualFS['/'];
        
        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                const parentParts = currentWorkingDirectory.split('/').filter(p => p);
                if (parentParts.length > 0) {
                    parentParts.pop();
                    currentWorkingDirectory = '/' + parentParts.join('/');
                }
                continue;
            }
            
            if (!current.contents || !current.contents[part]) {
                return null;
            }
            current = current.contents[part];
        }
        
        return current;
    }

    function formatFileSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Enhanced command handling with file system support
    function handleCommand(command) {
        // Parse command and arguments with support for pipes and redirection
        const parts = command.trim().split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Handle aliases
        if (aliases[cmd]) {
            return handleCommand(aliases[cmd] + ' ' + args.join(' '));
        }

        // Process special case for 'cat' command with multiple arguments
        if (cmd === 'cat' && args.length > 0) {
            const file = args.join(' ');
            const path = getPath(file);
            const fileObj = resolvePath(path);
            
            if (!fileObj) {
                return `cat: ${file}: No such file or directory`;
            }
            
            if (fileObj.type === 'file') {
                return fileObj.content;
            } else if (fileObj.type === 'directory') {
                return `cat: ${file}: Is a directory`;
            } else if (fileObj.type === 'link') {
                return `cat: ${file}: Is a symbolic link`;
            }
        }

        switch(cmd) {
            case 'pwd':
                return currentWorkingDirectory;

            case 'ls':
                const lsPath = args.length > 0 ? args[0] : '.';
                const lsTarget = resolvePath(lsPath);
                
                if (!lsTarget) {
                    return `ls: ${lsPath}: No such file or directory`;
                }
                
                if (lsTarget.type !== 'directory') {
                    return `ls: ${lsPath}: Not a directory`;
                }
                
                const files = Object.keys(lsTarget.contents || {});
                if (files.length === 0) {
                    return '';
                }
                
                // Format as table with details
                return files.map(file => {
                    const fileObj = lsTarget.contents[file];
                    const type = fileObj.type === 'directory' ? 'd' : 
                               fileObj.type === 'link' ? 'l' : '-';
                    const size = fileObj.type === 'file' ? formatFileSize(fileObj.content.length) : '';
                    const date = formatDate(new Date());
                    return `${type}rw-r--r-- 1 user user ${size.padStart(8)} ${date} ${file}`;
                }).join('\n');

            case 'cd':
                if (args.length === 0) {
                    currentWorkingDirectory = environment.HOME;
                    environment.PWD = currentWorkingDirectory;
                    return '';
                }
                
                const cdPath = args[0];
                const cdTarget = resolvePath(cdPath);
                
                if (!cdTarget) {
                    return `cd: ${cdPath}: No such file or directory`;
                }
                
                if (cdTarget.type !== 'directory') {
                    return `cd: ${cdPath}: Not a directory`;
                }
                
                currentWorkingDirectory = getPath(cdPath);
                environment.PWD = currentWorkingDirectory;
                return '';

            case 'mkdir':
                if (args.length === 0) {
                    return 'mkdir: missing operand';
                }
                
                const mkdirPath = getPath(args[0]);
                const parentPath = mkdirPath.substring(0, mkdirPath.lastIndexOf('/'));
                const dirName = mkdirPath.substring(mkdirPath.lastIndexOf('/') + 1);
                
                const parent = resolvePath(parentPath);
                if (!parent) {
                    return `mkdir: ${args[0]}: No such file or directory`;
                }
                
                if (parent.type !== 'directory') {
                    return `mkdir: ${args[0]}: Not a directory`;
                }
                
                if (parent.contents[dirName]) {
                    return `mkdir: ${args[0]}: File exists`;
                }
                
                parent.contents[dirName] = { type: 'directory', contents: {} };
                return '';

            case 'touch':
                if (args.length === 0) {
                    return 'touch: missing operand';
                }
                
                const touchPath = getPath(args[0]);
                const touchParentPath = touchPath.substring(0, touchPath.lastIndexOf('/'));
                const fileName = touchPath.substring(touchPath.lastIndexOf('/') + 1);
                
                const touchParent = resolvePath(touchParentPath);
                if (!touchParent) {
                    return `touch: ${args[0]}: No such file or directory`;
                }
                
                if (touchParent.type !== 'directory') {
                    return `touch: ${args[0]}: Not a directory`;
                }
                
                if (!touchParent.contents[fileName]) {
                    touchParent.contents[fileName] = { type: 'file', content: '' };
                }
                return '';

            case 'rm':
                if (args.length === 0) {
                    return 'rm: missing operand';
                }
                
                const rmPath = getPath(args[0]);
                const rmParentPath = rmPath.substring(0, rmPath.lastIndexOf('/'));
                const rmFileName = rmPath.substring(rmPath.lastIndexOf('/') + 1);
                
                const rmParent = resolvePath(rmParentPath);
                if (!rmParent) {
                    return `rm: ${args[0]}: No such file or directory`;
                }
                
                if (!rmParent.contents[rmFileName]) {
                    return `rm: ${args[0]}: No such file or directory`;
                }
                
                delete rmParent.contents[rmFileName];
                return '';

            case 'cp':
                if (args.length < 2) {
                    return 'cp: missing operand';
                }
                
                const sourcePath = getPath(args[0]);
                const destPath = getPath(args[1]);
                const source = resolvePath(sourcePath);
                
                if (!source) {
                    return `cp: ${args[0]}: No such file or directory`;
                }
                
                // Simplified copy - just create a new file with same content
                const cpParentPath = destPath.substring(0, destPath.lastIndexOf('/'));
                const cpFileName = destPath.substring(destPath.lastIndexOf('/') + 1);
                const cpParent = resolvePath(cpParentPath);
                
                if (!cpParent) {
                    return `cp: ${args[1]}: No such file or directory`;
                }
                
                cpParent.contents[cpFileName] = { 
                    type: source.type, 
                    content: source.content || '',
                    target: source.target
                };
                return '';

            case 'mv':
                if (args.length < 2) {
                    return 'mv: missing operand';
                }
                
                const mvSourcePath = getPath(args[0]);
                const mvDestPath = getPath(args[1]);
                const mvSource = resolvePath(mvSourcePath);
                
                if (!mvSource) {
                    return `mv: ${args[0]}: No such file or directory`;
                }
                
                // Move by copying then deleting
                const mvParentPath = mvDestPath.substring(0, mvDestPath.lastIndexOf('/'));
                const mvFileName = mvDestPath.substring(mvDestPath.lastIndexOf('/') + 1);
                const mvParent = resolvePath(mvParentPath);
                
                if (!mvParent) {
                    return `mv: ${args[1]}: No such file or directory`;
                }
                
                mvParent.contents[mvFileName] = mvSource;
                
                // Remove from source location
                const mvSourceParentPath = mvSourcePath.substring(0, mvSourcePath.lastIndexOf('/'));
                const mvSourceFileName = mvSourcePath.substring(mvSourcePath.lastIndexOf('/') + 1);
                const mvSourceParent = resolvePath(mvSourceParentPath);
                if (mvSourceParent && mvSourceParent.contents) {
                    delete mvSourceParent.contents[mvSourceFileName];
                }
                return '';

            case 'alias':
                if (args.length === 0) {
                    // List all aliases
                    return Object.keys(aliases).map(key => `alias ${key}='${aliases[key]}'`).join('\n');
                }
                
                const aliasCmd = args[0];
                if (args.length === 1) {
                    return aliases[aliasCmd] ? `alias ${aliasCmd}='${aliases[aliasCmd]}'` : `alias: ${aliasCmd}: not found`;
                }
                
                const aliasValue = args.slice(1).join(' ');
                aliases[aliasCmd] = aliasValue;
                localStorage.setItem('terminalAliases', JSON.stringify(aliases));
                return '';

            case 'unalias':
                if (args.length === 0) {
                    return 'unalias: missing operand';
                }
                
                const unaliasCmd = args[0];
                if (aliases[unaliasCmd]) {
                    delete aliases[unaliasCmd];
                    localStorage.setItem('terminalAliases', JSON.stringify(aliases));
                }
                return '';

            case 'env':
                return Object.keys(environment).map(key => `${key}=${environment[key]}`).join('\n');

            case 'export':
                if (args.length === 0) {
                    return 'export: missing operand';
                }
                
                const exportParts = args[0].split('=');
                if (exportParts.length === 2) {
                    environment[exportParts[0]] = exportParts[1];
                }
                return '';

            case 'history':
                return commandHistory.map((cmd, index) => `${index + 1}  ${cmd}`).join('\n');

            case 'clear':
                return 'clear';

            case 'reset':
                setTheme('professional');
                setDarkMode(false);
                return 'clear';

            case 'help':
                return `Available commands:
File Operations:
- ls [directory]     List directory contents
- cd [directory]     Change directory
- pwd               Print working directory
- mkdir [dir]       Create directory
- touch [file]      Create file
- rm [file]         Remove file
- cp [src] [dest]   Copy file
- mv [src] [dest]   Move file
- cat [file]        Display file contents

System:
- whoami            Display user info
- version           Show site version
- date              Show current date and time
- env               Show environment variables
- export [var=val]  Set environment variable
- history           Show command history
- clear             Clear terminal
- reset             Reset theme to professional

Navigation:
- cd [project]      Navigate to a project
- github            Open GitHub profile
- bluesky           Open Bluesky profile

Themes:
- cyberpunk         Switch to cyberpunk theme
- professional      Switch to professional theme
- darkmode          Switch to dark mode
- lightmode         Switch to light mode

Utilities:
- echo [text]       Display text
- matrix            Toggle matrix effect
- alias [name=cmd]  Create command alias
- unalias [name]    Remove command alias
- help              Show this help message`;

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

            case 'whoami':
                return 'Developer, explorer, digital tinkerer.';

            case 'version':
                return '1ps0.info v2.0.0';

            case 'matrix':
                const canvas = document.getElementById('matrix-canvas');
                if (canvas) {
                    if (canvas.style.display === 'none') {
                        canvas.style.display = 'block';
                        return 'Matrix effect activated.';
                    } else {
                        canvas.style.display = 'none';
                        return 'Matrix effect deactivated.';
                    }
                }
                return 'Matrix effect not available.';

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

            default:
                if (command.trim() === '') {
                    return '';
                }
                return `Command not found: ${cmd}. Try 'help' for available commands.`;
        }
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

    // Enhanced terminal input handler with command history
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
                    
                    // Save history to localStorage
                    localStorage.setItem('terminalHistory', JSON.stringify(commandHistory));

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
            // Tab completion
            else if (e.key === 'Tab') {
                e.preventDefault();
                const currentInput = terminalInput.value;
                const cursorPos = terminalInput.selectionStart;
                const beforeCursor = currentInput.substring(0, cursorPos);
                const afterCursor = currentInput.substring(cursorPos);
                
                // Simple tab completion for commands
                const commands = ['ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'cat', 'help', 'clear', 'reset', 'whoami', 'version', 'date', 'echo', 'matrix', 'github', 'bluesky', 'cyberpunk', 'professional', 'darkmode', 'lightmode', 'env', 'export', 'history', 'alias', 'unalias'];
                
                const lastWord = beforeCursor.split(' ').pop();
                if (lastWord) {
                    const matches = commands.filter(cmd => cmd.startsWith(lastWord));
                    if (matches.length === 1) {
                        const newInput = beforeCursor.substring(0, beforeCursor.lastIndexOf(lastWord)) + matches[0] + afterCursor;
                        terminalInput.value = newInput;
                        terminalInput.setSelectionRange(beforeCursor.length - lastWord.length + matches[0].length, beforeCursor.length - lastWord.length + matches[0].length);
                    } else if (matches.length > 1) {
                        // Show possible completions
                        const completionDiv = document.createElement('div');
                        completionDiv.className = 'terminal-line visible';
                        completionDiv.textContent = matches.join('  ');
                        const inputContainer = document.querySelector('.terminal-input-container');
                        inputContainer.parentNode.insertBefore(completionDiv, inputContainer);
                    }
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

    // Initialize everything
    initializeTheme();
    initializeDarkMode();
    initializeTerminalEffect();
});
