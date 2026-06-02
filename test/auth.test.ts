import { describe, expect, it } from "vitest";
import { extractBearerToken, isAuthorized } from "../src/auth.js";

describe("auth helpers", () => {
  it("extracts bearer tokens", () => {
    expect(extractBearerToken("Bearer secret")).toBe("secret");
    expect(extractBearerToken("bearer secret")).toBe("secret");
  });

  it("rejects missing or malformed tokens", () => {
    expect(extractBearerToken(undefined)).toBeUndefined();
    expect(extractBearerToken("Basic secret")).toBeUndefined();
    expect(extractBearerToken("Bearer")).toBeUndefined();
  });

  it("checks authorization", () => {
    expect(isAuthorized("Bearer secret", "secret")).toBe(true);
    expect(isAuthorized("Bearer wrong", "secret")).toBe(false);
  });
});
