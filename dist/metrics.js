import { isRecord } from "./types.js";
export function collectSessionMetrics(entries) {
    const metrics = {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        totalTokens: 0,
        costUsd: 0,
        userMessages: 0,
        assistantMessages: 0,
        toolResults: 0,
        firstTimestampMs: undefined,
        lastTimestampMs: undefined,
        compactions: 0,
    };
    for (const entry of entries) {
        const message = getMessage(entry);
        if (!message)
            continue;
        const timestampMs = normalizeTimestamp(message.timestamp ?? getEntryTimestamp(entry));
        if (timestampMs !== undefined) {
            metrics.firstTimestampMs =
                metrics.firstTimestampMs === undefined
                    ? timestampMs
                    : Math.min(metrics.firstTimestampMs, timestampMs);
            metrics.lastTimestampMs =
                metrics.lastTimestampMs === undefined
                    ? timestampMs
                    : Math.max(metrics.lastTimestampMs, timestampMs);
        }
        if (message.role === "user")
            metrics.userMessages += 1;
        if (message.role === "toolResult")
            metrics.toolResults += 1;
        if (message.role === "compactionSummary")
            metrics.compactions += 1;
        if (message.role !== "assistant")
            continue;
        metrics.assistantMessages += 1;
        const usage = getUsage(message.usage);
        if (!usage)
            continue;
        const input = numberOrZero(usage.input);
        const output = numberOrZero(usage.output);
        const cacheRead = numberOrZero(usage.cacheRead);
        const cacheWrite = numberOrZero(usage.cacheWrite);
        metrics.inputTokens += input;
        metrics.outputTokens += output;
        metrics.cacheReadTokens += cacheRead;
        metrics.cacheWriteTokens += cacheWrite;
        metrics.totalTokens +=
            numberOrZero(usage.totalTokens) || input + output + cacheRead + cacheWrite;
        metrics.costUsd += numberOrZero(usage.cost?.total);
    }
    return metrics;
}
export function collectTurnMetrics(entries) {
    const metrics = {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
        totalTokens: 0,
        costUsd: 0,
    };
    for (let index = entries.length - 1; index >= 0; index -= 1) {
        const message = getMessage(entries[index]);
        if (message?.role !== "assistant")
            continue;
        const usage = getUsage(message.usage);
        if (!usage)
            continue;
        const input = numberOrZero(usage.input);
        const output = numberOrZero(usage.output);
        const cacheRead = numberOrZero(usage.cacheRead);
        const cacheWrite = numberOrZero(usage.cacheWrite);
        metrics.inputTokens = input;
        metrics.outputTokens = output;
        metrics.cacheReadTokens = cacheRead;
        metrics.cacheWriteTokens = cacheWrite;
        metrics.totalTokens =
            numberOrZero(usage.totalTokens) || input + output + cacheRead + cacheWrite;
        metrics.costUsd = numberOrZero(usage.cost?.total);
        return metrics;
    }
    return metrics;
}
function getMessage(entry) {
    if (!isRecord(entry))
        return undefined;
    const message = entry.message;
    return isRecord(message) ? message : undefined;
}
function getEntryTimestamp(entry) {
    return isRecord(entry) ? entry.timestamp : undefined;
}
function getUsage(value) {
    return isRecord(value) ? value : undefined;
}
function normalizeTimestamp(value) {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value !== "string")
        return undefined;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}
function numberOrZero(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
