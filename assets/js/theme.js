// assets/js/theme.js

document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const terminalInput = document.getElementById('terminal-input');
    const commandResponse = document.getElementById('command-response');
    
    // Command history
    const commandHistory = [];
    let historyIndex = -1;
    
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
    
    // Enhanced command handler
    function handleCommand(command) {
        // Parse command and arguments
        const parts = command.trim().split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        switch(cmd) {
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
            case 'reset':
                return 'clear';
                
            case 'help':
                return `Available commands:
- help            Show this help message
- ls [directory]  List contents of directory
- cd [directory]  Navigate to a project
- cat [file]      Display file contents
- whoami          Display user info
- matrix          Toggle matrix effect
- date            Show current date and time
- echo [text]     Display text
- cyberpunk       Switch to cyberpunk theme
- professional    Switch to professional theme
- darkmode        Switch to dark mode
- lightmode       Switch to light mode
- clear/reset     Clear terminal
- github          Open GitHub profile
- bluesky         Open Bluesky profile`;
                
            case 'ls':
                if (args[0] === 'projects' || args[0] === 'projects/') {
                    return 'binaural/ silicon-zen/ claude-ui/';
                } else if (args[0] === 'blog' || args[0] === 'blog/') {
                    return 'turtles-all-the-way-up.md recent-thoughts.md ai-philosophy.md';
                } else if (args.length === 0) {
                    return 'projects/ blog/ about.txt contact.txt readme.md';
                } else {
                    return `ls: ${args[0]}: No such directory`;
                }
                
            case 'whoami':
                return 'Developer, explorer, digital tinkerer.';
                
            case 'cat':
                if (args.length === 0) {
                    return 'Usage: cat [filename]';
                }
                
                const files = {
                    'about.txt': 'Welcome to my digital outpost. This is where I showcase my projects and experiments.',
                    'contact.txt': 'GitHub: @1ps0\nBluesky: @1ps0.bsky.social',
                    'readme.md': '# 1ps0 Digital Outpost\n\nThis site showcases my projects exploring the intersection of technology, consciousness, and human-AI collaboration.',
                };
                
                if (files[args[0]]) {
                    return files[args[0]];
                } else {
                    return `cat: ${args[0]}: No such file`;
                }
                
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
                
            case 'cd':
                if (args.length === 0) {
                    return 'Usage: cd [directory]';
                }
                
                if (args[0] === 'binaural') {
                    window.location.href = 'https://1ps0.github.io/binaural';
                    return 'Navigating to binaural...';
                } else if (args[0] === 'silicon-zen') {
                    window.location.href = 'https://1ps0.github.io/silicon-zen';
                    return 'Navigating to silicon-zen...';
                } else if (args[0] === 'claude-ui') {
                    window.location.href = 'https://1ps0.github.io/claude-ui';
                    return 'Navigating to claude-ui...';
                } else {
                    return `cd: ${args[0]}: No such directory`;
                }
                
            // Fun easter egg commands
            case 'hack':
                return 'ACCESS DENIED: Unauthorized access attempt detected and logged.';
                
            case '42':
                return 'Indeed, that is the answer to the ultimate question of life, the universe, and everything.';
                
            case 'sudo':
                return 'Permission granted. Just kidding, sudo doesn\'t work here!';
                
            case 'exit':
                return 'There is no escape from the digital frontier...';
                
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
    
    // Terminal input handler with command history
    if (terminalInput) {
        terminalInput.addEventListener('keydown', function(e) {
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
                            const responseDiv = document.createElement('div');
                            responseDiv.className = 'terminal-line visible';
                            responseDiv.textContent = response;
                            inputContainer.parentNode.insertBefore(responseDiv, inputContainer);
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
                    
                    // Scroll to bottom of terminal
                    const terminalSection = document.querySelector('.terminal-section');
                    terminalSection.scrollTop = terminalSection.scrollHeight;
                }
            } 
            // Command history navigation
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    terminalInput.value = commandHistory[historyIndex];
                }
            } 
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    terminalInput.value = commandHistory[historyIndex];
                } else if (historyIndex === commandHistory.length - 1) {
                    historyIndex = commandHistory.length;
                    terminalInput.value = '';
                }
            }
        });
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
    
    // Make terminal input focus when clicking anywhere in the terminal section
    const terminalSection = document.querySelector('.terminal-section');
    if (terminalSection) {
        terminalSection.addEventListener('click', function() {
            if (terminalInput) {
                terminalInput.focus();
            }
        });
    }
    
    // Initialize everything
    initializeTheme();
    initializeDarkMode();
    initializeTerminalEffect();
});
