import { cloneConfig } from "../config.js";
export class ConfigLifecycle {
    savedConfig;
    configState = "clean";
    constructor(config) {
        this.savedConfig = cloneConfig(config);
    }
    get dirty() {
        return this.configState === "dirty" || this.configState === "error";
    }
    get state() {
        return this.configState;
    }
    get label() {
        if (this.configState === "dirty")
            return "Unsaved";
        if (this.configState === "saving")
            return "Saving…";
        if (this.configState === "saved")
            return "Saved";
        if (this.configState === "error")
            return "Save failed";
        return undefined;
    }
    markChanged() {
        this.configState = "dirty";
    }
    beginSave() {
        this.configState = "saving";
    }
    markSaved(config) {
        this.savedConfig = cloneConfig(config);
        this.configState = "saved";
    }
    markSaveFailed() {
        this.configState = "error";
    }
    closeResult(saved) {
        return {
            config: cloneConfig(this.savedConfig),
            saved,
        };
    }
}
