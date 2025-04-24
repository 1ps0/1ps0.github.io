// Terminal functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if terminal element exists on page
    const terminalSection = document.querySelector('.terminal-section');
    if (!terminalSection) return;
    
    // Set up terminal variables
    const terminal = {
        container: terminalSection,
        lines: terminalSection.querySelectorAll('.terminal-line'),
        inputContainer: terminalSection.querySelector('.terminal-input-container'),
        inputField: terminalSection.querySelector('.terminal-input'),
        cursor: terminalSection.querySelector('.cursor'),
        commandHistory: [],
        historyIndex: -1,
        currentDirectory: '~',
        commands: {
            'help': showHelp,
            'clear': clearTerminal,
            'ls': listDirectory,
            'cd': changeDirectory,
            'pwd': printWorkingDirectory,
            'cat': catFile,
            'echo': echo,
            'man': manual,
            'date': showDate,
            'whoami': whoami,
            'theme': switchTheme
        },
        fileSystem: {
            '~': {
                'about.txt': 'I am a software engineer with a passion for web development and problem-solving.',
                'skills.txt': 'JavaScript, TypeScript, HTML, CSS, React, Node.js, and more.',
                'contact.txt': 'Email: example@example.com\nGitHub: github.com/example',
                'projects': {
                    'project1.txt': 'A web application built with React and Node.js.',
                    'project2.txt': 'A CLI tool built with TypeScript.',
                }
            }
        }
    };

    // Run a theme-appropriate startup sequence
    const currentTheme = document.body.classList.contains('theme-cyber') ? 'cyber' : 'professional';
    runStartupSequence(terminal, currentTheme);

    // Event listeners
    terminal.inputField.addEventListener('keydown', function(e) {
        handleKeyDown(e, terminal);
    });
});

// Run a startup sequence based on the current theme
function runStartupSequence(terminal, theme) {
    // Hide input container initially
    terminal.inputContainer.style.display = 'none';
    terminal.container.classList.add('starting');
    
    if (theme === 'cyber') {
        runCyberpunkStartup(terminal);
    } else {
        runProfessionalStartup(terminal);
    }
}

// VSCode-like professional terminal startup
function runProfessionalStartup(terminal) {
    // Clear any existing lines
    Array.from(terminal.container.querySelectorAll('.terminal-line')).forEach(line => line.remove());
    
    const startupLines = [
        'Initializing terminal environment...',
        'Loading configuration...',
        'Setting up workspace...',
        'Environment ready.'
    ];
    
    // Add startup lines with delay
    startupLines.forEach((text, index) => {
        setTimeout(() => {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.textContent = text;
            terminal.container.insertBefore(line, terminal.inputContainer);
            
            // Animate appearance with a typing effect
            line.classList.add('typing');
            setTimeout(() => line.classList.add('visible'), 50);
            
            // Show welcome message and prompt on completion
            if (index === startupLines.length - 1) {
                setTimeout(() => {
                    const welcomeLine = document.createElement('div');
                    welcomeLine.className = 'terminal-line';
                    welcomeLine.innerHTML = 'Welcome to the terminal. Type <span class="command-highlight">help</span> for available commands.';
                    terminal.container.insertBefore(welcomeLine, terminal.inputContainer);
                    welcomeLine.classList.add('visible');
                    
                    // Show input container
                    setTimeout(() => {
                        terminal.inputContainer.style.display = '';
                        terminal.container.classList.remove('starting');
                        updatePrompt(terminal);
                        terminal.inputField.focus();
                    }, 500);
                }, 300);
            }
        }, index * 400);
    });
}

// Classic hacker-style cyberpunk startup
function runCyberpunkStartup(terminal) {
    // Clear any existing lines
    Array.from(terminal.container.querySelectorAll('.terminal-line')).forEach(line => line.remove());
    
    const bootLines = [
        'SYSTEM v2.4.1 BOOT SEQUENCE INITIATED',
        'Performing system check...',
        'CPU: OK',
        'MEMORY: 16384K OK',
        'INITIALIZING CORE SYSTEMS...',
        '[OK] Filesystem',
        '[OK] Network',
        '[OK] Security',
        'LOADING SHELL INTERFACE...',
        'CYBERTERMINAL READY'
    ];
    
    // Add boot lines with glitch effect
    bootLines.forEach((text, index) => {
        setTimeout(() => {
            const line = document.createElement('div');
            line.className = 'terminal-line boot-line';
            line.textContent = text;
            terminal.container.insertBefore(line, terminal.inputContainer);
            
            // Add glitch effect randomly
            if (Math.random() > 0.7) {
                line.classList.add('glitch-text');
            }
            
            setTimeout(() => line.classList.add('visible'), 50);
            
            // Show welcome message and prompt on completion
            if (index === bootLines.length - 1) {
                setTimeout(() => {
                    const accessLine = document.createElement('div');
                    accessLine.className = 'terminal-line';
                    accessLine.innerHTML = '>> ACCESS GRANTED <<';
                    terminal.container.insertBefore(accessLine, terminal.inputContainer);
                    accessLine.classList.add('visible', 'glitch-text');
                    
                    setTimeout(() => {
                        const welcomeLine = document.createElement('div');
                        welcomeLine.className = 'terminal-line';
                        welcomeLine.innerHTML = 'Type <span class="command-highlight">help</span> to list available commands.';
                        terminal.container.insertBefore(welcomeLine, terminal.inputContainer);
                        welcomeLine.classList.add('visible');
                        
                        // Show input container
                        setTimeout(() => {
                            terminal.inputContainer.style.display = '';
                            terminal.container.classList.remove('starting');
                            updatePrompt(terminal);
                            terminal.inputField.focus();
                        }, 500);
                    }, 700);
                }, 500);
            }
        }, index * 300);
    });
}

// Initialize the terminal
function initTerminal(terminal) {
    // Set focus to input field
    terminal.inputField.focus();
    
    // Ensure cursor stays visible
    window.addEventListener('click', function() {
        terminal.inputField.focus();
    });
    
    // Handle clicks inside terminal
    terminal.container.addEventListener('click', function() {
        terminal.inputField.focus();
    });
    
    // Update current path in prompt
    updatePrompt(terminal);
}

// Handle key presses
function handleKeyDown(e, terminal) {
    // Handle up/down arrow for command history
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateHistory(-1, terminal);
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateHistory(1, terminal);
    } else if (e.key === 'Tab') {
        e.preventDefault();
        tabCompletion(terminal);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = terminal.inputField.textContent.trim();
        if (command) {
            processCommand(command, terminal);
        }
    }
}

// Process entered commands
function processCommand(commandStr, terminal) {
    // Add command to terminal display
    addLine(`<span class="terminal-prompt">${terminal.currentDirectory} $</span> ${commandStr}`, terminal);
    
    // Add to command history
    terminal.commandHistory.unshift(commandStr);
    terminal.historyIndex = -1;
    
    // Parse command and args
    const args = commandStr.split(' ');
    const command = args.shift().toLowerCase();
    
    // Execute command if it exists
    if (terminal.commands[command]) {
        terminal.commands[command](args, terminal);
    } else {
        addLine(`Command not found: ${command}. Type "help" for available commands.`, terminal);
    }
    
    // Clear input and update prompt
    terminal.inputField.textContent = '';
    updatePrompt(terminal);
    
    // Scroll to bottom
    terminal.container.scrollTop = terminal.container.scrollHeight;
}

// Add a line to the terminal
function addLine(text, terminal, isResponse = false) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    if (isResponse) {
        line.className += ' command-response';
    }
    line.innerHTML = text;
    
    // Insert before input container
    terminal.container.insertBefore(line, terminal.inputContainer);
    
    // Animate appearance
    setTimeout(() => {
        line.classList.add('visible');
    }, 10);
    
    return line;
}

// Clear the terminal
function clearTerminal(args, terminal) {
    // Remove all lines except input container
    const lines = terminal.container.querySelectorAll('.terminal-line');
    lines.forEach(line => line.remove());
}

// Update prompt with current directory
function updatePrompt(terminal) {
    const promptSpan = terminal.inputContainer.querySelector('.terminal-prompt');
    if (promptSpan) {
        promptSpan.textContent = `${terminal.currentDirectory} $`;
    }
}

// Navigate command history
function navigateHistory(direction, terminal) {
    // Early return if no history
    if (terminal.commandHistory.length === 0) return;
    
    // Update history index
    terminal.historyIndex += direction;
    
    // Bounds checking
    if (terminal.historyIndex < -1) {
        terminal.historyIndex = -1;
    } else if (terminal.historyIndex >= terminal.commandHistory.length) {
        terminal.historyIndex = terminal.commandHistory.length - 1;
    }
    
    // Update input field
    if (terminal.historyIndex === -1) {
        terminal.inputField.textContent = '';
    } else {
        terminal.inputField.textContent = terminal.commandHistory[terminal.historyIndex];
    }
    
    // Move cursor to end
    moveCursorToEnd(terminal);
}

// Move cursor to end of input
function moveCursorToEnd(terminal) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(terminal.inputField);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

// Tab completion function
function tabCompletion(terminal) {
    const text = terminal.inputField.textContent;
    const args = text.split(' ');
    
    // If first word (command completion)
    if (args.length === 1) {
        const partialCmd = args[0].toLowerCase();
        if (partialCmd) {
            const matches = Object.keys(terminal.commands).filter(cmd => 
                cmd.startsWith(partialCmd)
            );
            
            if (matches.length === 1) {
                terminal.inputField.textContent = matches[0];
                moveCursorToEnd(terminal);
            } else if (matches.length > 1) {
                addLine(`<span class="terminal-prompt">${terminal.currentDirectory} $</span> ${text}`, terminal);
                addLine(matches.join('  '), terminal, true);
            }
        }
    }
    // More advanced tab completion for paths could be added here
}

// Command functions
function showHelp(args, terminal) {
    const commands = Object.keys(terminal.commands).sort();
    addLine('Available commands:', terminal, true);
    addLine(commands.join(', '), terminal, true);
    addLine('Type "man [command]" for more information on a specific command.', terminal, true);
}

function listDirectory(args, terminal) {
    // Simplified ls command for demo purposes
    addLine('about.txt  skills.txt  contact.txt  projects/', terminal, true);
}

function changeDirectory(args, terminal) {
    if (!args.length) {
        terminal.currentDirectory = '~';
    } else {
        // Simplified cd for demo purposes
        if (args[0] === 'projects') {
            terminal.currentDirectory = '~/projects';
        } else if (args[0] === '..') {
            terminal.currentDirectory = '~';
        } else {
            addLine(`cd: ${args[0]}: No such directory`, terminal, true);
        }
    }
    updatePrompt(terminal);
}

function printWorkingDirectory(args, terminal) {
    addLine(`/home/user${terminal.currentDirectory.substring(1)}`, terminal, true);
}

function catFile(args, terminal) {
    if (!args.length) {
        addLine('Usage: cat [filename]', terminal, true);
        return;
    }
    
    // Simplified file system for demo purposes
    const fileContents = {
        'about.txt': 'I am a software engineer with a passion for web development and problem-solving.',
        'skills.txt': 'JavaScript, TypeScript, HTML, CSS, React, Node.js, and more.',
        'contact.txt': 'Email: example@example.com\nGitHub: github.com/example',
        'project1.txt': 'A web application built with React and Node.js.',
        'project2.txt': 'A CLI tool built with TypeScript.'
    };
    
    if (fileContents[args[0]]) {
        const content = fileContents[args[0]].split('\n');
        content.forEach(line => {
            addLine(line, terminal, true);
        });
    } else {
        addLine(`cat: ${args[0]}: No such file`, terminal, true);
    }
}

function echo(args, terminal) {
    addLine(args.join(' '), terminal, true);
}

function manual(args, terminal) {
    if (!args.length) {
        addLine('Usage: man [command]', terminal, true);
        return;
    }
    
    const manPages = {
        'help': 'help: Display a list of available commands.',
        'clear': 'clear: Clear the terminal screen.',
        'ls': 'ls: List directory contents.',
        'cd': 'cd: Change the current directory.',
        'pwd': 'pwd: Print the current working directory.',
        'cat': 'cat: Concatenate and display file contents.',
        'echo': 'echo: Display a line of text.',
        'man': 'man: Display the manual page for a command.',
        'date': 'date: Display the current date and time.',
        'whoami': 'whoami: Display the current user.',
        'theme': 'theme: Switch between light and dark themes.'
    };
    
    if (manPages[args[0]]) {
        addLine(manPages[args[0]], terminal, true);
    } else {
        addLine(`No manual entry for ${args[0]}`, terminal, true);
    }
}

function showDate(args, terminal) {
    const now = new Date();
    addLine(now.toString(), terminal, true);
}

function whoami(args, terminal) {
    addLine('user', terminal, true);
}

function switchTheme(args, terminal) {
    const body = document.body;
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        addLine('Switched to light theme', terminal, true);
    } else {
        body.classList.add('dark-mode');
        addLine('Switched to dark theme', terminal, true);
    }
} 