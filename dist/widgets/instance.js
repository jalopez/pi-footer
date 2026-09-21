import { applyColors, stripAnsi } from "../colors.js";
export class WidgetInstance {
    spec;
    entry;
    constructor(spec, entry) {
        this.spec = spec;
        this.entry = entry;
    }
    get id() {
        return this.entry.id;
    }
    get type() {
        return this.entry.type;
    }
    get enabled() {
        return this.entry.enabled;
    }
    set enabled(value) {
        this.entry.enabled = value;
    }
    get options() {
        return this.entry.options;
    }
    set options(value) {
        this.entry.options = value;
    }
    // TODO(widget-spec): remove casts once render context and hydrated entries preserve concrete spec types.
    render(ctx) {
        const spec = this.spec;
        return spec.render({
            ctx: ctx,
            options: this.options,
            renderWidget: (value, renderOptions) => {
                return renderWidgetValue(this.entry, value, ctx, {
                    ...renderOptions,
                    icons: renderOptions?.icons ?? this.spec.icons,
                });
            },
        });
    }
    toggle(enabled = !this.enabled) {
        this.enabled = enabled;
    }
    update(options) {
        this.options = { ...this.options, ...options };
    }
    toEntry() {
        return {
            id: this.id,
            type: this.type,
            enabled: this.enabled,
            options: { ...this.options },
        };
    }
}
function renderWidgetValue(entry, value, ctx, renderOptions = {}) {
    // The persisted option fields the renderer reads (style + base options) — entry.options is
    // already WidgetOptions, which is a superset, so no narrowing is needed.
    const options = entry.options;
    if (!entry.enabled)
        return undefined;
    const rawValue = value ?? "";
    if (rawValue.length === 0 && options.hideWhenEmpty)
        return undefined;
    if (rawValue === "0" && options.hideWhenZero)
        return undefined;
    const fallbackValue = rawValue.length === 0 ? (options.text ?? "-") : rawValue;
    const displayValue = renderOptions.stripIncomingStyles ? stripAnsi(fallbackValue) : fallbackValue;
    const label = renderOptions.icons?.[ctx.iconMode];
    const unstyled = options.raw === true || ctx.minimalist
        ? displayValue
        : options.icon
            ? `${options.icon}${displayValue}`
            : label
                ? `${label} ${displayValue}`
                : displayValue;
    const styled = renderOptions.preservedTrimStyles && !renderOptions.stripIncomingStyles
        ? `${renderOptions.preservedTrimStyles}${unstyled}`
        : unstyled;
    return applyColors(styled, renderOptions.fg ?? options.fg, renderOptions.bg ?? options.bg, renderOptions.bold ?? options.bold, ctx.colorLevel, ctx.theme);
}
