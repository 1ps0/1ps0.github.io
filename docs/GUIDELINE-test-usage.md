# Terminal Test Framework Guidelines

This document outlines recommended approaches for testing the terminal filesystem feature without compromising production code quality.

## Separating Test Code from Production Code

For professional testing practices, keep test code completely separate from production code:

1. **Never expose internal functions/state globally**
2. **Don't add test hooks to production code**
3. **Use a proper build system that separates dev/test/prod environments**

## Recommended Testing Approaches

### Approach 1: Separate Test Environment

Create a separate testing HTML file that imports both production and test code:

```html
<!-- test.html - never deployed to production -->
<!DOCTYPE html>
<html>
<head>
    <title>Terminal Tests</title>
</head>
<body>
    <div id="test-terminal"></div>
    
    <!-- Import production code -->
    <script src="/assets/js/theme.js"></script>
    
    <!-- Import test-only wrapper that doesn't modify production code -->
    <script src="/tests/terminal-test-wrapper.js"></script>
    
    <!-- Import actual tests -->
    <script src="/tests/terminal-tests.js"></script>
</body>
</html>
```

### Approach 2: Module Pattern with Dependency Injection

Refactor the terminal code to support testing through dependency injection:

```javascript
// Production code - theme.js
const TerminalSystem = (function(config = {}) {
    // Default dependencies
    const deps = {
        storage: window.localStorage,
        document: window.document,
        ...config
    };
    
    // Internal state
    const filesystemState = {...};
    
    // Public API
    return {
        handleCommand: function(command) {...},
        initializeTerminal: function() {...}
    };
})();

// Test code - never included in production
// terminal-test.js
const mockStorage = {
    getItem: jest.fn(),
    setItem: jest.fn()
};

const testTerminal = TerminalSystem({
    storage: mockStorage,
    document: mockDocument
});

test('handleCommand processes ls correctly', () => {
    // Test using the testTerminal instance
});
```

### Approach 3: Jest/Mocha with JSDOM

For more robust testing, use a proper testing framework:

1. Set up Jest or Mocha with JSDOM to simulate the browser environment
2. Use module bundlers like Webpack or Rollup with environment configurations
3. Create separate entry points for testing vs. production

## Testing Workflow

Instead of including tests in the main site:

1. Create a separate test runner page accessible only in development
2. Use proper unit test isolation techniques
3. Add automated testing to your CI/CD pipeline
4. Consider test-driven development (TDD) for new features

## Integrating with Jekyll

For Jekyll-based sites, consider:

1. Placing tests in a separate `_tests` directory excluded from production builds
2. Using Jekyll environments to conditionally include test pages:

```html
{% if jekyll.environment == 'development' %}
<a href="/tests/terminal-test-runner.html">Run Terminal Tests</a>
{% endif %}
```

## Test Plan Strategy

The RED/GREEN testing approach is still valid:

1. Write failing tests first (RED)
2. Implement features until tests pass (GREEN)
3. Refactor code while maintaining passing tests

However, this testing should happen in isolation from the production code, with proper separation of concerns.

## Setup

1. Include the test script in your HTML file:

```html
<script src="/assets/js/terminal-tests.js"></script>
```

2. Run tests using the browser console:

```javascript
runTerminalTests();
```

## Test Panel

When the test script loads, it adds a floating test panel to the page that shows test results. You can toggle this panel using the "Toggle Test Panel" button in the top-right corner.

## Red/Green Testing

The terminal test framework follows a red/green testing approach:

1. **Red Phase**: Initially, most tests will fail (show as red) because the implementation is incomplete
2. **Green Phase**: As you implement features, tests will start to pass (show as green)

Use this visual feedback to guide your development process.

## Adding Tests

You can add more tests to the test suite using the TerminalTester API:

```javascript
TerminalTester.runTest('NC-03', 'ls projects test', function() {
  // Reset to root directory for test consistency
  window.filesystemState.currentDirectory = '/';
  
  const result = window.handleCommand('ls projects');
  TerminalTester.log(`ls projects result: ${result}`);
  
  // Check if output contains expected directories
  return result.includes('binaural') && 
         result.includes('silicon-zen') && 
         result.includes('claude-ui');
});
```

## Common Test Issues

1. **Inaccessible Functions**: If tests report functions as inaccessible, you need to expose them as described above
2. **Inconsistent State**: Use reset functions before each test to ensure a consistent starting state
3. **Async Issues**: Some commands like `shutdown` use timeouts - you may need to use async tests for these

## Command Line Test Limitations

Some tests that involve UI interactions (like matrix effects or terminal display) cannot be fully automated. These should be marked for manual verification.

## Manual Test Steps

For tests that can't be automated:

1. The test will set up the necessary conditions
2. It will output instructions for manual verification
3. You should verify the behavior matches the expected result

## Extending the Test Framework

You can extend the framework with additional features:

- Test specific categories: `runTerminalTests(['FS', 'NC'])`
- Skip certain tests: `runTerminalTests({ skip: ['SC-06'] })`
- Custom test reporters for CI/CD

## Test Status Tracking

Use the tables in GUIDELINE-feature-testing.md to track overall test status. After running the tests, update the status column with:

- ✅ GREEN: Test passes
- 🔴 RED: Test fails
- ⚠️ YELLOW: Test partially passes
- 🟣 PURPLE: Test needs manual verification 