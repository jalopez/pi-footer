export const CONFIG_UI_RESERVED_ROWS = 8;
export const MIN_VISIBLE_ROW_COUNT = 4;
export function activeLineCount(lines) {
    return lines.filter((line) => line.length > 0).length;
}
export function visibleRowCount(terminalRows, heightRatio, activeLines) {
    return Math.max(MIN_VISIBLE_ROW_COUNT, Math.floor(terminalRows * heightRatio) - CONFIG_UI_RESERVED_ROWS - activeLines);
}
