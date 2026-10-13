// Hairline UI · command-output · MIT License
// Copyright (c) 2026 Hairline UI · https://hairlineui.com/license#components

import * as React from "react";
import r2wc from "@r2wc/react-to-web-component";
import "./hairline.css";
import { ChevronRight, Square, X } from "./icons";
import { NumberRoll } from "./number-roll";
import { TextMorph } from "./text-morph";

/* ─────────────────────────────────────────────────────────
 * COMMAND OUTPUT: a command the agent runs, and its log
 *
 *   running    $ pnpm test, "running" with seconds that roll, and
 *              Stop; the log streams in and follows the newest line
 *   success    the spinner blurs into a check that draws itself,
 *              "running" morphs to "done" and the time gains its
 *              tenths; Stop folds away as the chevron opens in, and
 *              the log folds away a beat later (open it any time)
 *   error      "exit 1" in red, the code rolling in; the log stays
 *              open with the failing lines marked and in view
 *   cancelled  stopped by you
 *
 * Pass the lines as they arrive; plain strings work, ANSI
 * colour codes are stripped, and lines that look like errors
 * are marked (or set level yourself).
 * ───────────────────────────────────────────────────────── */

export type CommandStatus = "running" | "success" | "error" | "cancelled";

export interface CommandLine {
  text: string;
  level?: "info" | "error" | "warn" | "success";
}

export interface CommandOutputProps extends React.HTMLAttributes<HTMLDivElement> {
  command: string;
  status: CommandStatus;
  lines: (string | CommandLine)[];
  exitCode?: number;
  /** When it started (ms); shows a live timer, then the duration. */
  startedAt?: number;
  endedAt?: number;
  onStop?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const EASE = "cubic-bezier(0.23,1,0.32,1)";
const MORPH = "cubic-bezier(0.16,1,0.3,1)";
const TENTHS = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
const TWO_DIGITS = { minimumIntegerDigits: 2, maximumFractionDigits: 0 };
const WHOLE = { maximumFractionDigits: 0 };
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";
const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g;
const LOOKS_LIKE_ERROR = /(^|\s)(error|err!|failed|fail|fatal|exception|✗|✕|×)(\s|:|$)/i;

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
// preact/compat's `useSyncExternalStore` takes no server snapshot; there is no SSR here.
const useReducedMotion = () =>
  React.useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches);

/** Icons trade places through a blur: the old one shrinks away as the new one grows in. */
const swap = (on: boolean, reduced: boolean): React.CSSProperties => ({
  opacity: on ? 1 : 0,
  transform: on ? "none" : "scale(0.6)",
  filter: on ? "none" : "blur(3px)",
  transition: reduced ? "none" : `opacity 260ms ${MORPH}, transform 380ms ${MORPH}, filter 260ms ${MORPH}`,
});

/** A piece of a line that opens out of nothing and folds back into it. */
function Reveal({ show, reduced, className = "", children }: { show: boolean; reduced: boolean; className?: string; children: React.ReactNode }) {
  return (
    <span
      aria-hidden={!show || undefined}
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: show ? "1fr" : "0fr",
        opacity: show ? 1 : 0,
        filter: show ? "none" : "blur(3px)",
        transition: reduced ? "none" : `grid-template-columns 420ms ${MORPH}, opacity ${show ? "300ms" : "160ms"} ${MORPH}, filter 300ms ${MORPH}`,
      }}
    >
      <span className="flex min-w-0 items-center whitespace-nowrap [clip-path:inset(-4px_-2px)]">{children}</span>
    </span>
  );
}

/** Seconds that roll up as they pass and minutes that slide open; a short finished run gains its tenths ("1.8s"). */
function Elapsed({ ms, settled, reduced }: { ms: number; settled: boolean; reduced: boolean }) {
  const total = Math.max(0, ms) / 1000;
  const minutes = Math.floor(total / 60);
  const tenths = settled && total < 10;
  const seconds = minutes ? Math.floor(total % 60) : tenths ? Math.floor(total * 10) / 10 : Math.floor(total);
  return (
    <span className="inline-flex items-baseline">
      <Reveal show={minutes > 0} reduced={reduced}>
        <NumberRoll value={minutes} suffix="m" duration={500} />
        &nbsp;
      </Reveal>
      <NumberRoll value={seconds} format={minutes ? TWO_DIGITS : tenths ? TENTHS : WHOLE} suffix="s" direction="up" duration={500} />
    </span>
  );
}

function DrawnCheck({ drawn, reduced }: { drawn: boolean; reduced: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-2.5">
      <path
        d="M3 8.5 6.5 12 13 4.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        style={{ strokeDashoffset: drawn ? 0 : 1, transition: drawn && !reduced ? `stroke-dashoffset 380ms ${MORPH} 120ms` : "none" }}
      />
    </svg>
  );
}

export function CommandOutput({
  command,
  status,
  lines,
  exitCode,
  startedAt,
  endedAt,
  onStop,
  open: openProp,
  onOpenChange,
  className = "",
  ...props
}: CommandOutputProps) {
  const reduced = useReducedMotion();
  const running = status === "running";
  const [now, setNow] = React.useState(startedAt ?? 0);
  const [userOpen, setUserOpen] = React.useState<boolean | null>(null);
  const [settled, setSettled] = React.useState(status === "success");
  const logRef = React.useRef<HTMLDivElement>(null);
  const firstError = React.useRef<HTMLDivElement | null>(null);
  const follow = React.useRef(true);
  const stopRef = React.useRef<HTMLButtonElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const id = React.useId();

  // Stop folds away when the run ends; if it had focus, hand it to the chevron that takes its place.
  React.useLayoutEffect(() => {
    if (!running && document.activeElement === stopRef.current) toggleRef.current?.focus({ preventScroll: true });
  }, [running]);

  const rows = React.useMemo(
    () =>
      lines.map((line) => {
        const l = typeof line === "string" ? { text: line } : line;
        const text = l.text.replace(ANSI, "");
        return { text, level: l.level ?? (LOOKS_LIKE_ERROR.test(text) ? "error" : "info") };
      }),
    [lines]
  );

  // Success folds the log a beat after the last line, so the end is seen before it goes.
  React.useEffect(() => {
    if (status !== "success") {
      setSettled(false);
      return;
    }
    const timer = window.setTimeout(() => setSettled(true), reduced ? 0 : 900);
    return () => window.clearTimeout(timer);
  }, [status, reduced]);

  const open = openProp ?? userOpen ?? !(status === "success" ? settled : status === "cancelled");
  const toggle = () => {
    setUserOpen(!open);
    onOpenChange?.(!open);
  };

  React.useEffect(() => {
    if (!running || startedAt === undefined) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [running, startedAt]);

  // Follow the newest line while running, unless the reader scrolled up.
  React.useLayoutEffect(() => {
    const log = logRef.current;
    if (log && follow.current) log.scrollTop = log.scrollHeight;
  }, [rows.length]);

  // On failure, bring the first failing line into view.
  React.useEffect(() => {
    if (status !== "error") return;
    const log = logRef.current;
    const line = firstError.current;
    if (log && line) log.scrollTo({ top: Math.max(0, line.offsetTop - 16), behavior: reduced ? "auto" : "smooth" });
  }, [status, reduced]);

  const elapsedMs = startedAt === undefined ? null : running ? now - startedAt : endedAt !== undefined ? endedAt - startedAt : null;
  const word = { running: "running", success: "done", error: "exit", cancelled: "stopped" }[status];
  const showCode = status === "error" && exitCode !== undefined;
  const canToggle = !running && rows.length > 0;
  let errorSeen = false;

  return (
    <div className={`w-full rounded-[18px] border border-border bg-background p-1 ${className}`} {...props}>
      <div className="flex h-9 items-center gap-2.5 pl-2.5 pr-1">
        <span aria-hidden="true" className="relative flex size-4 shrink-0 items-center justify-center">
          <span className="absolute inset-0 flex items-center justify-center" style={swap(running, reduced)}>
            {/* Spins only while it's showing. */}
            <span className={`size-3 rounded-full border-[1.5px] border-border border-t-foreground/70 motion-reduce:animate-none ${running ? "animate-spin" : ""}`} />
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            style={swap(status === "success", reduced)}
          >
            <DrawnCheck drawn={status === "success"} reduced={reduced} />
          </span>
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-red-500/15 text-red-600 dark:text-red-400" style={swap(status === "error", reduced)}>
            <X className="size-2.5" strokeWidth={3} />
          </span>
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-muted text-muted-foreground" style={swap(status === "cancelled", reduced)}>
            <Square className="size-2" fill="currentColor" />
          </span>
        </span>

        <code className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-foreground">
          <span className="select-none text-muted-foreground">$ </span>
          {command}
        </code>

        {/* One status: the word morphs, the exit code rolls in, the time rolls on and settles. */}
        <span
          aria-hidden="true"
          className={`flex shrink-0 items-baseline font-mono text-[11.5px] tabular-nums transition-colors duration-300 ${status === "error" ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
        >
          <TextMorph>{word}</TextMorph>
          {exitCode !== undefined && (
            <Reveal show={showCode} reduced={reduced}>
              &nbsp;
              <NumberRoll value={showCode ? exitCode : 0} duration={600} />
            </Reveal>
          )}
          {elapsedMs !== null && (
            <span className={`pl-2 transition-colors duration-300 ${status === "error" ? "text-muted-foreground" : ""}`}>
              <Elapsed ms={elapsedMs} settled={!running} reduced={reduced} />
            </span>
          )}
        </span>
        <span role="status" className="sr-only">
          {running ? "Running" : status === "success" ? "Finished" : status === "error" ? `Failed${exitCode !== undefined ? ` with exit code ${exitCode}` : ""}` : "Stopped"}
        </span>

        {onStop && (
          <Reveal show={running} reduced={reduced} className="shrink-0">
            <button
              ref={stopRef}
              type="button"
              inert={!running}
              onClick={onStop}
              aria-label="Stop command"
              className={`cursor-pointer flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${FOCUS}`}
            >
              <Square className="size-2.5" fill="currentColor" />
              Stop
            </button>
          </Reveal>
        )}
        {rows.length > 0 && (
          <Reveal show={canToggle} reduced={reduced} className="shrink-0">
            <button
              ref={toggleRef}
              type="button"
              inert={!canToggle}
              aria-expanded={open}
              aria-controls={id}
              aria-label={open ? "Hide output" : "Show output"}
              onClick={toggle}
              className={`cursor-pointer flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${FOCUS}`}
            >
              <ChevronRight
                className="size-3.5 transition-transform duration-300 motion-reduce:transition-none"
                style={{ transform: open ? "rotate(90deg)" : "none", transitionTimingFunction: EASE }}
              />
            </button>
          </Reveal>
        )}
      </div>

      <div
        id={id}
        inert={!open}
        className="grid"
        style={{ gridTemplateRows: open && rows.length ? "1fr" : "0fr", transition: reduced ? "none" : `grid-template-rows 420ms ${EASE}` }}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            ref={logRef}
            role="log"
            aria-label={`Output of ${command}`}
            tabIndex={0}
            onScroll={(e) => {
              const el = e.currentTarget;
              follow.current = el.scrollHeight - el.clientHeight - el.scrollTop < 24;
            }}
            className="max-h-56 overflow-y-auto overflow-x-hidden rounded-[14px] bg-muted/70 py-2.5 font-mono text-[11.5px] leading-[1.65] outline-none [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
          >
            {rows.map((row, i) => {
              const isError = row.level === "error";
              const ref = isError && !errorSeen ? ((errorSeen = true), firstError) : undefined;
              return (
                <div
                  key={i}
                  ref={ref}
                  className={`whitespace-pre-wrap break-words px-3 animate-[ui-fade-in_160ms_ease-out_both] motion-reduce:animate-none ${
                    isError
                      ? "bg-red-500/[0.08] text-red-700 dark:text-red-300"
                      : row.level === "warn"
                        ? "text-amber-700 dark:text-amber-300"
                        : row.level === "success"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-foreground/75"
                  }`}
                >
                  {row.text || " "}
                </div>
              );
            })}
            {running && (
              <div aria-hidden="true" className="px-3">
                <span className="inline-block h-3.5 w-[7px] translate-y-[2px] bg-foreground/60 animate-[ui-blink_1s_steps(1)_infinite]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * THE CUSTOM ELEMENT: <command-output command="pnpm test" status="running">
 *
 * `lines` is JSON — ["one line", {"text":"boom","level":"error"}] — and
 * grows as the log streams. `on-stop` names a function on `window` (r2wc's
 * convention for function props), which is how the Stop button is wired.
 * ───────────────────────────────────────────────────────── */

type CommandOutputElementProps = {
  command?: string;
  status?: CommandStatus;
  lines?: (string | CommandLine)[];
  exitCode?: number;
  startedAt?: number;
  endedAt?: number;
  onStop?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const CommandOutputElement = r2wc(
  ({
    command = "",
    status = "running",
    lines = [],
    exitCode,
    startedAt,
    endedAt,
    onStop,
    open,
    onOpenChange,
  }: CommandOutputElementProps) => (
    <CommandOutput
      command={command}
      status={status}
      lines={lines}
      exitCode={exitCode}
      startedAt={startedAt}
      endedAt={endedAt}
      onStop={onStop}
      open={open}
      onOpenChange={onOpenChange}
    />
  ),
  {
    props: {
      command: "string",
      status: "string",
      lines: "json",
      exitCode: "number",
      startedAt: "number",
      endedAt: "number",
      onStop: "function",
      open: "boolean",
      onOpenChange: "function",
    },
  },
);

export default CommandOutputElement;
