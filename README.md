# Between Thoughts - Obsidian Plugin

A lightweight Obsidian community plugin for creating meaningful connections between notes through reflection.

## Overview

Between Thoughts helps you build relationships in your knowledge base by prompting you to create connections between existing notes. The plugin operates entirely within your vault using native Obsidian and Markdown concepts.

## Features

- **Multiple Connection Modes:**
  - Random: Connect two random notes from your vault
  - Contextual: Connect current note with a random note
  - Manual: Choose both notes yourself (coming soon)

- **Simple Workflow:**
  1. Trigger connection via Command Palette, ribbon icon, or context menu
  2. View the two selected notes
  3. Provide a connection title and optional reflection
  4. Generate a markdown connection note

- **Customizable Settings:**
  - Configure connection folder location
  - Customize note template
  - Exclude specific folders from selection
  - Add timestamps to filenames
  - Toggle ribbon icon visibility

- **Plain Markdown Output:**
  - All connections stored as standard `.md` files
  - Includes frontmatter metadata
  - Fully searchable and editable
  - Works with Obsidian graph view and Dataview

## Installation

### From Obsidian Community Plugins (Once Published)

1. Open Settings → Community Plugins
2. Disable Safe Mode
3. Browse and search for "Between Thoughts"
4. Install and enable the plugin

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder: `<vault>/.obsidian/plugins/between-thoughts/`
3. Copy the downloaded files into this folder
4. Reload Obsidian
5. Enable the plugin in Settings → Community Plugins

### Development Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start compilation in watch mode
4. Copy or symlink the repository folder to `<vault>/.obsidian/plugins/between-thoughts/`
5. Reload Obsidian
6. Enable the plugin

## Usage

### Creating Connections

**Via Command Palette (Ctrl/Cmd + P):**
- "Create connection between random notes"
- "Create connection from current note"
- "Create connection (choose notes manually)"

**Via Ribbon Icon:**
- Click the link icon in the left sidebar (if enabled in settings)

**Via Context Menu:**
- Right-click on any note in the file explorer
- Select "Connect with another note"

### Connection Note Format

Generated connection notes include:

```markdown
---
type: reflection
mode: random
created: 2025-12-31T12:00:00.000Z
connected:
  - "[[Note 1]]"
  - "[[Note 2]]"
---

# Your Connection Title

**Connected Notes:**
- [[Note 1]]
- [[Note 2]]

**Reflection:**
Your reflection text goes here...

---
*Created: 12/31/2025, 12:00:00 PM*
```

## Configuration

Access settings via Settings → Between Thoughts

### Available Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Connection folder | Where connection notes are created | `Connections` |
| Include timestamp | Add timestamp to filenames | `true` |
| Default connection type | Metadata type value | `reflection` |
| Show ribbon icon | Display icon in sidebar | `true` |
| Exclude folders | Folders to skip in selection | `[]` |
| Note template | Custom template for connections | (see below) |

### Template Variables

Customize the note template using these variables:

- `{{title}}` - Connection title
- `{{note1}}` - First note basename
- `{{note2}}` - Second note basename
- `{{content}}` - User's reflection text
- `{{date}}` - Creation timestamp

## Use Cases

- **Serendipitous Discovery:** Random connections help you discover unexpected relationships
- **Knowledge Integration:** Link ideas across different domains
- **Reflective Practice:** Regular connection creation builds deeper understanding
- **Graph Enhancement:** Create more meaningful relationships in your knowledge graph
- **Memory Reinforcement:** Strengthen retention by actively linking concepts

## Design Philosophy

Between Thoughts follows these principles:

- **Transparency:** All outputs are plain markdown files
- **Simplicity:** No background processes or complex workflows
- **Privacy:** No external services or data collection
- **Extensibility:** Works seamlessly with other plugins (Dataview, Graph Analysis, etc.)
- **User Agency:** You control the connections and their meaning

## Obsidian API Usage

This plugin uses the following Obsidian APIs:

### Core APIs
- `Plugin` - Base plugin class
- `App` - Main application interface
- `Vault` - File system operations
- `Workspace` - Window and leaf management

### UI Components
- `Modal` - Connection creation dialog
- `PluginSettingTab` - Settings interface
- `Notice` - User notifications
- `Menu` - Context menu integration
- `Setting` - Settings UI elements

### File Operations
- `vault.getMarkdownFiles()` - List all markdown files
- `vault.create()` - Create new files
- `vault.createFolder()` - Create folders
- `vault.adapter.exists()` - Check file existence
- `workspace.getLeaf()` - Get workspace leaf
- `leaf.openFile()` - Open files in editor

### Event Handling
- `registerEvent()` - Register event listeners with cleanup
- `workspace.on('file-menu')` - File context menu events
- `addCommand()` - Command palette commands
- `addRibbonIcon()` - Sidebar ribbon icons

## Development

### Build Commands

```bash
# Install dependencies
npm install

# Development mode (watch)
npm run dev

# Production build
npm run build

# Version bump
npm version patch/minor/major
```

### Project Structure

```
between-thoughts/
├── main.ts              # Main plugin code
├── manifest.json        # Plugin metadata
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── esbuild.config.mjs   # Build configuration
├── version-bump.mjs     # Version management
├── versions.json        # Version compatibility
├── styles.css           # Plugin styles
└── README.md           # This file
```

### Key Components

**BetweenThoughtsPlugin**
- Main plugin class
- Handles command registration
- Manages settings
- Coordinates connection workflow

**ConnectionModal**
- User interface for creating connections
- Input validation
- Styled with CSS

**BetweenThoughtsSettingTab**
- Settings configuration UI
- Real-time setting updates

## Extending the Plugin

Because all outputs are standard markdown, you can:

### Query with Dataview

```dataview
TABLE connected, mode
FROM "Connections"
WHERE type = "reflection"
SORT created DESC
```

### Search Connections

```
path:Connections tag:#important
```

### Build Custom Workflows

Create your own review system, spaced repetition, or analytics using the generated connection notes.

## Publishing Your Plugin

To submit this plugin to the Obsidian Community Plugins:

### Prerequisites

1. Create a GitHub repository for your plugin
2. Add the following files to your repository:
   - `main.js` (compiled)
   - `manifest.json`
   - `styles.css`
   - `README.md`
   - `LICENSE` (MIT recommended)

### Submission Process

1. **Prepare Your Repository:**
   ```bash
   # Build production version
   npm run build
   
   # Create a release
   git tag -a 1.0.0 -m "Initial release"
   git push origin 1.0.0
   ```

2. **Create GitHub Release:**
   - Go to your repository → Releases → Create new release
   - Tag version: `1.0.0`
   - Title: `1.0.0 - Initial Release`
   - Attach: `main.js`, `manifest.json`, `styles.css`
   - Publish release

3. **Submit to Community Plugins:**
   - Fork [obsidian-releases](https://github.com/obsidianmd/obsidian-releases)
   - Add your plugin to `community-plugins.json`:
   ```json
   {
     "id": "between-thoughts",
     "name": "Between Thoughts",
     "author": "Your Name",
     "description": "Create meaningful connections between notes through reflection",
     "repo": "yourusername/obsidian-between-thoughts"
   }
   ```
   - Create pull request
   - Wait for review (usually 1-2 weeks)

4. **Requirements for Approval:**
   - Clear README with usage instructions
   - No security vulnerabilities
   - No unnecessary API permissions
   - Proper error handling
   - Clean code without console spam
   - Works on desktop and mobile (unless marked desktop-only)

### Updating Your Plugin

1. Update version in `manifest.json`
2. Run `npm version patch/minor/major`
3. Build: `npm run build`
4. Create new GitHub release with updated files
5. Users will get automatic update notifications

## Troubleshooting

**Plugin doesn't appear:**
- Check `.obsidian/plugins/between-thoughts/` exists
- Verify `manifest.json` is valid JSON
- Reload Obsidian

**No notes found:**
- Check exclude folders setting
- Ensure vault has at least 2 markdown files
- Verify connection folder isn't excluding all notes

**Connection notes not created:**
- Check folder permissions
- Verify connection folder name is valid
- Check console for errors (Ctrl+Shift+I)

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

- GitHub Issues: Report bugs and request features
- Obsidian Forum: Community discussion
- Documentation: [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)

## Credits

Built with the Obsidian Plugin API and inspired by tools for reflective knowledge work.

---

**Note:** This plugin stores all data as plain markdown files in your vault. No external services or internet connection required.
