import { COLOR_LEVEL_LABELS } from "./model.js";
export const COLOR_LEVEL_CONFIRM_HINT = "Press enter/y to proceed, esc/n to go back.";
export const COLOR_LEVEL_CONFIRM_WARNING = "Changing color level will reset all custom ANSI256 widget colors.";
export function colorLevelConfirmValueLabel(colorLevel) {
    return `New color level: ${colorLevel ? COLOR_LEVEL_LABELS[colorLevel] : "unknown"}`;
}
export function colorLevelConfirmAction(data, isEscape, isEnter) {
    if (isEscape || data === "n")
        return "cancel";
    if (isEnter || data === "y")
        return "confirm";
    return undefined;
}
