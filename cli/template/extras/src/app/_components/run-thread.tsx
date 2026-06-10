"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";
import { Loader } from "~/components/ai-elements/loader";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "~/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "~/components/ai-elements/prompt-input";
import { RunStatusBadge } from "~/app/_components/run-status-badge";
import { Button } from "~/components/ui/button";
import { agentModelLabel } from "~/lib/models";
import { api, type RouterOutputs } from "~/trpc/react";

type RunData = RouterOutputs["run"]["get"]["run"];

const TERMINAL_STATUSES = new Set([
  "completed",
  "failed",
  "timeout",
  "cancelled",
]);

const IN_FLIGHT_LABEL: Record<string, string> = {
  pending: "Waiting for the orchestrator…",
  starting: "Starting your sandbox…",
  running: "The agent is working…",
};

function AssistantReply({ run }: { run: RunData }) {
  if (run.response) {
    return <MessageResponse>{run.response}</MessageResponse>;
  }
  if (run.status === "failed" || run.status === "timeout") {
    return (
      <p className="text-destructive text-sm">
        {run.error ?? `This run ${run.status === "timeout" ? "timed out" : "failed"}.`}
      </p>
    );
  }
  if (run.status === "cancelled") {
    return <p className="text-muted-foreground text-sm">This run was cancelled.</p>;
  }
  if (run.status === "completed") {
    return (
      <p className="text-muted-foreground text-sm">
        The run completed without any output.
      </p>
    );
  }
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-sm">
      <Loader />
      {IN_FLIGHT_LABEL[run.status] ?? "Working…"}
    </div>
  );
}

export function RunThread({ id }: { id: string }) {
  const router = useRouter();
  const utils = api.useUtils();
  const [pendingReply, setPendingReply] = useState<string | null>(null);

  const { data, error } = api.run.get.useQuery(
    { id },
    {
      refetchInterval: (query) => {
        const status = query.state.data?.run.status;
        return status && TERMINAL_STATUSES.has(status) ? false : 2000;
      },
    }
  );

  const fork = api.run.fork.useMutation({
    onSuccess: (run) => {
      // Seed the forked run's cache with the thread we are already showing,
      // then navigate. The new page paints the exact same conversation (plus
      // the in-flight reply), so the transition is seamless - it feels like
      // the agent simply starts responding.
      utils.run.get.setData(
        { id: run.id },
        { run, thread: [...(data?.thread ?? []), run] }
      );
      void utils.run.list.invalidate();
      router.push(`/runs/${run.id}`);
    },
    onError: () => setPendingReply(null),
  });

  const handleReply = (message: PromptInputMessage) => {
    const text = message.text.trim();
    if (!text || fork.isPending) return;
    setPendingReply(text);
    fork.mutate({ runId: id, prompt: text });
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-sm">{error.message}</p>
        <Button asChild variant="outline">
          <Link href="/">Back to runs</Link>
        </Button>
      </div>
    );
  }

  const thread = data?.thread ?? [];
  const leaf = data?.run;
  const canReply =
    !!leaf && TERMINAL_STATUSES.has(leaf.status) && !fork.isPending;

  return (
    <div className="mx-auto flex h-screen w-full max-w-3xl flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href="/" aria-label="Back to runs">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {thread[0]?.prompt ?? "Run"}
            </p>
            {leaf ? (
              <p className="text-muted-foreground text-xs">
                {agentModelLabel(leaf.harness, leaf.model)}
              </p>
            ) : null}
          </div>
        </div>
        {leaf ? <RunStatusBadge status={leaf.status} /> : null}
      </header>

      <Conversation>
        <ConversationContent>
          {thread.map((run) => (
            <div key={run.id} className="flex flex-col gap-8">
              <Message from="user">
                <MessageContent>{run.prompt}</MessageContent>
              </Message>
              <Message from="assistant">
                <MessageContent>
                  <AssistantReply run={run} />
                </MessageContent>
              </Message>
            </div>
          ))}
          {pendingReply ? (
            <div className="flex flex-col gap-8">
              <Message from="user">
                <MessageContent>{pendingReply}</MessageContent>
              </Message>
              <Message from="assistant">
                <MessageContent>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Loader />
                    Forking this run…
                  </div>
                </MessageContent>
              </Message>
            </div>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t p-4">
        <PromptInput onSubmit={handleReply}>
          <PromptInputBody>
            <PromptInputTextarea
              placeholder={
                canReply
                  ? "Reply to fork this run…"
                  : "You can reply once the run finishes…"
              }
              disabled={!canReply}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit
              status={fork.isPending ? "submitted" : undefined}
              disabled={!canReply}
            />
          </PromptInputFooter>
        </PromptInput>
        {fork.error ? (
          <p className="text-destructive mt-2 text-sm">{fork.error.message}</p>
        ) : null}
      </div>
    </div>
  );
}
