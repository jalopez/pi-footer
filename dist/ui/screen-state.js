export function createScreenState(store) {
    return {
        store,
        view: "main",
        viewBeforeConfirmExit: "main",
        selectedLine: 0,
        selectedWidget: 0,
    };
}
