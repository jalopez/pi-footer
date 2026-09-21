import { basename } from "node:path";
import { asyncCache, CACHE_NAMESPACES } from "./cache.js";
const CACHE_TTL_MS = 2000;
export const EMPTY_GIT_INFO = {
    branch: null,
    sha: null,
    root: null,
    staged: 0,
    unstaged: 0,
    untracked: 0,
    insertions: 0,
    deletions: 0,
    ahead: 0,
    behind: 0,
    remote: null,
    isRepo: false,
};
// SWR read for the live footer: returns the cached (possibly stale) value immediately, kicks an
// async refresh through asyncCache, and repaints via requestRender when fresh data lands. Stays
// off the render path's critical section — the git subprocesses run async via pi.exec.
export function getGitInfo(pi, cwd, branchHint, requestRender) {
    return (asyncCache.get(CACHE_NAMESPACES.git, `${cwd}:${branchHint ?? ""}`, CACHE_TTL_MS, { pi, cwd, branchHint }, fetchGitInfo, requestRender) ?? EMPTY_GIT_INFO);
}
// Awaitable git fetch for callers that can block (e.g. the config-UI preview command). Same work
// the SWR fetcher does, exposed directly so a one-shot snapshot can await real data.
export function loadGitInfo(pi, cwd, branchHint) {
    return fetchGitInfo({ pi, cwd, branchHint }).then((info) => info ?? EMPTY_GIT_INFO);
}
async function fetchGitInfo({ pi, cwd, branchHint }) {
    const rootPath = await git(pi, cwd, ["rev-parse", "--show-toplevel"]);
    if (!rootPath)
        return EMPTY_GIT_INFO;
    const [branch, sha, porcelain, shortstat, aheadBehind, remote] = await Promise.all([
        branchHint ? Promise.resolve(branchHint) : git(pi, cwd, ["rev-parse", "--abbrev-ref", "HEAD"]),
        git(pi, cwd, ["rev-parse", "--short", "HEAD"]),
        git(pi, cwd, ["status", "--porcelain=v1"]),
        git(pi, cwd, ["diff", "--shortstat", "HEAD"]),
        git(pi, cwd, ["rev-list", "--left-right", "--count", "@{upstream}...HEAD"]),
        git(pi, cwd, ["remote", "get-url", "origin"]),
    ]);
    return {
        branch,
        sha,
        root: basename(rootPath),
        ...parsePorcelain(porcelain),
        ...parseShortstat(shortstat),
        ...parseAheadBehind(aheadBehind),
        remote,
        isRepo: true,
    };
}
async function git(pi, cwd, args) {
    const { stdout, code, killed } = await pi.exec("git", ["--no-optional-locks", ...args], {
        cwd,
        timeout: 500,
    });
    // trimEnd, not trim: `status --porcelain=v1` encodes staged vs unstaged in columns 1/2, so the
    // leading space of the first line is significant. trim() would strip it and miscount that file.
    return code !== 0 || killed ? null : stdout.trimEnd() || null;
}
function parsePorcelain(output) {
    let staged = 0;
    let unstaged = 0;
    let untracked = 0;
    for (const line of output?.split("\n") ?? []) {
        if (line.length < 2)
            continue;
        const x = line[0];
        const y = line[1];
        if (x === "?" && y === "?") {
            untracked += 1;
            continue;
        }
        if (x !== " " && x !== undefined)
            staged += 1;
        if (y !== " " && y !== undefined)
            unstaged += 1;
    }
    return { staged, unstaged, untracked };
}
function parseShortstat(output) {
    const insertions = /([0-9]+) insertion/.exec(output ?? "")?.[1];
    const deletions = /([0-9]+) deletion/.exec(output ?? "")?.[1];
    return {
        insertions: insertions ? Number(insertions) : 0,
        deletions: deletions ? Number(deletions) : 0,
    };
}
function parseAheadBehind(output) {
    const [behind, ahead] = output?.split(/\s+/).map(Number) ?? [];
    return {
        ahead: Number.isFinite(ahead) ? (ahead ?? 0) : 0,
        behind: Number.isFinite(behind) ? (behind ?? 0) : 0,
    };
}
export function hasEnabledGitWidgets(config) {
    return config.lines.some((line) => line.some((widget) => widget.enabled && widget.type.startsWith("git-")));
}
