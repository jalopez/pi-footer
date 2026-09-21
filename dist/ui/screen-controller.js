export class ScreenController {
    ctx;
    screens = new Map();
    constructor(ctx) {
        this.ctx = ctx;
    }
    register(view, screen) {
        this.screens.set(view, screen);
    }
    renderScreen(width) {
        return this.currentScreen().renderScreen(width);
    }
    handleInput(data) {
        this.currentScreen().handleInput(data);
    }
    currentScreen() {
        const screen = this.screens.get(this.ctx.state.view);
        if (!screen)
            throw new Error(`No screen registered for view: ${this.ctx.state.view}`);
        return screen;
    }
}
