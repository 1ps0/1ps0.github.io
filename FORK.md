# Forking 1ps0.github.io For Your Own Use

Want to create your own version of this personal site with terminal functionality? This guide will walk you through the process of forking and customizing the project for your own content.

## Step 1: Fork the Repository

1. Visit https://github.com/1ps0/1ps0.github.io
2. Click the "Fork" button in the top right corner
3. Wait for GitHub to create a copy in your account

## Step 2: Rename Your Repository (Optional)

For your personal GitHub Pages site:

1. Go to Settings in your forked repository
2. Rename the repository to `yourusername.github.io`

## Step 3: Customize Basic Information

### Update HTML Files

1. Edit `index.html` to change:
   - Title and meta tags
   - Header section with your name/handle
   - Any personal information in the content
   - Social media links in the footer

### Update Terminal Welcome Messages

1. Edit the terminal lines in `index.html` to show your own welcome message
2. Consider changing the greeting and basic information displayed in the terminal

## Step 4: Customize the Virtual Filesystem

The site uses a virtual filesystem defined in `assets/js/theme.js`:

1. Find the `initializeFilesystem()` function
2. Modify:
   - Project directories and their content
   - Blog posts and categories
   - About text, contact information and readme files
   - Any other virtual files you want to include

Example:

```javascript
return {
    projects: {
        type: 'directory',
        contents: {
            'my-project-1': { 
                type: 'directory', 
                contents: {
                    'README.md': { 
                        type: 'file', 
                        content: 'Description of my first project.'
                    }
                } 
            },
            // Add your own projects here
        }
    },
    // Add your own directories and files
    'about.txt': { 
        type: 'file', 
        content: 'About me and my digital projects.'
    }
};
```

## Step 5: Update Project Cards

1. Edit the project cards in `index.html` to showcase your own work:
   - Replace project titles, descriptions and links
   - Update tags to reflect your projects' technologies
   - Link to your own GitHub repositories and live demos

## Step 6: Configure Blog (Optional)

If you're using Jekyll for the blog section:

1. Update the blog posts in the `_posts` directory
2. Modify categories to match your content themes
3. Update the blog grid styling if needed

## Step 7: Custom Styling (Optional)

1. Modify `assets/css/cyberpunk.css` and/or `assets/css/professional.css` to match your preferences
2. Update color schemes, fonts, and other visual elements
3. Consider creating your own theme if you want a completely different look

## Step 8: Enable GitHub Pages

1. Go to your repository settings
2. Scroll down to the GitHub Pages section
3. Set the source to your main branch
4. Click Save

Your site will be published at `https://yourusername.github.io`

## Step 9: Test Everything

1. Make sure all links point to your content
2. Test the terminal functionality
3. Ensure the projects showcase works correctly
4. Verify that theme switching works

## Advanced Customization

### Adding New Terminal Commands

To add new commands:

1. Add a new case in the `handleCommand()` function in `theme.js`
2. Create a corresponding handler function if needed
3. Add help text in the `getHelpText()` function
4. Update the general help command output

### Custom Terminal Features

You can extend the terminal with more features:

1. Add new filesystem operations
2. Create custom visualizations or effects
3. Implement interactive commands specific to your interests

## Questions or Issues?

If you have questions about forking or customizing, feel free to open an issue in the original repository.

Happy coding! 