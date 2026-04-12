const { Plugin, PluginSettingTab, Setting } = require("obsidian");

// default values if there are no configurations yet
const DEFAULT_SETTINGS = {
  columnGap: "3px",
  minColumnWidth: "200px",
};

// Community Plugin settings tab initialization
class CalloutColumnsSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty(); // clean existing container before rendering

    new Setting(containerEl)
      .setName("Column gap")
      .setDesc("The space between callout columns (ex. 1em, 5px).")
      .addText(text => text
        .setPlaceholder("3px")
        .setValue(this.plugin.settings.columnGap)
        .onChange(async (value) => {
          // update and save new settings option
          this.plugin.settings.columnGap = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Minimum column width")
      .setDesc("How narrow a column can get before wrapping. Accepts any CSS value, e.g. 200px.")
      .addText(text => text
        .setPlaceholder("200px")
        .setValue(this.plugin.settings.minColumnWidth)
        .onChange(async (value) => {
          this.plugin.settings.minColumnWidth = value;
          await this.plugin.saveSettings();
        })
      );
  }
}

class CalloutColumnsPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.applySettingsToRoot();
    // register the settings tab in the Community Plugins page
    this.addSettingTab(new CalloutColumnsSettingTab(this.app, this));
    console.log("Callout Columns loaded");
  }

  onunload() {
    // clean up variables on unload
    document.documentElement.style.removeProperty("--col-gap");
    document.documentElement.style.removeProperty("--col-min-width");
    console.log("Callout expansion plugin unloaded");
  }

  // load in settings configurations / take defaults if none found
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  // save settings configurations
  async saveSettings() {
    await this.saveData(this.settings);
    this.applySettingsToRoot(); // reapply CSS changes
  }

  applySettingsToRoot() {
    // expose settings to root so CSS can change dynamically
    document.documentElement.style.setProperty("--col-gap", this.settings.columnGap);
    document.documentElement.style.setProperty("--col-min-width", this.settings.minColumnWidth);
  }
}

module.exports = CalloutColumnsPlugin;