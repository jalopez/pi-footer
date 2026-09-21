export function createUiTheme(getTheme) {
    return {
        accent: (text) => getTheme().fg("accent", text),
        dim: (text) => getTheme().fg("dim", text),
        muted: (text) => getTheme().fg("muted", text),
        success: (text) => getTheme().fg("success", text),
        warning: (text) => getTheme().fg("warning", text),
        error: (text) => getTheme().fg("error", text),
        bold: (text) => getTheme().bold(text),
        selected: (text) => {
            const theme = getTheme();
            return theme.bg("selectedBg", theme.fg("accent", text));
        },
        border: (text, color = "border") => getTheme().fg(color, text),
        previewTitle: (text) => {
            const theme = getTheme();
            return theme.fg("accent", theme.bold(text));
        },
        configStateLabel: (state, label) => {
            const theme = getTheme();
            if (state === "saved")
                return theme.fg("accent", label);
            if (state === "dirty")
                return theme.bold(theme.fg("warning", label));
            if (state === "saving")
                return theme.fg("dim", label);
            if (state === "error")
                return theme.bold(theme.fg("error", label));
            return "";
        },
    };
}
