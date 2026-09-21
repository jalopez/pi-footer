import { Key, matchesKey } from "@earendil-works/pi-tui";
import { WidgetStore } from "../../widgets/store.js";
import { applyGlobalMenuAction, applyGlobalSettingsAction, applyGlobalSettingsBackspace, applyGlobalSettingsTextInput, GLOBAL_MENU_ACTIONS, GLOBAL_MENU_HINT, globalMenuAction, globalMenuFields, } from "../global-menu.js";
import { isPrintable, wrap } from "../helpers.js";
import { Controller } from "./controller.js";
export class GlobalScreen extends Controller {
    selected = 0;
    renderScreen(width) {
        const fields = globalMenuFields(this.ctx.state.store.settings);
        return [
            this.render.line(this.render.menuTitle("Global Overrides", "Configure global settings for the pi-footer"), width),
            this.render.line(this.ctx.theme.dim(GLOBAL_MENU_HINT), width),
            ...fields.map((field, index) => this.render.menuLine(index === this.selected, field, width)),
        ];
    }
    handleInput(data) {
        if (matchesKey(data, Key.up))
            this.selected = wrap(this.selected - 1, GLOBAL_MENU_ACTIONS.length);
        else if (matchesKey(data, Key.down))
            this.selected = wrap(this.selected + 1, GLOBAL_MENU_ACTIONS.length);
        else if (matchesKey(data, Key.left))
            this.adjust(-1);
        else if (matchesKey(data, Key.right) || matchesKey(data, Key.enter))
            this.adjust(1);
        else if (matchesKey(data, Key.backspace))
            this.applyBackspace();
        else if (isPrintable(data))
            this.applyTextInput(data);
    }
    adjust(delta) {
        const action = globalMenuAction(this.selected);
        const settings = this.ctx.state.store.settings;
        if (!applyGlobalSettingsAction(settings, action, delta)) {
            this.ctx.state.store = WidgetStore.fromConfig(applyGlobalMenuAction(this.ctx.state.store.toConfig(), action, delta));
        }
        this.ctx.emitChange();
    }
    applyTextInput(data) {
        if (!applyGlobalSettingsTextInput(this.ctx.state.store.settings, globalMenuAction(this.selected), data))
            return;
        this.ctx.emitChange();
    }
    applyBackspace() {
        if (!applyGlobalSettingsBackspace(this.ctx.state.store.settings, globalMenuAction(this.selected)))
            return;
        this.ctx.emitChange();
    }
}
