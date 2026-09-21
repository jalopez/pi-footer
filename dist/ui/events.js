import { highlightCode } from "@earendil-works/pi-coding-agent";
import { UPDATE_EVENT_WIDGET_EVENT } from "../event-widgets.js";
export function eventWidgetUsageLines(widget, width, line, dim) {
    return [
        line("", width),
        line(dim("Send events with a value:"), width),
        line(eventWidgetUsageCode(widgetId(widget), "Value"), width),
        line("", width),
        line(dim("Send events to remove status:"), width),
        line(eventWidgetUsageCode(widgetId(widget), "NULL"), width),
    ];
}
function widgetId(widget) {
    const value = widget.options.widgetId;
    return typeof value === "string" ? value : "";
}
function eventWidgetUsageCode(widgetId, value) {
    const v = value === "NULL" ? "null" : `"${value}"`;
    return (highlightCode(`pi.events.emit(${JSON.stringify(UPDATE_EVENT_WIDGET_EVENT)}, { "widgetId": ${JSON.stringify(widgetId)}, "value": ${v} });`, "typescript")[0] ?? "");
}
