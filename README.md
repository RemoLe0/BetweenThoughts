# Between Thoughts - Obsidian Plugin

A lightweight Obsidian community plugin for creating meaningful connections between notes through reflection.

## Overview

Between Thoughts helps you build relationships in your knowledge base by prompting you to create connections between existing notes. The plugin operates entirely within your vault using native Obsidian and Markdown concepts.

## Features

- **Multiple Connection Modes:**
  - Random: Connect two random notes from your vault
  - Contextual: Connect current note with a random note
  - Manual: Choose both notes yourself *(currently in development)*

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

## Author

**Remo Leopold** - [GitHub Profile](https://github.com/RemoLe0)

## Privacy & Data

Between Thoughts is designed with privacy as a core principle:

- **No external services**: The plugin operates entirely within your local Obsidian vault
- **No data collection**: This plugin does not collect, store, or transmit any user data
- **No telemetry**: No analytics or tracking of any kind
- **Offline-first**: Works completely offline with no internet connection required
- **Open source**: All code is transparent and publicly available

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

- **GitHub Repository**: [BetweenThoughts](https://github.com/RemoLe0/BetweenThoughts)
- **GitHub Issues**: [Report bugs and request features](https://github.com/RemoLe0/BetweenThoughts/issues)
- **Obsidian Forum**: Community discussion
- **Documentation**: [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)

## Credits

Built with the Obsidian Plugin API and inspired by tools for reflective knowledge work.

---

**Note:** This plugin stores all data as plain markdown files in your vault. No external services or internet connection required.
