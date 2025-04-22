// assets/js/theme.js

document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const terminalInput = document.getElementById('terminal-input');
    const commandResponse = document.getElementById('command-response');
    
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
    
    // Handle commands
    function handleCommand(command) {
        command = command.toLowerCase().trim();
        
        switch(command) {
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
                return 'clear';
            case 'help':
                return 'Available commands: darkmode, lightmode, cyberpunk, professional, clear, help';
            case 'ls':
                return 'binaural/ silicon-zen/ claude-ui/';
            case 'whoami':
                return 'Developer, explorer, digital tinkerer.';
            case 'cat about.txt':
                return 'Welcome to my digital outpost. This is where I showcase my projects and experiments.';
            default:
                if (command.startsWith('cd ')) {
                    const target = command.substr(3);
                    if (target === 'binaural') {
                        window.location.href = 'https://1ps0.github.io/binaural';
                        return 'Navigating to binaural...';
                    } else if (target === 'silicon-zen') {
                        window.location.href = 'https://1ps0.github.io/silicon-zen';
                        return 'Navigating to silicon-zen...';
                    } else if (target === 'claude-ui') {
                        window.location.href = 'https://1ps0.github.io/claude-ui';
                        return 'Navigating to claude-ui...';
                    } else {
                        return `cd: ${target}: No such directory`;
                    }
                }
                return `Command not found: ${command}. Try 'help' for available commands.`;
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
    
    // Terminal input handler
    if (terminalInput) {
        terminalInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const command = terminalInput.value;
                
                if (command) {
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
                        const responseDiv = document.createElement('div');
                        responseDiv.className = 'terminal-line visible';
                        responseDiv.textContent = response;
                        inputContainer.parentNode.insertBefore(responseDiv, inputContainer);
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
    
    // Initialize everything
    initializeTheme();
    initializeDarkMode();
    initializeTerminalEffect();
});
