import { renderStatuslines } from "../render.js";
import { configTitleBarParts, previewTitleParts } from "./title-bar.js";
export class OverlayRender {
    theme;
    screenRender;
    constructor(theme, screenRender) {
        this.theme = theme;
        this.screenRender = screenRender;
    }
    render(options) {
        const layout = this.layout(options);
        const lines = [
            this.previewTitleLine(layout),
            ...this.previewLines(options),
            this.previewBottomLine(layout),
            this.blankSeparator(options.width),
            this.configTitleLine(options, layout),
            ...options.body,
        ];
        this.fillToTerminal(lines, options);
        lines.push(this.bottomBorder(layout));
        return lines;
    }
    layout(options) {
        return { innerWidth: Math.max(1, options.width - 2) };
    }
    previewTitleLine(layout) {
        const previewTitle = previewTitleParts(layout.innerWidth);
        return (this.theme.border("─") +
            this.theme.previewTitle(previewTitle.title) +
            this.theme.border(`${"─".repeat(previewTitle.rightPad)}─`));
    }
    previewLines(options) {
        return renderStatuslines(options.store, options.previewData, Math.max(20, options.width), {
            getExtensionStatuses: options.getExtensionStatuses,
            theme: options.theme,
            ...(options.requestRender ? { requestRender: options.requestRender } : {}),
        }).map((line) => this.screenRender.lineW(line, options.width));
    }
    previewBottomLine(layout) {
        return this.theme.border(`─${"─".repeat(layout.innerWidth)}─`);
    }
    blankSeparator(width) {
        return " " + this.screenRender.padLine(width, "", "") + " ";
    }
    configTitleLine(options, layout) {
        const title = configTitleBarParts(layout.innerWidth, (text) => this.theme.dim(text), Date.now(), options.configStateText, (text) => this.theme.border(text));
        return (this.theme.border("╭─") + title.title + this.theme.border(`${"─".repeat(title.rightPad)}╮`));
    }
    fillToTerminal(lines, options) {
        const neededToFillScreen = options.terminalRows - lines.length - 1;
        if (neededToFillScreen > 0) {
            lines.push(...Array(neededToFillScreen).fill(this.screenRender.line("", options.width)));
        }
    }
    bottomBorder(layout) {
        return this.theme.border(`╰${"─".repeat(layout.innerWidth)}╯`);
    }
}
