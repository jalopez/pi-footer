export const SEPARATOR_VALUES = [
    "none",
    "dot",
    "pipe",
    "space",
    "powerline",
    "dash",
    "comma",
];
export const WIDGET_SEPARATOR_VALUES = [
    ...SEPARATOR_VALUES,
    "powerline-right",
    "powerline-right-spaced",
    "powerline-left",
    "powerline-left-spaced",
    "powerline-soft-right",
    "powerline-soft-left",
    "powerline-start",
    "powerline-end",
    "custom",
];
export function separatorText(separator) {
    if (separator === "none")
        return "";
    if (separator === "space")
        return " ";
    if (separator === "pipe")
        return " | ";
    if (separator === "powerline")
        return "  ";
    if (separator === "dash")
        return " - ";
    if (separator === "comma")
        return ", ";
    return " • ";
}
export function widgetSeparatorText(separator, customText) {
    if (separator === "custom")
        return customText;
    if (separator === "powerline" || separator === "powerline-right-spaced")
        return " ";
    if (separator === "powerline-right")
        return "";
    if (separator === "powerline-left-spaced")
        return " ";
    if (separator === "powerline-left")
        return "";
    if (separator === "powerline-soft-right")
        return "";
    if (separator === "powerline-soft-left")
        return "";
    if (separator === "powerline-start")
        return "";
    if (separator === "powerline-end")
        return "";
    return separatorText(separator ?? "pipe");
}
