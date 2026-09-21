import { clamp } from "./helpers.js";
export function pageSelection(selected, total, visibleCount, direction) {
    if (total <= 0)
        return 0;
    return clamp(selected + direction * visibleCount, 0, total - 1);
}
export function scrollWindow(total, selected, visibleCount) {
    const start = clamp(selected - Math.floor(visibleCount / 2), 0, Math.max(0, total - visibleCount));
    return { start, end: Math.min(total, start + visibleCount) };
}
export function rangeLabel(start, end, total) {
    if (total === 0)
        return "0-0";
    return `${start + 1}-${end}`;
}
