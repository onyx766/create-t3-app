/**
 * Harness + model combinations offered in the UI. The Trelent orchestrator
 * runs each prompt with one of these agent harnesses inside your sandbox.
 */
export const AGENT_MODELS = [
  {
    id: "claude-code-sonnet",
    label: "Claude Code · Sonnet",
    harness: "claude_code",
    model: "sonnet",
  },
  {
    id: "claude-code-opus",
    label: "Claude Code · Opus",
    harness: "claude_code",
    model: "opus",
  },
  {
    id: "claude-code-haiku",
    label: "Claude Code · Haiku",
    harness: "claude_code",
    model: "haiku",
  },
  {
    id: "codex",
    label: "OpenAI Codex",
    harness: "codex",
    model: undefined,
  },
] as const;

export type AgentModel = (typeof AGENT_MODELS)[number];

export const DEFAULT_AGENT_MODEL_ID: AgentModel["id"] = "claude-code-sonnet";

export const DEFAULT_PROMPT =
  "Write hello world in Python with a unique flair";

export const agentModelLabel = (harness: string, model: string | null) =>
  AGENT_MODELS.find(
    (m) => m.harness === harness && (m.model ?? null) === model
  )?.label ?? harness;
