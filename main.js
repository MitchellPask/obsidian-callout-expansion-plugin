const { Plugin, PluginSettingTab, Setting } = require("obsidian");

// default values if there are no configurations yet
const DEFAULT_SETTINGS = {
  columnGap: "3px",
  minColumnWidth: "200px",
  customCallouts: [],
};

// colorpicker helper function
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

// colorpicker helper function
function rgbToHex(rgb) {
  const [r, g, b] = rgb.split(",").map(n => parseInt(n.trim()));
  return "#" + [r, g, b].map(n => n.toString(16).padStart(2, "0")).join("");
}

// Community Plugin settings tab initialization
class CalloutColumnsSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.editingIndex = null; // endex for a callout currently being edited
  }

  display() {
    const { containerEl } = this;
    containerEl.empty(); // clean existing container before rendering

    // ---------- Layout settings ----------

    containerEl.createEl("h3", { text: "Column layout" });


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
      .setDesc("How narrow a column can get before wrapping. Accepts any CSS value (ex. 200px)")
      .addText(text => text
        .setPlaceholder("200px")
        .setValue(this.plugin.settings.minColumnWidth)
        .onChange(async (value) => {
          this.plugin.settings.minColumnWidth = value;
          await this.plugin.saveSettings();
        })
      );

      
    // ---------- Custom callouts ----------

    containerEl.createEl("h3", { text: "Custom callouts" });

    const desc = containerEl.createEl("p", { cls: "setting-item-description" });
    desc.innerHTML = 'Icon should be a valid <a href="https://lucide.dev/icons/" target="_blank">Lucide</a> name (ex. lucide-key).';

    const { customCallouts } = this.plugin.settings;

    // Render existing callouts
    customCallouts.forEach((callout, index) => {
      if (this.editingIndex === index) {
        this.renderEditForm(containerEl, callout, index);
      } else {
        this.renderCalloutRow(containerEl, callout, index);
      }
    });

    // Add new callout button
    new Setting(containerEl)
      .addButton(btn => btn
        .setButtonText("+ Add callout")
        .setCta()
        .onClick(() => {
          this.plugin.settings.customCallouts.push({
            name: "",
            color: "255, 255, 255",
            icon: "lucide-star",
            background: 0.15,
          });
          this.editingIndex = this.plugin.settings.customCallouts.length - 1;
          this.display();
        })
      );
  }

  renderCalloutRow(containerEl, callout, index) {
    const setting = new Setting(containerEl)
      .setName(callout.name ? `[!${callout.name}]` : "(unnamed)")
      .setDesc(`rgb(${callout.color}) · ${callout.icon}`);

    // Color swatch
    const swatch = setting.nameEl.createEl("span");
    swatch.style.cssText = `
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgb(${callout.color});
      margin-left: 8px;
      vertical-align: middle;
    `;

    setting
      .addButton(btn => btn
        .setIcon("pencil")
        .setTooltip("Edit")
        .onClick(() => {
          this.editingIndex = index;
          this.display();
        })
      )
      .addButton(btn => btn
        .setIcon("trash")
        .setTooltip("Delete")
        .onClick(async () => {
          this.plugin.settings.customCallouts.splice(index, 1);
          if (this.editingIndex === index) this.editingIndex = null;
          await this.plugin.saveSettings();
          this.display();
        })
      );
  }

  renderEditForm(containerEl, callout, index) {
    const box = containerEl.createDiv({ cls: "callout-columns-edit-box" });
    box.style.cssText = `
      border: 1px solid var(--background-modifier-border);
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 8px;
    `;

    // Name
    new Setting(box)
      .setName("Name")
      .setDesc("Lowercase with no spaces, used when calling the callout in markdown - [!treasure]")
      .addText(text => text
        .setPlaceholder("treasure")
        .setValue(callout.name)
        .onChange(async (value) => {
          this.plugin.settings.customCallouts[index].name = value.toLowerCase().replace(/\s+/g, "-");
          await this.plugin.saveSettings();
        })
      );

    // Color
    new Setting(box)
      .setName("Color")
      .addColorPicker(picker => picker
        .setValue(rgbToHex(callout.color))
        .onChange(async (hex) => {
          this.plugin.settings.customCallouts[index].color = hexToRgb(hex);
          await this.plugin.saveSettings();
        })
      );

    // Background opacity
    new Setting(box)
      .setName("Background opacity")
      .setDesc("Strength of background tint - a float between 0 and 1, default 0.15")
      .addText(text => text
        .setPlaceholder("0.15")
        .setValue(String(callout.background ?? 0.15))
        .onChange(async (value) => {
          this.plugin.settings.customCallouts[index].background = parseFloat(value) || 0.15;
          await this.plugin.saveSettings();
        })
      );

    // Icon
    const iconSetting = new Setting(box)
      .setName("Icon")
      .setDesc("")
      .addText(text => text
        .setPlaceholder("lucide-star")
        .setValue(callout.icon)
        .onChange(async (value) => {
          this.plugin.settings.customCallouts[index].icon = value;
          await this.plugin.saveSettings();
        })
      );

    iconSetting.descEl.innerHTML = 'Any <a href="https://lucide.dev/icons/" target="_blank">Lucide icon</a> name (ex. lucide-key)';

    // Done button
    new Setting(box)
      .addButton(btn => btn
        .setButtonText("Done")
        .setCta()
        .onClick(() => {
          this.editingIndex = null;
          this.display();
        })
      );

  }
}

// ---------- Plugin ----------

class CalloutColumnsPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.applySettingsToRoot();
    this.injectCustomCalloutStyles();
    // register the settings tab in the Community Plugins page
    this.addSettingTab(new CalloutColumnsSettingTab(this.app, this));
    console.log("Callout Columns loaded");
  }

  onunload() {
    // clean up variables on unload
    document.documentElement.style.removeProperty("--col-gap");
    document.documentElement.style.removeProperty("--col-min-width");
    const el = document.getElementById("callout-columns-custom-styles");
    if (el) el.remove();
    console.log("Callout expansion plugin unloaded");
  }

  // https://docs.obsidian.md/Plugins/User+interface/Settings#Save+and+load+the+settings+object
  // load in settings configurations / take defaults if none found
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (!this.settings.customCallouts) this.settings.customCallouts = [];
  }

  // save settings configurations
  async saveSettings() {
    await this.saveData(this.settings);
    this.applySettingsToRoot(); // reapply CSS changes
    this.injectCustomCalloutStyles();
  }

  applySettingsToRoot() {
    // expose settings to root so CSS can change dynamically
    document.documentElement.style.setProperty("--col-gap", this.settings.columnGap);
    document.documentElement.style.setProperty("--col-min-width", this.settings.minColumnWidth);
  }
  
  injectCustomCalloutStyles() {
    const existing = document.getElementById("callout-columns-custom-styles");
    if (existing) existing.remove();

    const { customCallouts } = this.settings;
    if (!customCallouts.length) return;

    const css = customCallouts
      .filter(c => c.name)
      .map(c => `
        .callout[data-callout="${c.name}"] {
          --callout-color: ${c.color};
          --callout-icon: ${c.icon};
          --callout-blend-mode: normal;
          background-color: rgba(${c.color}, ${c.background ?? 0.15});
        }
      `).join("\n");

    const style = document.createElement("style");
    style.id = "callout-columns-custom-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

}

module.exports = CalloutColumnsPlugin;