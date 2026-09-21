import { isRecord } from "./types.js";
export const EMPTY_STATUS_LABEL = "[Empty status]";
export const DEFAULT_EXTENSION_STATUS_ROW = {
    hiddenKeys: [],
    knownKeys: [],
};
export const EMPTY_EXTENSION_STATUSES = new Map();
export function extensionStatusEntries(statuses, ownStatusKey) {
    return [...statuses.entries()]
        .filter(([key, value]) => key !== ownStatusKey && value.length > 0)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => ({ key, value, published: true }));
}
export function allExtensionStatusEntries(statuses, rowConfig, ownStatusKey) {
    const keys = new Set([...statuses.keys(), ...rowConfig.hiddenKeys, ...rowConfig.knownKeys]);
    return [...keys]
        .filter((key) => key.length > 0 && key !== ownStatusKey)
        .sort((left, right) => left.localeCompare(right))
        .map((key) => {
        const value = statuses.get(key) ?? "";
        return {
            key,
            value: value.length > 0 ? value : EMPTY_STATUS_LABEL,
            published: value.length > 0,
        };
    });
}
export function visibleExtensionStatusRowEntries(statuses, hiddenKeys, ownStatusKey) {
    const hidden = new Set(hiddenKeys);
    return extensionStatusEntries(statuses, ownStatusKey).filter((entry) => !hidden.has(entry.key));
}
export function toggleExtensionStatusRowKey(rowConfig, key) {
    const hidden = new Set(rowConfig.hiddenKeys);
    const known = new Set(rowConfig.knownKeys);
    known.add(key);
    if (hidden.has(key))
        hidden.delete(key);
    else
        hidden.add(key);
    return {
        hiddenKeys: sortedKeys(hidden),
        knownKeys: sortedKeys(known),
    };
}
export function normalizeExtensionStatusRow(value) {
    if (!isRecord(value))
        return cloneExtensionStatusRow(DEFAULT_EXTENSION_STATUS_ROW);
    return {
        hiddenKeys: normalizeKeyList(value.hiddenKeys),
        knownKeys: normalizeKeyList(value.knownKeys),
    };
}
export function cloneExtensionStatusRow(value) {
    return {
        hiddenKeys: [...value.hiddenKeys],
        knownKeys: [...value.knownKeys],
    };
}
function normalizeKeyList(value) {
    if (!Array.isArray(value))
        return [];
    return sortedKeys(new Set(value.filter((key) => typeof key === "string" && key.length > 0)));
}
function sortedKeys(keys) {
    return [...keys].sort((left, right) => left.localeCompare(right));
}
