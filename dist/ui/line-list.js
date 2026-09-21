export const LINE_LIST_HINT = "↑/↓ select • pgup/pgdn jump • enter edit • a add • c clone • w/s move • d delete • esc back";
export function lineListCountLabel(total, start, end) {
    return `${total} line(s), showing ${rangeLabel(start, end, total)}`;
}
export function lineListItemLabel(index, widgetCount, dim) {
    return `☰ Line ${index + 1} ${dim(`(${widgetCount} widget${widgetCount === 1 ? "" : "s"})`)}`;
}
function rangeLabel(start, end, total) {
    if (total === 0)
        return "0-0";
    return `${start + 1}-${end}`;
}
