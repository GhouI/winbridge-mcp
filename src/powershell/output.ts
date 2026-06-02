export type OutputBuffer = {
  append(chunk: Buffer | string): void;
  text(): string;
  truncated(): boolean;
};

export function createOutputBuffer(maxBytes: number): OutputBuffer {
  let size = 0;
  let truncated = false;
  const chunks: Buffer[] = [];

  return {
    append(chunk: Buffer | string) {
      if (truncated) {
        return;
      }

      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      const remaining = maxBytes - size;
      if (remaining <= 0) {
        truncated = true;
        return;
      }

      if (buffer.length > remaining) {
        chunks.push(buffer.subarray(0, remaining));
        size += remaining;
        truncated = true;
        return;
      }

      chunks.push(buffer);
      size += buffer.length;
    },
    text() {
      return Buffer.concat(chunks).toString("utf8");
    },
    truncated() {
      return truncated;
    }
  };
}
