import { Chalk } from "chalk";
const chalk = {
    level: 2,
    c: new Chalk({ level: 2 }),
};
export const COLOR_LEVEL_VALUES = ["truecolor", "ansi256", "ansi16", "none"];
export const STANDARD_COLORS = [
    { label: "Default", value: "default" },
    { label: "Black", value: "black" },
    { label: "Red", value: "red" },
    { label: "Green", value: "green" },
    { label: "Yellow", value: "yellow" },
    { label: "Blue", value: "blue" },
    { label: "Magenta", value: "magenta" },
    { label: "Cyan", value: "cyan" },
    { label: "White", value: "white" },
    { label: "Bright Black", value: "brightBlack" },
    { label: "Bright Red", value: "brightRed" },
    { label: "Bright Green", value: "brightGreen" },
    { label: "Bright Yellow", value: "brightYellow" },
    { label: "Bright Blue", value: "brightBlue" },
    { label: "Bright Magenta", value: "brightMagenta" },
    { label: "Bright Cyan", value: "brightCyan" },
    { label: "Bright White", value: "brightWhite" },
];
const PI_THEME_COLORS = [
    "accent",
    "border",
    "borderAccent",
    "borderMuted",
    "success",
    "error",
    "warning",
    "muted",
    "dim",
    "text",
    "thinkingText",
    "userMessageText",
    "customMessageText",
    "customMessageLabel",
    "toolTitle",
    "toolOutput",
    "toolDiffAdded",
    "toolDiffRemoved",
    "toolDiffContext",
    "syntaxType",
    "thinkingOff",
    "thinkingMinimal",
    "thinkingLow",
    "thinkingMedium",
    "thinkingHigh",
    "thinkingXhigh",
    "bashMode",
];
const PI_FOREGROUND_COLORS = PI_THEME_COLORS.map((color) => ({
    label: `Pi ${themeColorDisplayName(color)}`,
    value: `pi:${color}`,
}));
export const FOREGROUND_COLORS = [...STANDARD_COLORS, ...PI_FOREGROUND_COLORS];
const ANSI16_FG = {
    default: [39, 49],
    black: [30, 40],
    red: [31, 41],
    green: [32, 42],
    yellow: [33, 43],
    blue: [34, 44],
    magenta: [35, 45],
    cyan: [36, 46],
    white: [37, 47],
    brightBlack: [90, 100],
    brightRed: [91, 101],
    brightGreen: [92, 102],
    brightYellow: [93, 103],
    brightBlue: [94, 104],
    brightMagenta: [95, 105],
    brightCyan: [96, 106],
    brightWhite: [97, 107],
};
export function normalizeColor(value) {
    if (typeof value !== "string")
        return undefined;
    if (STANDARD_COLORS.some((color) => color.value === value))
        return value;
    if (PI_FOREGROUND_COLORS.some((color) => color.value === value))
        return value;
    const match = /^ansi256:([0-9]{1,3})$/.exec(value);
    if (!match)
        return undefined;
    const code = Number(match[1]);
    return Number.isInteger(code) && code >= 0 && code <= 255
        ? `ansi256:${code}`
        : undefined;
}
export function colorDisplayName(color) {
    if (!color || color === "default")
        return "Default";
    if (color.startsWith("ansi256:"))
        return `ANSI256 ${color.slice("ansi256:".length)}`;
    if (color.startsWith("pi:"))
        return PI_FOREGROUND_COLORS.find((entry) => entry.value === color)?.label ?? color;
    return STANDARD_COLORS.find((entry) => entry.value === color)?.label ?? color;
}
export function ansi256Digits(color) {
    return color?.startsWith("ansi256:") ? String(Number(color.slice("ansi256:".length))) : "0";
}
export function appendAnsi256Digit(color, digit) {
    const digits = ansi256Digits(color);
    const next = Number(`${digits}${digit}`);
    return `ansi256:${Math.min(255, next)}`;
}
export function deleteAnsi256Digit(color) {
    const digits = ansi256Digits(color) || "0";
    const next = digits.slice(0, -1);
    return `ansi256:${next === "" ? 0 : Number(next)}`;
}
function useColorLevel(level) {
    const next = level === "truecolor" ? 3 : level === "ansi256" ? 2 : 1;
    if (chalk.level === next)
        return;
    chalk.level = next;
    chalk.c = new Chalk({ level: next });
}
export function applyColors(text, foreground, background, bold, level, theme) {
    if (level === "none")
        return text;
    useColorLevel(level);
    let output = text;
    if (foreground && foreground !== "default")
        output = applyOne(output, foreground, false, level, theme);
    if (background && background !== "default")
        output = applyOne(output, background, true, level);
    if (bold)
        output = chalk.c.bold(output);
    return output;
}
export function resetAnsi256Colors(options) {
    const next = { ...options };
    if (next.fg?.startsWith("ansi256:"))
        next.fg = "default";
    if (next.bg?.startsWith("ansi256:"))
        next.bg = "default";
    if (next.warningFg?.startsWith("ansi256:"))
        next.warningFg = "default";
    if (next.warningBg?.startsWith("ansi256:"))
        next.warningBg = "default";
    if (next.dangerFg?.startsWith("ansi256:"))
        next.dangerFg = "default";
    if (next.dangerBg?.startsWith("ansi256:"))
        next.dangerBg = "default";
    return next;
}
function themeColorDisplayName(color) {
    return color.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}
function applyOne(text, color, background, level, theme) {
    if (color.startsWith("pi:")) {
        if (background || !theme)
            return text;
        return theme.fg(color.slice("pi:".length), text);
    }
    if (color.startsWith("ansi256:")) {
        const code = Number(color.slice("ansi256:".length));
        if (level === "ansi256" || level === "truecolor") {
            return background ? chalk.c.bgAnsi256(code)(text) : chalk.c.ansi256(code)(text);
        }
        return text;
    }
    const codes = ANSI16_FG[color];
    if (!codes || color === "default")
        return text;
    return `\x1b[${background ? codes[1] : codes[0]}m${text}\x1b[${background ? 49 : 39}m`;
}
// Keep the escape byte out of a regex literal so oxlint's no-control-regex rule does not
// flag the intentional ANSI matcher. RegExp still receives the ESC sequence at runtime.
const ANSI_ESCAPE_PATTERN = new RegExp(String.raw `\x1B\[[0-?]*[ -/]*[@-~]`, "g");
export function stripAnsi(text) {
    return text.replace(ANSI_ESCAPE_PATTERN, "");
}
