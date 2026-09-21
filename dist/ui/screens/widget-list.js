import { Key, matchesKey } from "@earendil-works/pi-tui";
import { registry } from "../../widgets/registry.js";
import { formatWidgetColorOptions, formatWidgetOptions } from "../fields.js";
import { wrap } from "../helpers.js";
import { pageSelection, scrollWindow } from "../navigation.js";
import { cloneSelectedWidget, deleteSelectedWidget, moveWidget, toggleWidgetEnabled, toggleWidgetRaw, } from "../widget-actions.js";
import { Controller } from "./controller.js";
const HINT = "↑/↓ select • enter options • a add • c clone • w/s move • d delete • space toggle • r raw • esc back";
const COLOR_HINT = "↑/↓ select • pgup/pgdn jump • enter colors • esc back";
export class WidgetListScreen extends Controller {
    colors;
    constructor(ctx, render, colors) {
        super(ctx, render);
        this.colors = colors;
    }
    renderScreen(width) {
        const line = this.ctx.currentLine();
        const visibleCount = this.ctx.visibleRowCount();
        const { start, end } = scrollWindow(line.length, this.ctx.state.selectedWidget, visibleCount);
        const visible = line.slice(start, end);
        const lines = [
            this.render.line(this.render.menuTitle(`${this.colors ? "Edit widget colors" : "Edit widgets"} / Line ${this.ctx.state.selectedLine + 1}`, this.colors
                ? "Select a widget to edit its colors"
                : "Select a widget to edit its options, or add/remove/reorder widgets"), width),
            this.render.line(this.ctx.theme.dim(this.colors ? COLOR_HINT : HINT), width),
            this.render.line(this.ctx.theme.dim(this.countLabel(line.length, start, end)), width),
        ];
        if (line.length === 0)
            lines.push(this.render.line(this.ctx.theme.warning("Empty line. Press a to add a widget."), width));
        visible.forEach((widget, offset) => {
            const index = start + offset;
            const text = this.colors ? this.colorItemLabel(index, widget) : this.itemLabel(index, widget);
            lines.push(this.render.menuLine(index === this.ctx.state.selectedWidget, text, width));
        });
        return lines;
    }
    handleInput(data) {
        const line = this.ctx.currentLine();
        if (matchesKey(data, Key.up))
            this.ctx.state.selectedWidget = wrap(this.ctx.state.selectedWidget - 1, Math.max(1, line.length));
        else if (matchesKey(data, Key.down))
            this.ctx.state.selectedWidget = wrap(this.ctx.state.selectedWidget + 1, Math.max(1, line.length));
        else if (matchesKey(data, Key.pageUp))
            this.page(line.length, -1);
        else if (matchesKey(data, Key.pageDown))
            this.page(line.length, 1);
        else if (this.colors && matchesKey(data, Key.enter))
            this.ctx.show("edit-colors");
        else if (!this.colors)
            this.handleEditListInput(data);
    }
    countLabel(total, start, end) {
        const range = total === 0 ? "0-0" : `${start + 1}-${end}`;
        return `${total} widget(s), showing ${range}`;
    }
    itemLabel(index, widget) {
        const enabled = widget.enabled ? this.ctx.theme.success("on ") : this.ctx.theme.dim("off");
        const indexPad = index < 9 ? " " : "";
        const options = this.ctx.theme.dim(formatWidgetOptions(widget));
        return `${enabled} ${index + 1}.${indexPad} ${registry.spec(widget.type).label} ${options}`;
    }
    colorItemLabel(index, widget) {
        const enabled = widget.enabled ? this.ctx.theme.success("on ") : this.ctx.theme.dim("off");
        const indexPad = index < 9 ? " " : "";
        const options = this.ctx.theme.dim(formatWidgetColorOptions(widget));
        return `${enabled} ${index + 1}.${indexPad} ${registry.spec(widget.type).label} ${options}`;
    }
    handleEditListInput(data) {
        if (data === "a")
            this.ctx.show("add-widget");
        else if (matchesKey(data, Key.enter) || data === "e")
            this.ctx.show("edit-widget");
        else if (data === "c")
            this.cloneCurrentWidget();
        else if (data === "w")
            this.moveWidget(-1);
        else if (data === "s")
            this.moveWidget(1);
        else if (data === "d")
            this.deleteCurrentWidget();
        else if (matchesKey(data, Key.space))
            this.toggleCurrentWidget();
        else if (data === "r")
            this.toggleCurrentWidgetRaw();
    }
    page(length, delta) {
        this.ctx.state.selectedWidget = pageSelection(this.ctx.state.selectedWidget, length, this.ctx.visibleRowCount(), delta);
    }
    moveWidget(delta) {
        const next = moveWidget(this.ctx.currentLine(), this.ctx.state.selectedWidget, delta);
        if (next === this.ctx.state.selectedWidget)
            return;
        this.ctx.state.selectedWidget = next;
        this.ctx.emitChange();
    }
    cloneCurrentWidget() {
        const next = cloneSelectedWidget(this.ctx.currentLine(), this.ctx.state.selectedWidget, (widget) => registry.cloneWidget(widget));
        if (next === this.ctx.state.selectedWidget)
            return;
        this.ctx.state.selectedWidget = next;
        this.ctx.emitChange();
    }
    deleteCurrentWidget() {
        const line = this.ctx.currentLine();
        const previousLength = line.length;
        this.ctx.state.selectedWidget = deleteSelectedWidget(line, this.ctx.state.selectedWidget);
        if (line.length === previousLength)
            return;
        this.ctx.emitChange();
    }
    toggleCurrentWidget() {
        if (!toggleWidgetEnabled(this.ctx.currentWidget()))
            return;
        this.ctx.emitChange();
    }
    toggleCurrentWidgetRaw() {
        if (!toggleWidgetRaw(this.ctx.currentWidget()))
            return;
        this.ctx.emitChange();
    }
}
