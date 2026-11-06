import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as config from "../src/config.js";
import statuslineExtension from "../src/index.js";

type Handler = (event: unknown, ctx: ExtensionContext) => unknown;

function harness(mode = "tui") {
  const handlers = new Map<string, Handler>();
  const registerCommand = vi.fn<ExtensionAPI["registerCommand"]>();
  const pi = {
    on: (name: string, handler: Handler) => handlers.set(name, handler),
    events: { on: vi.fn<ExtensionAPI["events"]["on"]>() },
    registerCommand,
  } as unknown as ExtensionAPI;
  const setFooter = vi.fn<ExtensionContext["ui"]["setFooter"]>();
  const ctx = {
    mode,
    hasUI: mode === "tui" || mode === "rpc",
    ui: {
      setFooter,
      setStatus: vi.fn<ExtensionContext["ui"]["setStatus"]>(),
      theme: { fg: (_color: string, text: string) => text },
    },
  } as unknown as ExtensionContext;
  return { pi, ctx, handlers, setFooter, registerCommand };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Herdr footer suppression", () => {
  it("renders no footer in Herdr without loading or changing global settings", async () => {
    vi.stubEnv("HC_TERMINAL_ID", "t4f");
    const load = vi.spyOn(config, "loadConfig");
    const save = vi.spyOn(config, "saveConfig");
    const h = harness();
    await statuslineExtension(h.pi);
    await h.handlers.get("session_start")?.({}, h.ctx);
    const factory = h.setFooter.mock.calls[0]?.[0];
    if (!factory) throw new Error("Expected a custom footer factory");
    const args = [undefined, undefined, undefined] as unknown as Parameters<typeof factory>;
    expect(factory(...args).render(120)).toEqual([]);
    expect(load).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    expect(h.registerCommand).not.toHaveBeenCalled();
    await h.handlers.get("session_shutdown")?.({}, h.ctx);
    expect(h.setFooter).toHaveBeenLastCalledWith(undefined);
  });

  it.each(["rpc", "json", "print"])("does not override the footer in %s mode", async (mode) => {
    vi.stubEnv("HC_TERMINAL_ID", "t4f");
    const h = harness(mode);
    await statuslineExtension(h.pi);
    await h.handlers.get("session_start")?.({}, h.ctx);
    await h.handlers.get("session_shutdown")?.({}, h.ctx);
    expect(h.setFooter).not.toHaveBeenCalled();
  });

  it("keeps the configured footer and command in other terminals", async () => {
    vi.stubEnv("HC_TERMINAL_ID", "");
    const load = vi
      .spyOn(config, "loadConfig")
      .mockResolvedValue(config.cloneConfig(config.DEFAULT_CONFIG));
    const h = harness();
    await statuslineExtension(h.pi);
    await h.handlers.get("session_start")?.({}, h.ctx);
    expect(load).toHaveBeenCalled();
    expect(h.setFooter).toHaveBeenLastCalledWith(expect.any(Function));
    expect(h.registerCommand).toHaveBeenCalledWith("footer", expect.any(Object));
  });
});
