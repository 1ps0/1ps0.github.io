// assets/js/theme.js

document.addEventListener('DOMContentLoaded', function() {
    // Theme state management
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const commandInput = document.getElementById('command-input');
    const commandSubmit = document.getElementById('command-submit');
    const body = document.body;
    
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
        
        // Initialize mode toggle
        const currentTheme = localStorage.getItem('siteTheme') || 'professional';
        themeToggleBtn.classList.toggle('active', currentTheme === 'cyberpunk');
        themeToggleBtn.querySelector('.theme-toggle-label').textContent = 
            currentTheme === 'cyberpunk' ? 'Cyberpunk Mode' : 'Professional Mode';
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
        
        // Update toggle appearance
        if (themeToggleBtn) {
            themeToggleBtn.querySelector('.theme-toggle-label').textContent = 
                theme === 'cyberpunk' ? 'Cyberpunk Mode' : 'Professional Mode';
            themeToggleBtn.classList.toggle('active', theme === 'cyberpunk');
        }
        
        // Filter blog posts based on theme
        filterBlogPosts(theme);
    }
    
    // Toggle between themes
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            const currentTheme = localStorage.getItem('siteTheme') || 'professional';
            const newTheme = currentTheme === 'professional' ? 'cyberpunk' : 'professional';
            setTheme(newTheme);
        });
    }
    
    // Handle commands
    function handleCommand(command) {
        command = command.toLowerCase().trim();
        
        switch(command) {
            case 'darkmode':
                setDarkMode(true);
                return 'Dark mode activated';
            case 'lightmode':
                setDarkMode(false);
                return 'Light mode activated';
            case 'cyberpunk':
                setTheme('cyberpunk');
                return 'Cyberpunk theme activated';
            case 'professional':
                setTheme('professional');
                return 'Professional theme activated';
            case 'help':
                return 'Available commands: darkmode, lightmode, cyberpunk, professional, help';
            default:
                return 'Unknown command. Try "help" for available commands.';
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
    
    // Command input handler
    if (commandSubmit && commandInput) {
        commandSubmit.addEventListener('click', function() {
            const command = commandInput.value;
            if (command) {
                const response = handleCommand(command);
                
                // Show response
                const responseEl = document.createElement('div');
                responseEl.className = 'command-response';
                responseEl.textContent = response;
                commandInput.parentNode.appendChild(responseEl);
                
                // Remove after 3 seconds
                setTimeout(() => {
                    responseEl.remove();
                }, 3000);
                
                commandInput.value = '';
            }
        });
        
        commandInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                commandSubmit.click();
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
        const terminalLines = document.querySelectorAll('.terminal-line');
        terminalLines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('visible');
            }, 300 * (index + 1));
        });
    }
    
    // Initialize everything
    initializeTheme();
    initializeDarkMode();
    initializeTerminalEffect();
});
