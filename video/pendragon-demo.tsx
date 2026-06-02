import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const commands = [
  {
    at: 80,
    text: "npm run client -- exec hostname",
    result: "win-build-01"
  },
  {
    at: 145,
    text: "npm run client -- exec '$PSVersionTable.PSVersion'",
    result: "Major  Minor  Patch\n5      1      26100"
  },
  {
    at: 215,
    text: "npm run client -- exec Get-Service W32Time",
    result: "Status   Name     DisplayName\nRunning  W32Time  Windows Time"
  }
];

export function PendragonDemo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow = spring({ frame, fps, config: { damping: 18, stiffness: 60 } });
  const subtitleOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={styles.canvas}>
      <div style={styles.grid} />
      <div style={{ ...styles.hero, transform: `translateY(${interpolate(glow, [0, 1], [18, 0])}px)` }}>
        <div style={styles.badge}>MCP for Windows PowerShell</div>
        <h1 style={styles.title}>AI agents can code. Windows RDP traps them behind a GUI.</h1>
        <p style={{ ...styles.subtitle, opacity: subtitleOpacity }}>
          Pendragon turns Windows into an MCP-native shell target.
        </p>
      </div>
      <NetworkDiagram frame={frame} />
      <Terminal frame={frame} />
      <div style={styles.footer}>Codex / Claude Code / MCP clients {"->"} Pendragon {"->"} headless PowerShell</div>
    </AbsoluteFill>
  );
}

function NetworkDiagram({ frame }: { frame: number }) {
  const pulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.35, 1]);
  return (
    <div style={styles.diagram}>
      <Node label="Agent" detail="Codex or Claude Code" active={frame > 35} />
      <Line active={frame > 55} pulse={pulse} />
      <Node label="Pendragon" detail="Streamable HTTP MCP" active={frame > 65} accent />
      <Line active={frame > 95} pulse={pulse} />
      <Node label="Windows" detail="PowerShell, headless" active={frame > 105} />
    </div>
  );
}

function Node({ label, detail, active, accent = false }: { label: string; detail: string; active: boolean; accent?: boolean }) {
  return (
    <div
      style={{
        ...styles.node,
        opacity: active ? 1 : 0.35,
        borderColor: accent ? "#e43f5a" : "#5dd6c5",
        boxShadow: active ? `0 0 28px ${accent ? "rgba(228,63,90,.34)" : "rgba(93,214,197,.24)"}` : "none"
      }}
    >
      <strong>{label}</strong>
      <span>{detail}</span>
    </div>
  );
}

function Line({ active, pulse }: { active: boolean; pulse: number }) {
  return (
    <div style={styles.lineWrap}>
      <div style={{ ...styles.line, opacity: active ? pulse : 0.15 }} />
    </div>
  );
}

function Terminal({ frame }: { frame: number }) {
  const visible = commands.filter((command) => frame >= command.at);
  return (
    <div style={styles.terminal}>
      <div style={styles.terminalBar}>
        <span style={styles.dotRed} />
        <span style={styles.dotYellow} />
        <span style={styles.dotGreen} />
        <span style={styles.terminalTitle}>Pendragon remote MCP demo</span>
      </div>
      <div style={styles.terminalBody}>
        <Prompt text="$env:PENDRAGON_URL = 'http://windows-host:7573/mcp'" show={frame > 45} />
        <Prompt text="$env:PENDRAGON_TOKEN = '<redacted>'" show={frame > 55} />
        {visible.map((command) => (
          <div key={command.text}>
            <Prompt text={command.text} show />
            <pre style={styles.result}>{command.result}</pre>
          </div>
        ))}
        {frame > 295 ? <div style={styles.success}>No screenshots. No RDP mouse control. Just MCP tools.</div> : null}
      </div>
    </div>
  );
}

function Prompt({ text, show }: { text: string; show: boolean }) {
  return show ? (
    <div style={styles.prompt}>
      <span style={styles.promptMark}>PS&gt;</span>
      <span>{text}</span>
    </div>
  ) : null;
}

const styles: Record<string, React.CSSProperties> = {
  canvas: {
    background: "linear-gradient(135deg, #10131b 0%, #161a24 45%, #101820 100%)",
    color: "#f6f7fb",
    fontFamily: "Inter, Segoe UI, Arial, sans-serif",
    overflow: "hidden"
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    maskImage: "radial-gradient(circle at 50% 35%, black, transparent 72%)"
  },
  hero: {
    position: "absolute",
    left: 64,
    top: 54,
    width: 720
  },
  badge: {
    display: "inline-block",
    color: "#5dd6c5",
    border: "1px solid rgba(93,214,197,.45)",
    padding: "8px 12px",
    borderRadius: 6,
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 20
  },
  title: {
    fontSize: 44,
    lineHeight: 1.05,
    margin: 0,
    letterSpacing: 0,
    maxWidth: 720
  },
  subtitle: {
    fontSize: 28,
    lineHeight: 1.25,
    color: "#c6d0df",
    marginTop: 20,
    maxWidth: 760
  },
  diagram: {
    position: "absolute",
    top: 298,
    left: 64,
    display: "flex",
    alignItems: "center",
    gap: 18
  },
  node: {
    width: 182,
    minHeight: 76,
    border: "2px solid #5dd6c5",
    borderRadius: 8,
    padding: "18px 20px",
    background: "rgba(20,24,34,.88)",
    display: "flex",
    flexDirection: "column",
    gap: 7,
    transition: "opacity .2s",
    fontSize: 24
  },
  lineWrap: {
    width: 70,
    height: 2,
    display: "flex",
    alignItems: "center"
  },
  line: {
    width: "100%",
    height: 3,
    background: "#e43f5a"
  },
  terminal: {
    position: "absolute",
    left: 64,
    right: 64,
    bottom: 48,
    height: 250,
    background: "rgba(6, 9, 13, .92)",
    border: "1px solid rgba(255,255,255,.16)",
    borderRadius: 8,
    overflow: "hidden",
    boxShadow: "0 24px 80px rgba(0,0,0,.42)"
  },
  terminalBar: {
    height: 42,
    background: "#202633",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 16px"
  },
  terminalTitle: {
    color: "#9fb0c6",
    fontSize: 17,
    marginLeft: 10
  },
  dotRed: { width: 12, height: 12, borderRadius: 12, background: "#e43f5a" },
  dotYellow: { width: 12, height: 12, borderRadius: 12, background: "#f5c542" },
  dotGreen: { width: 12, height: 12, borderRadius: 12, background: "#5dd67a" },
  terminalBody: {
    padding: "18px 22px",
    fontFamily: "Cascadia Mono, Consolas, monospace",
    fontSize: 21,
    lineHeight: 1.42
  },
  prompt: {
    display: "flex",
    gap: 12,
    whiteSpace: "pre-wrap"
  },
  promptMark: {
    color: "#5dd6c5"
  },
  result: {
    margin: "4px 0 10px 44px",
    color: "#e7edf8",
    font: "inherit",
    whiteSpace: "pre-wrap"
  },
  success: {
    color: "#5dd67a",
    marginTop: 8,
    fontWeight: 700
  },
  footer: {
    position: "absolute",
    right: 64,
    top: 74,
    width: 310,
    color: "#c6d0df",
    fontSize: 25,
    lineHeight: 1.28,
    textAlign: "right"
  }
};
