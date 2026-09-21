export function colorPair(fg, bg) {
    return {
        ...(fg === undefined ? {} : { fg }),
        ...(bg === undefined ? {} : { bg }),
    };
}
