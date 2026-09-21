export function formatCount(value) {
    if (value < 1000)
        return `${value}`;
    if (value < 1000000)
        return `${trimFixed(value / 1000, 1)}k`;
    return `${trimFixed(value / 1000000, 1)}m`;
}
export function formatPiTokenCount(value) {
    if (value < 1000)
        return `${value}`;
    if (value < 10000)
        return `${(value / 1000).toFixed(1)}k`;
    if (value < 1000000)
        return `${Math.round(value / 1000)}k`;
    if (value < 10000000)
        return `${(value / 1000000).toFixed(1)}M`;
    return `${Math.round(value / 1000000)}M`;
}
function trimFixed(value, digits) {
    return value.toFixed(digits).replace(/\.0$/, "");
}
const TOKEN_FORMAT_STYLES = {
    default: {
        label: "Default",
        list: "Default",
        format: formatCount,
    },
    compact: {
        label: "Compact",
        list: "Compact",
        format: formatPiTokenCount,
    },
};
const TOKEN_FORMAT_STYLE_VALUES = Object.keys(TOKEN_FORMAT_STYLES);
const TOKEN_FORMAT_CHOICES = TOKEN_FORMAT_STYLE_VALUES.map((style) => ({
    id: style,
    label: TOKEN_FORMAT_STYLES[style].label,
    list: TOKEN_FORMAT_STYLES[style].list,
}));
export function formatTokenCount(value, style) {
    return TOKEN_FORMAT_STYLES[style].format(value);
}
export function formatTokenSpeed(tokens, first, last, tokenFormatStyle) {
    if (first === undefined ||
        last === undefined ||
        !Number.isFinite(first) ||
        !Number.isFinite(last) ||
        last <= first) {
        return "0/min";
    }
    const minutes = Math.max((last - first) / 60000, 1 / 60);
    return `${formatTokenCount(Math.round(tokens / minutes), tokenFormatStyle)}/min`;
}
export function tokenFormatStyleProperty() {
    return {
        id: "tokenFormatStyle",
        label: "Token format",
        kind: "choice",
        description: "Token display format",
        default: "default",
        options: {
            choices: TOKEN_FORMAT_CHOICES,
            showInWidgets: true,
            showInColors: false,
            listProperty: "format",
        },
    };
}
