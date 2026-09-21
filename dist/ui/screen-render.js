import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
export class ScreenRender {
    theme;
    constructor(theme) {
        this.theme = theme;
    }
    menuTitle(title, description = "") {
        if (description.length === 0)
            return this.theme.accent(title);
        return this.theme.success(`•${title}`) + " " + this.theme.dim(description);
    }
    padLine(width, content, ellipsis = "…") {
        return truncateToWidth(content, Math.max(1, width - 2), ellipsis, true);
    }
    lineW(content, width) {
        // NOTE: uncoment below for demo-look preview.
        // const clipped = truncateToWidth(content, Math.max(0, width - 2), "…");
        const clipped = truncateToWidth(content, Math.max(0, width), "…");
        return `${clipped}${" ".repeat(Math.max(0, width - visibleWidth(clipped)))}`;
    }
    line(content, width) {
        return this.theme.border("│") + this.padLine(width, content) + this.theme.border("│");
    }
    menuLine(selected, content, width) {
        const text = `${selected ? "›" : " "}  ${content}`;
        return this.line(selected ? this.theme.selected(text) : text, width);
    }
}
