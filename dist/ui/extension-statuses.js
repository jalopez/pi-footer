import { truncateToWidth } from "@earendil-works/pi-tui";
import { STATUS_KEY } from "../config.js";
import { allExtensionStatusEntries, toggleExtensionStatusRowKey, } from "../extension-statuses.js";
export function extensionStatusRowLines(config, getExtensionStatuses, selected, width, menuTitle, line, menuLine, dim, success, warning) {
    const entries = allExtensionStatusEntries(getExtensionStatuses(), config.extensionStatusRow, STATUS_KEY);
    const hidden = new Set(config.extensionStatusRow.hiddenKeys);
    const lines = [
        line(menuTitle("Pi extensions", "Published statuses and extension status row visibility"), width),
        line(dim("↑/↓ select • pgup/pgdn jump • ←/→ or enter toggle • esc back"), width),
    ];
    if (entries.length === 0) {
        lines.push(line(warning("No extension statuses are currently available."), width));
        return lines;
    }
    entries.forEach((entry, index) => {
        const state = hidden.has(entry.key) ? dim("off") : success("on ");
        const key = dim(entry.key);
        const maxValueWidth = Math.max(1, width - entry.key.length - 8);
        const value = truncateToWidth(entry.value, maxValueWidth, "…");
        lines.push(menuLine(index === selected, `${state} ${key} ${value}`, width));
    });
    return lines;
}
export function toggleExtensionStatusRowSelection(config, getExtensionStatuses, selected) {
    const entry = allExtensionStatusEntries(getExtensionStatuses(), config.extensionStatusRow, STATUS_KEY)[selected];
    if (!entry)
        return false;
    config.extensionStatusRow = toggleExtensionStatusRowKey(config.extensionStatusRow, entry.key);
    return true;
}
export function extensionStatusRowCount(config, getExtensionStatuses) {
    return allExtensionStatusEntries(getExtensionStatuses(), config.extensionStatusRow, STATUS_KEY)
        .length;
}
