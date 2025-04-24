# Terminal Feature Testing Guidelines

## Overview
This document outlines test cases for the terminal filesystem feature implemented in `assets/js/theme.js`. Use these tests to validate that the implementation meets the specifications in `docs/FEATURE-terminal-filesystem.md`.

## Red/Green Testing Methodology
1. Run each test in sequence
2. Mark failing tests as "RED" initially
3. Fix implementation issues until test passes
4. Mark passing tests as "GREEN"
5. Document any edge cases discovered during testing

## Test Categories

### Filesystem Initialization Tests

| ID | Test Description | Expected Result | Status |
|----|-----------------|----------------|--------|
| FS-01 | Open console and verify `filesystemState` exists | Object with filesystem, currentDirectory, sudo, and themes properties | [ ] |
| FS-02 | Check structure of default filesystem | Contains projects/, blog/, themes/ directories and about.txt, contact.txt, readme.md files | [ ] |
| FS-03 | Reload page and check if localStorage persists filesystem changes | Previously modified filesystem state is loaded | [ ] |

### Command Parsing Tests

| ID | Test Description | Expected Result | Status |
|----|-----------------|----------------|--------|
| CP-01 | Enter a command with the `--help` flag | Help text displayed, other flags ignored | [ ] |
| CP-02 | Enter a command with short flags (e.g., `ls -l`) | Flags correctly parsed, command executed with flag options | [ ] |
| CP-03 | Enter a command with combined short flags (e.g., `rm -rf`) | All flags recognized and applied | [ ] |
| CP-04 | Enter a command with long flags (e.g., `ls --all`) | Long flag correctly parsed and applied | [ ] |
| CP-05 | Enter a command with `sudo` prefix | Command executed with elevated privileges | [ ] |

### Navigation Command Tests

| ID | Test Description | Expected Result | Status |
|----|-----------------|----------------|--------|
| NC-01 | `pwd` shows current directory | Initially shows `/` | [ ] |
| NC-02 | `ls` without arguments | Lists contents of current directory | [ ] |
| NC-03 | `ls projects` | Shows binaural/, silicon-zen/, claude-ui/ | [ ] |
| NC-04 | `ls -l` | Shows detailed listing with permissions and size | [ ] |
| NC-05 | `ls -a` | Shows hidden files (if any) | [ ] |
| NC-06 | `cd projects` | Changes current directory to /projects | [ ] |
| NC-07 | `cd ..` | Moves up one directory level | [ ] |
| NC-08 | `cd /` | Changes to root directory from anywhere | [ ] |
| NC-09 | `cd` without arguments | Changes to root directory | [ ] |
| NC-10 | `cat about.txt` | Displays contents of about.txt | [ ] |
| NC-11 | `cat` with invalid file | Shows appropriate error message | [ ] |

### File Manipulation Tests

| ID | Test Description | Expected Result | Status |
|----|-----------------|----------------|--------|
| FM-01 | `rm` without arguments | Shows usage information | [ ] |
| FM-02 | `rm nonexistent.txt` | Shows appropriate error message | [ ] |
| FM-03 | `rm about.txt` | Removes file from filesystem | [ ] |
| FM-04 | `rm projects` without -r flag | Shows error about needing -r flag | [ ] |
| FM-05 | `rm -r projects/binaural` | Recursively removes directory | [ ] |
| FM-06 | `rm projects` without sudo | Shows permission denied message | [ ] |
| FM-07 | `sudo rm -r projects` | Successfully removes projects directory | [ ] |

### Theme Management Tests

| ID | Test Description | Expected Result | Status |
|----|-----------------|----------------|--------|
| TM-01 | `import --help` | Shows import command help text | [ ] |
| TM-02 | `export --help` | Shows export command help text | [ ] |
| TM-03 | `save --help` | Shows save command help text | [ ] |
| TM-04 | `clear --help` | Shows clear command help text | [ ] |
| TM-05 | `import custom.css` | Shows import functionality message | [ ] |
| TM-06 | `export custom.css` | Shows export functionality message | [ ] |
| TM-07 | `save custom.css` | Shows save functionality message | [ ] |
| TM-08 | `clear custom.css --storage` | Shows theme cleared from storage message | [ ] |

### System Command Tests

| ID | Test Description | Expected Result | Status |
|----|-----------------|----------------|--------|
| SC-01 | `matrix` | Toggles matrix effect | [ ] |
| SC-02 | `matrix --on` | Force enables matrix effect | [ ] |
| SC-03 | `matrix --off` | Force disables matrix effect | [ ] |
| SC-04 | `sudo --help` | Shows sudo command help text | [ ] |
| SC-05 | `sudo ls` | Executes ls command with elevated privileges | [ ] |
| SC-06 | `shutdown` | Shows shutdown animation | [ ] |

### Error Handling Tests

| ID | Test Description | Expected Result | Status |
|----|-----------------|----------------|--------|
| EH-01 | Enter invalid command | Shows command not found message | [ ] |
| EH-02 | `cd` to non-existent directory | Shows appropriate error message | [ ] |
| EH-03 | `ls` for non-existent directory | Shows appropriate error message | [ ] |
| EH-04 | `cat` on a directory | Shows "Is a directory" error message | [ ] |
| EH-05 | Path traversal test (`cd ../../../`) | Handles safely, doesn't break filesystem | [ ] |

## Integration Tests

| ID | Test Description | Expected Result | Status |
|----|-----------------|----------------|--------|
| IT-01 | Command history using up/down arrows | Shows previously entered commands | [ ] |
| IT-02 | Persistence across page reloads | Filesystem changes persist via localStorage | [ ] |
| IT-03 | Terminal scrolling for long outputs | Automatically scrolls to bottom | [ ] |
| IT-04 | Clear terminal and state with `reset` | Terminal clears, theme resets to professional | [ ] |

## User Experience Tests

| ID | Test Description | Expected Result | Status |
|----|-----------------|----------------|--------|
| UX-01 | Terminal cursor position | Updates correctly as you type | [ ] |
| UX-02 | Terminal responsiveness | Commands execute without noticeable delay | [ ] |
| UX-03 | Mobile device compatibility | Terminal works on touch devices | [ ] |
| UX-04 | Help text formatting | Help text is readable and properly formatted | [ ] |

## Edge Case Tests

| ID | Test Description | Expected Result | Status |
|----|-----------------|----------------|--------|
| EC-01 | Very long command input | Handles without breaking layout | [ ] |
| EC-02 | Very long command output | Displays correctly with scrolling | [ ] |
| EC-03 | Rapid command execution | Handles multiple commands in quick succession | [ ] |
| EC-04 | Special characters in filenames | Handles without breaking filesystem | [ ] |

## Flag Handling Validation

| ID | Test Description | Expected Result | Status |
|----|-----------------|----------------|--------|
| FH-01 | Command with multiple flags and args | All flags parsed correctly, args separated | [ ] |
| FH-02 | Command with conflicting flags | One flag takes precedence per documentation | [ ] |
| FH-03 | `--help` with other flags present | Help text shown, other flags ignored | [ ] |
| FH-04 | `--help` with sudo prefix | Help text shown with elevated context if relevant | [ ] |

## Test Execution Notes

1. Complete all tests in order
2. Document any failures with screenshots
3. Track fixed issues and retests
4. Note any unexpected behavior even if test passes

## Compatibility Verification 

Verify terminal functionality in:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS, Android) 