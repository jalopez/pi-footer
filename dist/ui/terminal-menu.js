import { COLOR_LEVEL_VALUES } from "../colors.js";
import { TERMINAL_WIDTH_MODE_VALUES } from "../types.js";
import { cycle } from "./helpers.js";
import { COLOR_LEVEL_LABELS, WIDTH_MODE_LABELS } from "./model.js";
export const TERMINAL_MENU_ACTIONS = ["width-mode", "color-level"];
export const TERMINAL_MENU_HINT = "↑/↓ option • ←/→ change • esc back";
export function terminalMenuFields(config) {
    return [
        `Terminal Width: ${WIDTH_MODE_LABELS[config.terminal.widthMode]}`,
        `Color Level: ${COLOR_LEVEL_LABELS[config.terminal.colorLevel]}`,
    ];
}
export function terminalMenuAction(index) {
    return TERMINAL_MENU_ACTIONS[index] ?? "color-level";
}
export function nextTerminalWidthMode(config, delta) {
    return cycle(TERMINAL_WIDTH_MODE_VALUES, config.terminal.widthMode, delta);
}
export function nextTerminalColorLevel(config, delta) {
    return cycle(COLOR_LEVEL_VALUES, config.terminal.colorLevel, delta);
}
