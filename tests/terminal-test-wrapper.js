/**
 * Terminal Test Wrapper
 * 
 * This file provides a non-intrusive way to test the terminal functionality
 * by observing the DOM and terminal interactions rather than exposing internal functions.
 * 
 * It should ONLY be loaded in the test environment, never in production.
 */

// Define the wrapper and explicitly attach it to the window object
(function() {
  console.log('Creating TerminalTestWrapper...');
  
  // Store original console methods to avoid interfering with normal operation
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn
  };
  
  // Initialize elements reference function to be called after DOM is ready
  const getElements = function() {
    return {
      input: document.getElementById('terminal-input'),
      terminalSection: document.querySelector('.terminal-section'),
      responseElement: document.getElementById('command-response')
    };
  };
  
  // Store elements
  let elements = null;
  
  // Track command output
  let lastCommandOutput = '';
  let commandHistory = [];
  
  // Observe DOM changes in the terminal section to capture command outputs
  const setupObserver = function() {
    if (!elements || !elements.terminalSection) {
      console.error('Terminal section not found when setting up observer');
      return null;
    }
    
    // Track current command output lines
    let currentCommandLines = [];
    
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          // New terminal line added - could be command output
          const addedLines = Array.from(mutation.addedNodes)
            .filter(node => node.nodeType === Node.ELEMENT_NODE && 
                           node.classList.contains('terminal-line'));
          
          if (addedLines.length > 0) {
            // Process each added line
            addedLines.forEach(line => {
              if (!line.textContent.startsWith('$')) {
                // This is output, not a command
                const lineContent = line.textContent.trim();
                console.log('Captured output from terminal line:', lineContent === '' ? '<empty string>' : lineContent);
                
                // Add to current response lines
                currentCommandLines.push(lineContent);
                
                // Update full output
                lastCommandOutput = currentCommandLines.join('\n');
              } else {
                // This is a new command - reset collection
                currentCommandLines = [];
              }
            });
          }
        }
        
        // Also check for changes to the command-response element
        if (elements.responseElement) {
          const responseContent = elements.responseElement.textContent.trim();
          if (responseContent && responseContent !== lastCommandOutput) {
            console.log('Captured output from command-response:', responseContent);
            lastCommandOutput = responseContent;
          }
        }
      }
    });
    
    observer.observe(elements.terminalSection, { 
      childList: true,
      subtree: true,
      characterData: true
    });
    
    // Also observe the command response element directly
    if (elements.responseElement) {
      observer.observe(elements.responseElement, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
    
    return observer;
  };
  
  // Simulate executing a command
  const runCommand = function(command) {
    if (!elements || !elements.input) {
      console.error('Terminal input element not found');
      return null;
    }
    
    // Clear previous output tracking
    lastCommandOutput = '';
    
    // Set the command in the input
    elements.input.value = command;
    
    // Log the command being executed for debugging
    console.log(`Executing command: ${command}`);
    
    // Simulate Enter key press
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true
    });
    
    // Dispatch the event
    elements.input.dispatchEvent(enterEvent);
    
    // Track the command in history
    commandHistory.push(command);
    
    // Return what we can observe
    return {
      command,
      // Note: this might not capture all output due to async nature
      // For more reliable testing, use the waitForOutput method
      output: lastCommandOutput  
    };
  };
  
  // Wait for command output to be available
  const waitForOutput = function(timeoutMs = 1500) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkInterval = 50;
      
      // First, add a small delay to allow the command to process
      setTimeout(() => {
        // Check if we already have output (happens with fast commands)
        if (lastCommandOutput) {
          console.log(`Got immediate output in ${Date.now() - startTime}ms: ${lastCommandOutput.substring(0, 30)}...`);
          resolve(lastCommandOutput);
          return;
        }
        
        // Check direct response from command-response element
        if (elements.responseElement && elements.responseElement.textContent.trim()) {
          lastCommandOutput = elements.responseElement.textContent.trim();
          console.log(`Got response element output in ${Date.now() - startTime}ms: ${lastCommandOutput.substring(0, 30)}...`);
          resolve(lastCommandOutput);
          return;
        }
        
        const checkOutput = function() {
          if (lastCommandOutput) {
            console.log(`Got output in ${Date.now() - startTime}ms: ${lastCommandOutput.substring(0, 30)}...`);
            resolve(lastCommandOutput);
            return;
          }
          
          // Check command-response element again
          if (elements.responseElement && elements.responseElement.textContent.trim()) {
            lastCommandOutput = elements.responseElement.textContent.trim();
            console.log(`Got response element output in ${Date.now() - startTime}ms: ${lastCommandOutput.substring(0, 30)}...`);
            resolve(lastCommandOutput);
            return;
          }
          
          // Check all terminal lines that were added after our command
          const terminalLines = document.querySelectorAll('.terminal-line');
          if (terminalLines.length > 0) {
            // Find lines after the command we just issued
            // Assuming the last few lines might contain our output
            for (let i = terminalLines.length - 1; i >= 0; i--) {
              const line = terminalLines[i];
              if (!line.textContent.startsWith('$') && !line.textContent.includes(commandHistory[commandHistory.length-1])) {
                lastCommandOutput = line.textContent.trim();
                console.log(`Found output in terminal lines after ${Date.now() - startTime}ms`);
                resolve(lastCommandOutput);
                return;
              }
            }
          }
          
          if (Date.now() - startTime > timeoutMs) {
            console.error(`Timeout after ${timeoutMs}ms waiting for output from command: ${commandHistory[commandHistory.length-1]}`);
            reject(new Error('Timeout waiting for command output'));
            return;
          }
          
          setTimeout(checkOutput, checkInterval);
        };
        
        checkOutput();
      }, 200); // Short initial delay to let the command execute
    });
  };
  
  // Get the current filesystem state by observing what's visible
  const observeFilesystem = function() {
    // This is an approximation - we can only see what's rendered
    // Run commands to inspect the filesystem
    runCommand('pwd');
    const currentDir = lastCommandOutput;
    
    runCommand('ls -l');
    const dirContents = lastCommandOutput;
    
    return {
      currentDirectory: currentDir,
      visibleContents: dirContents.split('\n')
    };
  };
  
  // Initialize the test wrapper
  const init = function() {
    console.log('Terminal Test Wrapper initializing...');
    elements = getElements();
    
    if (!elements.terminalSection) {
      console.error('Terminal section not found during initialization');
      return false;
    }
    
    const observer = setupObserver();
    console.log('Terminal Test Wrapper fully initialized');
    return {
      observer,
      elements
    };
  };
  
  // Create the public API
  window.TerminalTestWrapper = {
    init,
    runCommand,
    waitForOutput,
    observeFilesystem,
    getCommandHistory: () => [...commandHistory]
  };
  
  console.log('TerminalTestWrapper object created and attached to window');
})();

// Initialize the wrapper when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded event fired, initializing TerminalTestWrapper...');
  setTimeout(() => {
    if (window.TerminalTestWrapper && typeof window.TerminalTestWrapper.init === 'function') {
      window.TerminalTestWrapper.init();
      console.log('TerminalTestWrapper initialized via DOM ready event');
    } else {
      console.error('Failed to initialize TerminalTestWrapper - not found on window object');
    }
  }, 500); // Small delay to ensure DOM is fully ready
}); 