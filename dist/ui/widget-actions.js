import { registry } from "../widgets/registry.js";
export function addLineAfter(lines, selectedLine) {
    lines.splice(selectedLine + 1, 0, []);
    return selectedLine + 1;
}
export function cloneLineAfter(lines, selectedLine, cloneWidget = (widget) => registry.cloneWidget(widget)) {
    const line = lines[selectedLine] ?? [];
    lines.splice(selectedLine + 1, 0, line.map(cloneWidget));
    return selectedLine + 1;
}
export function deleteLine(lines, selectedLine) {
    if (lines.length <= 1)
        return selectedLine;
    lines.splice(selectedLine, 1);
    return Math.min(selectedLine, lines.length - 1);
}
export function moveLine(lines, selectedLine, delta) {
    const next = selectedLine + delta;
    if (next < 0 || next >= lines.length)
        return selectedLine;
    const [line] = lines.splice(selectedLine, 1);
    if (!line)
        return selectedLine;
    lines.splice(next, 0, line);
    return next;
}
export function moveWidget(line, selectedWidget, delta) {
    const next = selectedWidget + delta;
    if (next < 0 || next >= line.length)
        return selectedWidget;
    const [widget] = line.splice(selectedWidget, 1);
    if (!widget)
        return selectedWidget;
    line.splice(next, 0, widget);
    return next;
}
export function cloneSelectedWidget(line, selectedWidget, cloneWidget = (widget) => registry.cloneWidget(widget)) {
    const widget = line[selectedWidget];
    if (!widget)
        return selectedWidget;
    line.splice(selectedWidget + 1, 0, cloneWidget(widget));
    return selectedWidget + 1;
}
export function deleteSelectedWidget(line, selectedWidget) {
    if (line.length === 0)
        return selectedWidget;
    line.splice(selectedWidget, 1);
    return Math.max(0, Math.min(selectedWidget, line.length - 1));
}
export function toggleWidgetEnabled(widget) {
    if (!widget)
        return false;
    widget.toggle();
    return true;
}
export function toggleWidgetRaw(widget) {
    if (!widget || isLayoutWidgetType(widget.type))
        return false;
    widget.update({ raw: !(widget.options.raw ?? false) });
    return true;
}
function isLayoutWidgetType(type) {
    return (type === "custom-text" || type === "separator" || type === "spacer" || type === "flex-separator");
}
