import { 
    App, 
    Plugin, 
    PluginSettingTab, 
    Setting, 
    TFile, 
    Modal,
    Notice,
    Menu,
    MarkdownView,
    addIcon
} from 'obsidian';

/**
 * Plugin Settings Interface
 * Stores user preferences for connection note generation
 */
interface BetweenThoughtsSettings {
    connectionFolder: string;        // Folder where connection notes are created
    includeTimestamp: boolean;       // Add timestamp to connection notes
    defaultConnectionType: string;   // Default type metadata (optional)
    excludeFolders: string[];        // Folders to exclude from random selection
    enableRibbonIcon: boolean;       // Show ribbon icon
    templateContent: string;         // Custom template for connection notes
    defaultConnectionMode: string;   // Default connection mode
}

/**
 * Default plugin settings
 */
const DEFAULT_SETTINGS: BetweenThoughtsSettings = {
    connectionFolder: 'Connections',
    includeTimestamp: true,
    defaultConnectionType: 'reflection',
    excludeFolders: [],
    enableRibbonIcon: true,
    templateContent: '# {{title}}\n\n**Connected Notes:**\n- [[{{note1}}]]\n- [[{{note2}}]]\n\n**Reflection:**\n{{content}}\n\n---\n*Created: {{date}}*',
    defaultConnectionMode: 'random'
};

/**
 * Connection Mode determines how notes are selected
 */
enum ConnectionMode {
    RANDOM = 'random',           // Two random notes
    CONTEXTUAL = 'contextual',   // Current note + random note
    MANUAL = 'manual'            // User picks both notes
}

/**
 * Data structure for a connection between two notes
 */
interface ConnectionData {
    note1: TFile;
    note2: TFile;
    title: string;
    content: string;
    mode: ConnectionMode;
}

/**
 * Main Plugin Class
 * 
 * OBSIDIAN API NOTES:
 * - Plugin class extends Obsidian's Plugin base class
 * - onload() is called when plugin is enabled
 * - onunload() is called when plugin is disabled
 * - All commands must be registered in onload()
 * - Settings are persisted automatically via saveData/loadData
 */
export default class BetweenThoughtsPlugin extends Plugin {
    settings!: BetweenThoughtsSettings;
    ribbonIconEl: HTMLElement | null = null;

    /**
     * Plugin initialization
     * Called when plugin is loaded by Obsidian
     */
    async onload() {
        console.log('Loading Between Thoughts plugin');

        // Load saved settings
        await this.loadSettings();

        // Register custom ribbon icon
        addIcon('between-thoughts-custom', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.69 1.93a.52.71 0 0 0-.24.17L1.59 11c-.01.5.01.5.01.99l6.57 9.53a.52.71 0 0 0 .74.02l4.69-5.11a5.78 5.78 0 1 0-3.79-10.27l-1-1.23a.52.71 0 0 0-.5-.2Zm.12 1.69 3.66 5.16a3.48 3.48 0 0 0-1.16 3.46c0 1.07.29 2.07.8 2.92l-3.37 5.54-5.85-8.25ZM17 7.89c2.42 0 4.38 1.94 4.38 4.36 0 2.42-1.96 4.37-4.38 4.37a4.34 4.34 0 0 1-3.36-1.57l2.04-2.65a.52.71 0 0 0 .02-1l-3-4.3c.78-.72 1.82-1.16 2.97-1.16ZM13.25 10l1.33 1.87-1.61 2.09c-.22-.52-.35-1.1-.35-1.71 0-.83.23-1.6.63-2.25z" /></svg>`);

        // Register commands in Command Palette
        this.registerCommands();

        // Add ribbon icon if enabled
        if (this.settings.enableRibbonIcon) {
            this.addPluginRibbonIcon();
        }

        // Add settings tab
        this.addSettingTab(new BetweenThoughtsSettingTab(this.app, this));

        // Register context menu for notes
        // OBSIDIAN API: registerEvent() ensures proper cleanup on plugin unload
        this.registerEvent(
            this.app.workspace.on('file-menu', (menu, file) => {
                if (file instanceof TFile && file.extension === 'md') {
                    this.addFileMenuItems(menu, file);
                }
            })
        );
    }

    /**
     * Plugin cleanup
     * Called when plugin is disabled
     */
    onunload() {
        console.log('Unloading Between Thoughts plugin');
    }

    /**
     * Register all plugin commands
     * 
     * OBSIDIAN API NOTES:
     * - addCommand() registers commands in Command Palette (Ctrl/Cmd+P)
     * - Commands should have unique IDs
     * - editorCallback provides access to current editor and view
     */
    registerCommands() {
        // Command: Create random connection
        this.addCommand({
            id: 'create-random-connection',
            name: 'Create connection between random notes',
            callback: () => this.initiateConnection(ConnectionMode.RANDOM)
        });

        // Command: Create contextual connection (current note + random)
        this.addCommand({
            id: 'create-contextual-connection',
            name: 'Create connection from current note',
            editorCallback: (editor, view) => {
                const file = view.file;
                if (file) {
                    this.initiateConnection(ConnectionMode.CONTEXTUAL, file);
                } else {
                    new Notice('No active note found');
                }
            }
        });

        // Command: Create manual connection
        this.addCommand({
            id: 'create-manual-connection',
            name: 'Create connection (choose notes manually)',
            callback: () => this.initiateConnection(ConnectionMode.MANUAL)
        });
    }

    /**
     * Add ribbon icon to left sidebar
     * 
     * OBSIDIAN API NOTES:
     * - addRibbonIcon() adds clickable icon to left sidebar
     * - Returns HTMLElement for further customization
     * - Icon names from Lucide icon set (lucide.dev)
     */
    addPluginRibbonIcon() {  
    this.ribbonIconEl = super.addRibbonIcon( 
        'between-thoughts-custom', 
        'Between Thoughts', 
        () => this.initiateConnection(this.settings.defaultConnectionMode as ConnectionMode)
    );
}

    /**
     * Add context menu items for note files
     * 
     * OBSIDIAN API NOTES:
     * - Menu.addItem() adds menu items to context menus
     * - setTitle() and setIcon() customize appearance
     */
    addFileMenuItems(menu: Menu, file: TFile) {
        menu.addItem((item) => {
            item
                .setTitle('Connect with another note')
                .setIcon('link-2')
                .onClick(() => this.initiateConnection(ConnectionMode.CONTEXTUAL, file));
        });
    }

    /**
     * Main workflow entry point
     * Selects notes and opens connection modal
     */
    async initiateConnection(mode: ConnectionMode, contextFile?: TFile) {
        if (mode === ConnectionMode.CONTEXTUAL && !contextFile) {
            const activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) {
                new Notice('No active note found for contextual connection');
                return;
            }
            contextFile = activeFile;
        }

        const notes = await this.selectNotes(mode, contextFile);
        
        if (!notes) {
            new Notice('Unable to select notes for connection');
            return;
        }

        const [note1, note2] = notes;

        // Open modal for user input
        new ConnectionModal(this.app, note1, note2, mode, (data) => {
            this.createConnectionNote(data);
        }).open();
    }

    /**
     * Select two notes based on connection mode
     * 
     * OBSIDIAN API NOTES:
     * - app.vault.getMarkdownFiles() returns all markdown files
     * - TFile represents a file in the vault
     * - Files can be filtered by path, name, extension
     */
    async selectNotes(mode: ConnectionMode, contextFile?: TFile): Promise<[TFile, TFile] | null> {
        const allFiles = this.app.vault.getMarkdownFiles();
        
        // Filter out excluded folders and connection folder
        const eligibleFiles = allFiles.filter(file => {
            if (file.path.startsWith(this.settings.connectionFolder + '/')) {
                return false;
            }
            return !this.settings.excludeFolders.some(folder => 
                file.path.startsWith(folder + '/')
            );
        });

        if (eligibleFiles.length < 2) {
            new Notice('Not enough notes in vault to create a connection');
            return null;
        }

        switch (mode) {
            case ConnectionMode.RANDOM:
                return this.selectRandomPair(eligibleFiles);
            
            case ConnectionMode.CONTEXTUAL:
                if (!contextFile) return null;
                const randomFile = this.selectRandomNote(
                    eligibleFiles.filter(f => f.path !== contextFile.path)
                );
                return randomFile ? [contextFile, randomFile] : null;
            
            case ConnectionMode.MANUAL:
                // For manual mode, we'd need a note picker modal
                // Simplified for this implementation
                return this.selectRandomPair(eligibleFiles);
            
            default:
                return null;
        }
    }

    /**
     * Select two random different notes
     */
    selectRandomPair(files: TFile[]): [TFile, TFile] | null {
        if (files.length < 2) return null;

        const first = this.selectRandomNote(files);
        if (!first) return null;

        const second = this.selectRandomNote(files.filter(f => f.path !== first.path));
        if (!second) return null;

        return [first, second];
    }

    /**
     * Select a single random note from array
     */
    selectRandomNote(files: TFile[]): TFile | null {
        if (files.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * files.length);
        return files[randomIndex];
    }

    /**
     * Create the connection note file
     * 
     * OBSIDIAN API NOTES:
     * - app.vault.create() creates a new file
     * - Path should be relative to vault root
     * - Throws error if file already exists
     * - app.vault.adapter.exists() checks file existence
     */
    async createConnectionNote(data: ConnectionData) {
        const { note1, note2, title, content, mode } = data;

        // Ensure connection folder exists
        // OBSIDIAN API: createFolder() creates folder and parent folders
        const folderPath = this.settings.connectionFolder;
        if (!(await this.app.vault.adapter.exists(folderPath))) {
            await this.app.vault.createFolder(folderPath);
        }

        // Generate filename
        const timestamp = this.settings.includeTimestamp 
            ? `-${Date.now()}` 
            : '';
        const sanitizedTitle = this.sanitizeFileName(title);
        const fileName = `${sanitizedTitle}${timestamp}.md`;
        const filePath = `${folderPath}/${fileName}`;

        // Generate content using template
        const noteContent = this.generateNoteContent({
            title,
            note1: note1.basename,
            note2: note2.basename,
            content,
            mode,
            date: new Date().toISOString()
        });

        try {
            // Create the file
            const newFile = await this.app.vault.create(filePath, noteContent);
            
            new Notice(`Connection note created: ${fileName}`);
            
            // Open the newly created note
            // OBSIDIAN API: workspace.getLeaf() gets a workspace leaf to open files
            const leaf = this.app.workspace.getLeaf(false);
            await leaf.openFile(newFile);
        } catch (error) {
            console.error('Error creating connection note:', error);
            new Notice('Failed to create connection note');
        }
    }

    /**
     * Generate note content from template
     */
    generateNoteContent(data: {
        title: string;
        note1: string;
        note2: string;
        content: string;
        mode: ConnectionMode;
        date: string;
    }): string {
        // Use custom template if available
        let template = this.settings.templateContent || DEFAULT_SETTINGS.templateContent;

        // Replace template variables
        template = template
            .replace(/{{title}}/g, data.title)
            .replace(/{{note1}}/g, data.note1)
            .replace(/{{note2}}/g, data.note2)
            .replace(/{{content}}/g, data.content)
            .replace(/{{date}}/g, new Date(data.date).toLocaleString());

        // Add frontmatter
        const frontmatter = [
            '---',
            `type: ${this.settings.defaultConnectionType}`,
            `mode: ${data.mode}`,
            `created: ${data.date}`,
            `connected:`,
            `  - "[[${data.note1}]]"`,
            `  - "[[${data.note2}]]"`,
            '---',
            ''
        ].join('\n');

        return frontmatter + template;
    }

    /**
     * Sanitize filename for file system
     */
    sanitizeFileName(name: string): string {
        return name
            .replace(/[\\/:*?"<>|]/g, '-')
            .replace(/\s+/g, '-')
            .substring(0, 100);
    }

    /**
     * Load plugin settings
     * 
     * OBSIDIAN API NOTES:
     * - loadData() loads saved plugin data
     * - Returns Promise<any>
     * - Returns null if no data saved
     */
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    /**
     * Save plugin settings
     * 
     * OBSIDIAN API NOTES:
     * - saveData() persists plugin data
     * - Data is stored in .obsidian/plugins/[plugin-id]/data.json
     */
    async saveSettings() {
        await this.saveData(this.settings);
    }
}

/**
 * Connection Modal
 * Shows selected notes and prompts for connection details
 * 
 * OBSIDIAN API NOTES:
 * - Modal extends Obsidian's Modal class
 * - onOpen() is called when modal opens
 * - onClose() is called when modal closes
 * - contentEl is the modal's content container
 */
class ConnectionModal extends Modal {
    note1: TFile;
    note2: TFile;
    mode: ConnectionMode;
    onSubmit: (data: ConnectionData) => void;

    constructor(
        app: App, 
        note1: TFile, 
        note2: TFile, 
        mode: ConnectionMode, 
        onSubmit: (data: ConnectionData) => void
    ) {
        super(app);
        this.note1 = note1;
        this.note2 = note2;
        this.mode = mode;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        // Modal title
        contentEl.createEl('h2', { text: 'Create Connection' });

        // Display selected notes
        const notesContainer = contentEl.createDiv({ cls: 'between-thoughts-notes' });
        notesContainer.createEl('h3', { text: 'Connecting:' });
        
        const notesList = notesContainer.createDiv({ cls: 'between-thoughts-notes-list' });
        notesList.createEl('div', { 
            text: `${this.note1.basename}`,
            cls: 'between-thoughts-note-item'
        });
        notesList.createEl('div', { 
            text: `${this.note2.basename}`,
            cls: 'between-thoughts-note-item'
        });

        // Connection title input
        const titleContainer = contentEl.createDiv({ cls: 'between-thoughts-input-group' });
        titleContainer.createEl('label', { text: 'Connection Title:' });
        const titleInput = titleContainer.createEl('input', {
            attr: {
                type: 'text',
                placeholder: 'Place a meanigful name for this connection...'
            }
        });
        titleInput.addClass('between-thoughts-input');

        // Connection description
        const contentContainer = contentEl.createDiv({ cls: 'between-thoughts-input-group' });
        contentContainer.createEl('label', { text: 'Reflection (optional):' });
        const contentInput = contentContainer.createEl('textarea', {
            attr: {
                placeholder: 'Describe the relationship between these notes...'
            }
        });
        contentInput.addClass('between-thoughts-textarea');
        contentInput.rows = 5;

        // Buttons
        const buttonContainer = contentEl.createDiv({ cls: 'between-thoughts-buttons' });
        
        const submitButton = buttonContainer.createEl('button', { text: 'Create Connection' });
        submitButton.addClass('mod-cta');
        submitButton.onclick = () => {
            const title = titleInput.value.trim();
            if (!title) {
                new Notice('Please provide a connection title');
                return;
            }

            this.onSubmit({
                note1: this.note1,
                note2: this.note2,
                title,
                content: contentInput.value.trim(),
                mode: this.mode
            });

            this.close();
        };

        const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
        cancelButton.onclick = () => this.close();

        // Focus title input
        titleInput.focus();

        // Handle Enter key in title input
        titleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                submitButton.click();
            }
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

/**
 * Settings Tab
 * Provides UI for configuring plugin settings
 * 
 * OBSIDIAN API NOTES:
 * - PluginSettingTab extends Obsidian's SettingTab
 * - display() is called when settings tab is shown
 * - Setting class provides UI components for settings
 */
class BetweenThoughtsSettingTab extends PluginSettingTab {
    plugin: BetweenThoughtsPlugin;

    constructor(app: App, plugin: BetweenThoughtsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'Between Thoughts Settings' });

        // Connection folder setting
        new Setting(containerEl)
            .setName('Connection folder')
            .setDesc('Folder where connection notes will be created')
            .addText(text => text
                .setPlaceholder('Connections')
                .setValue(this.plugin.settings.connectionFolder)
                .onChange(async (value) => {
                    this.plugin.settings.connectionFolder = value;
                    await this.plugin.saveSettings();
                }));

        // Include timestamp setting
        new Setting(containerEl)
            .setName('Include timestamp in filename')
            .setDesc('Add timestamp to connection note filenames to ensure uniqueness')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.includeTimestamp)
                .onChange(async (value) => {
                    this.plugin.settings.includeTimestamp = value;
                    await this.plugin.saveSettings();
                }));

        // Default connection type
        new Setting(containerEl)
            .setName('Default connection type')
            .setDesc('Default value for "type" in frontmatter')
            .addText(text => text
                .setPlaceholder('reflection')
                .setValue(this.plugin.settings.defaultConnectionType)
                .onChange(async (value) => {
                    this.plugin.settings.defaultConnectionType = value;
                    await this.plugin.saveSettings();
                }));

        // Default connection mode
        new Setting(containerEl)
            .setName('Default connection mode')
            .setDesc('Default mode when using ribbon icon')
            .addDropdown(dropdown => dropdown
                .addOption('random', 'Random')
                .addOption('contextual', 'Contextual')
                .addOption('manual', 'Manual')
                .setValue(this.plugin.settings.defaultConnectionMode)
                .onChange(async (value) => {
                    this.plugin.settings.defaultConnectionMode = value;
                    await this.plugin.saveSettings();
                }));

        // Ribbon icon setting
        new Setting(containerEl)
            .setName('Show ribbon icon')
            .setDesc('Display Between Thoughts icon in left sidebar')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableRibbonIcon)
                .onChange(async (value) => {
                    this.plugin.settings.enableRibbonIcon = value;
                    await this.plugin.saveSettings();
                    
                    // Refresh ribbon icon
                    if (value) {
                        this.plugin.addPluginRibbonIcon();
                    } else if (this.plugin.ribbonIconEl) {
                        this.plugin.ribbonIconEl.remove();
                        this.plugin.ribbonIconEl = null;
                    }
                }));

        // Exclude folders
        new Setting(containerEl)
            .setName('Exclude folders')
            .setDesc('Comma-separated list of folders to exclude from random selection')
            .addTextArea(text => text
                .setPlaceholder('Archive, Templates, Daily Notes')
                .setValue(this.plugin.settings.excludeFolders.join(', '))
                .onChange(async (value) => {
                    this.plugin.settings.excludeFolders = value
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s.length > 0);
                    await this.plugin.saveSettings();
                }));

        // Template content
        containerEl.createEl('h3', { text: 'Template Customization' });
        containerEl.createEl('p', { 
            text: 'Customize the template for connection notes. Available variables: {{title}}, {{note1}}, {{note2}}, {{content}}, {{date}}',
            cls: 'setting-item-description'
        });

        new Setting(containerEl)
            .setName('Note template')
            .setDesc('Template used for generating connection notes')
            .addTextArea(text => {
                text
                    .setPlaceholder(DEFAULT_SETTINGS.templateContent)
                    .setValue(this.plugin.settings.templateContent)
                    .onChange(async (value) => {
                        this.plugin.settings.templateContent = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 10;
                text.inputEl.cols = 50;
            });

        // Reset to defaults
        new Setting(containerEl)
            .setName('Reset to defaults')
            .setDesc('Reset all settings to default values')
            .addButton(button => button
                .setButtonText('Reset')
                .setWarning()
                .onClick(async () => {
                    this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
                    await this.plugin.saveSettings();
                    this.display();
                    new Notice('Settings reset to defaults');
                }));
    }
}
