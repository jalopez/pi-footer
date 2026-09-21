export function escapeTarget(view) {
    if (view === "main")
        return "close";
    if (view === "line-list" ||
        view === "color-line-list" ||
        view === "terminal" ||
        view === "global" ||
        view === "extension-status-row")
        return "main";
    if (view === "widget-list")
        return "line-list";
    if (view === "color-widget-list")
        return "color-line-list";
    if (view === "edit-colors")
        return "color-widget-list";
    if (view === "add-widget" || view === "edit-widget")
        return "widget-list";
    if (view === "confirm-color-level")
        return "terminal";
    if (view === "confirm-exit")
        return "main";
    return "main";
}
export function cycle(values, current, delta) {
    const index = values.indexOf(current);
    return values[(index + delta + values.length) % values.length] ?? current;
}
export function adjustAnsi(current, delta) {
    const currentCode = current?.startsWith("ansi256:") ? Number(current.slice(8)) : 0;
    return `ansi256:${wrap(currentCode + delta, 256)}`;
}
export function wrap(value, length) {
    if (length <= 0)
        return 0;
    return (value + length) % length;
}
export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
export function isPrintable(data) {
    return data.length === 1 && data.charCodeAt(0) >= 32 && data.charCodeAt(0) !== 127;
}
