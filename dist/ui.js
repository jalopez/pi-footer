import { cloneConfig } from "./config.js";
import {} from "./ui/config-lifecycle.js";
import { CONFIG_UI_HEIGHT_RATIO } from "./ui/model.js";
import { StatuslineConfigScreen } from "./ui/screen.js";
export { StatuslineConfigScreen } from "./ui/screen.js";
export async function openStatuslineConfigUi(ctx, initialConfig, previewData, onChange, onSave, getExtensionStatuses) {
    let finalConfig = cloneConfig(initialConfig);
    return ctx.ui.custom((tui, theme, _keybindings, done) => {
        const screen = new StatuslineConfigScreen(finalConfig, previewData, getExtensionStatuses, () => tui.requestRender(), () => tui.terminal.rows, {
            onChange(config) {
                finalConfig = cloneConfig(config);
                onChange(finalConfig);
                tui.requestRender();
            },
            async onSave(config) {
                finalConfig = cloneConfig(config);
                try {
                    await onSave(finalConfig);
                }
                catch (error) {
                    ctx.ui.notify(`Could not save pi-footer config: ${error instanceof Error ? error.message : String(error)}`, "error");
                    throw error;
                }
            },
            onClose(result) {
                done(result);
            },
            getTheme: () => theme,
        });
        return screen;
    }, {
        overlay: true,
        overlayOptions: {
            anchor: "top-center",
            width: "100%",
            maxHeight: `${CONFIG_UI_HEIGHT_RATIO * 100}%`,
            margin: 0,
        },
    });
}
