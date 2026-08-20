import { describe, expect, it } from "vitest";

describe("Supabase browser configuration", () => {
  it("reaches the public auth settings endpoint using the configured publishable key", async () => {
    const projectUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

    expect(projectUrl).toMatch(/^https:\/\/[^/]+\.supabase\.co$/);
    expect(anonKey).toBeTruthy();

    const response = await fetch(`${projectUrl}/auth/v1/settings`, {
      headers: { apikey: anonKey! },
    });

    expect(response.ok).toBe(true);
  });
});
