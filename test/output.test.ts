import { describe, expect, it } from "vitest";
import { createOutputBuffer } from "../src/powershell/output.js";

describe("output buffer", () => {
  it("captures output below the limit", () => {
    const buffer = createOutputBuffer(10);
    buffer.append("hello");
    expect(buffer.text()).toBe("hello");
    expect(buffer.truncated()).toBe(false);
  });

  it("truncates output above the limit", () => {
    const buffer = createOutputBuffer(5);
    buffer.append("hello world");
    expect(buffer.text()).toBe("hello");
    expect(buffer.truncated()).toBe(true);
  });
});
