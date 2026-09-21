import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { COLOR_LEVEL_VALUES, normalizeColor } from "./colors.js";
import { cloneExtensionStatusRow, DEFAULT_EXTENSION_STATUS_ROW, normalizeExtensionStatusRow, } from "./extension-statuses.js";
import { PRESET_DEFINITIONS, } from "./presets.js";
import { SEPARATOR_VALUES } from "./separators.js";
import { ICON_MODE_VALUES, isRecord, TERMINAL_WIDTH_MODE_VALUES } from "./types.js";
import { registry } from "./widgets/registry.js";
export const STATUS_KEY = "pi-footer";
const CONFIG_ENV = "PI_FOOTER_CONFIG";
const DEFAULT_CONFIG_PATH = join(getAgentDir(), "extensions", "pi-footer.json");
const SEPARATORS = new Set(SEPARATOR_VALUES);
const DEFAULT_TERMINAL_OPTIONS = {
    widthMode: "full",
    colorLevel: "ansi256",
};
export const DEFAULT_CONFIG = {
    version: 1,
    enabled: true,
    preset: "default",
    lines: linesForPreset("default"),
    separator: "dot",
    separatorFg: "default",
    separatorBg: "default",
    iconMode: "emoji",
    minimalist: false,
    terminal: DEFAULT_TERMINAL_OPTIONS,
    extensionStatusRow: DEFAULT_EXTENSION_STATUS_ROW,
};
export function getConfigPath() {
    return process.env[CONFIG_ENV] ?? DEFAULT_CONFIG_PATH;
}
function linesForPreset(preset) {
    return PRESET_DEFINITIONS[preset].lines.map((line) => widgetsFromPresetLine(line));
}
export function configWithPreset(config, preset) {
    const definition = PRESET_DEFINITIONS[preset];
    return {
        ...config,
        preset,
        lines: linesForPreset(preset),
        separator: definition.separator ?? config.separator,
        iconMode: definition.iconMode ?? config.iconMode,
        terminal: { ...config.terminal, ...definition.terminal },
    };
}
function widgetsFromPresetLine(line) {
    return line.map((widget) => registry.createEntry(widget.type, widget.options));
}
export function normalizeConfig(input) {
    if (!isRecord(input))
        return cloneConfig(DEFAULT_CONFIG);
    const preset = isPreset(input.preset) ? input.preset : DEFAULT_CONFIG.preset;
    const lines = normalizeLines(input.lines, preset);
    return {
        version: 1,
        enabled: typeof input.enabled === "boolean" ? input.enabled : DEFAULT_CONFIG.enabled,
        preset,
        lines,
        separator: isSeparatorStyle(input.separator)
            ? input.separator
            : (PRESET_DEFINITIONS[preset].separator ?? DEFAULT_CONFIG.separator),
        separatorFg: normalizeColor(input.separatorFg) ?? DEFAULT_CONFIG.separatorFg,
        separatorBg: normalizeColor(input.separatorBg) ?? DEFAULT_CONFIG.separatorBg,
        iconMode: isIconMode(input.iconMode) ? input.iconMode : DEFAULT_CONFIG.iconMode,
        minimalist: typeof input.minimalist === "boolean" ? input.minimalist : DEFAULT_CONFIG.minimalist,
        terminal: normalizeTerminalOptions(input.terminal, PRESET_DEFINITIONS[preset].terminal),
        extensionStatusRow: normalizeExtensionStatusRow(input.extensionStatusRow),
    };
}
export function cloneSettings(settings) {
    return {
        ...settings,
        terminal: { ...settings.terminal },
        extensionStatusRow: cloneExtensionStatusRow(settings.extensionStatusRow),
    };
}
export function cloneConfig(config) {
    return {
        ...cloneSettings(config),
        lines: config.lines.map((line) => line.map((widget) => ({ ...widget, options: { ...widget.options } }))),
    };
}
export async function loadConfig(path = getConfigPath()) {
    try {
        const raw = await readFile(path, "utf8");
        return normalizeConfig(JSON.parse(raw));
    }
    catch (error) {
        if (isNodeError(error) && error.code === "ENOENT") {
            return cloneConfig(DEFAULT_CONFIG);
        }
        throw error;
    }
}
export async function saveConfig(config, path = getConfigPath()) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(normalizeConfig(config), null, 2)}\n`, "utf8");
}
function normalizeLines(linesValue, preset) {
    if (!Array.isArray(linesValue))
        return linesForPreset(preset);
    return linesValue.map((line) => normalizeWidgets(line));
}
function normalizeWidgets(value) {
    if (!Array.isArray(value))
        return [];
    const widgets = [];
    for (const item of value) {
        if (!isRecord(item) || typeof item.type !== "string")
            continue;
        const spec = registry.maybeSpec(item.type);
        if (!spec)
            continue;
        widgets.push({
            id: typeof item.id === "string" && item.id.length > 0
                ? item.id
                : registry.createEntry(spec.type).id,
            type: spec.type,
            enabled: typeof item.enabled === "boolean" ? item.enabled : true,
            options: registry.normalizeOptions(spec.type, isRecord(item.options) ? item.options : {}),
        });
    }
    return widgets;
}
function normalizeTerminalOptions(value, defaults = {}) {
    const base = { ...DEFAULT_TERMINAL_OPTIONS, ...defaults };
    if (!isRecord(value))
        return base;
    return {
        widthMode: typeof value.widthMode === "string" &&
            TERMINAL_WIDTH_MODE_VALUES.includes(value.widthMode)
            ? value.widthMode
            : base.widthMode,
        colorLevel: typeof value.colorLevel === "string" &&
            COLOR_LEVEL_VALUES.includes(value.colorLevel)
            ? value.colorLevel
            : base.colorLevel,
    };
}
export function isPreset(value) {
    return typeof value === "string" && Object.hasOwn(PRESET_DEFINITIONS, value);
}
function isSeparatorStyle(value) {
    return typeof value === "string" && SEPARATORS.has(value);
}
function isIconMode(value) {
    return typeof value === "string" && ICON_MODE_VALUES.includes(value);
}
function isNodeError(error) {
    return error instanceof Error && "code" in error;
}
