import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("portal authentication controls", () => {
  it("connects the preserved portal forms and header state to the React Supabase bridge", async () => {
    const [app, home, portal] = await Promise.all([
      readFile(path.join(projectRoot, "client/src/App.tsx"), "utf8"),
      readFile(path.join(projectRoot, "client/src/pages/Home.tsx"), "utf8"),
      readFile(path.join(projectRoot, "client/public/e-mahata.html"), "utf8"),
    ]);

    expect(app).toContain("<AuthProvider>");
    expect(home).toContain('type: "auth:sign-in"');
    expect(home).toContain('type: "auth:sign-up"');
    expect(home).toContain('type: "auth:sign-out"');
    expect(portal).toContain('id="authEmail"');
    expect(portal).toContain('id="authPassword"');
    expect(portal).toContain('data-auth-signout');
    expect(portal).toContain("function updateAuthUi(user)");
  });
});
