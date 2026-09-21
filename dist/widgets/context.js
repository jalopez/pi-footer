export function contextForDependencies(baseCtx, dependencies, data, options) {
    // getExtensionStatuses is read live from options, never snapshotted into data.
    const source = {
        ...data,
        getExtensionStatuses: options.getExtensionStatuses,
    };
    const output = { ...baseCtx };
    const writableOutput = output;
    for (const dependency of dependencies) {
        writableOutput[dependency] = source[dependency];
    }
    // TODO(widget-spec): remove this cast if TypeScript gains better support for dynamic object construction.
    return output;
}
