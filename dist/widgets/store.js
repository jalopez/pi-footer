import { cloneSettings } from "../config.js";
import { registry } from "./registry.js";
export class WidgetStore {
    settings;
    lines;
    constructor(settings, lines) {
        this.settings = settings;
        this.lines = lines;
    }
    static fromConfig(config) {
        const { lines, ...settings } = config;
        return new WidgetStore(cloneSettings(settings), lines.map((line) => line.map((entry) => registry.hydrateWidget(entry))));
    }
    toConfig() {
        return {
            ...cloneSettings(this.settings),
            lines: this.lines.map((line) => line.map((widget) => widget.toEntry())),
        };
    }
}
