"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "~/components/ai-elements/prompt-input";
import {
  AGENT_MODELS,
  DEFAULT_AGENT_MODEL_ID,
  DEFAULT_PROMPT,
} from "~/lib/models";
import { api } from "~/trpc/react";

export function CreateRun() {
  const router = useRouter();
  const utils = api.useUtils();
  const [modelId, setModelId] = useState<string>(DEFAULT_AGENT_MODEL_ID);

  const createRun = api.run.create.useMutation({
    onSuccess: (run) => {
      // Seed the run page's cache before navigating so it paints instantly,
      // with no loading state or flicker.
      utils.run.get.setData({ id: run.id }, { run, thread: [run] });
      void utils.run.list.invalidate();
      router.push(`/runs/${run.id}`);
    },
  });

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text.trim();
    if (!text || createRun.isPending) return;
    const model = AGENT_MODELS.find((m) => m.id === modelId);
    createRun.mutate({
      prompt: text,
      harness: model?.harness ?? "claude_code",
      model: model?.model,
    });
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputBody>
          <PromptInputTextarea placeholder={DEFAULT_PROMPT} />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputSelect value={modelId} onValueChange={setModelId}>
              <PromptInputSelectTrigger>
                <PromptInputSelectValue placeholder="Model" />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent>
                {AGENT_MODELS.map((model) => (
                  <PromptInputSelectItem key={model.id} value={model.id}>
                    {model.label}
                  </PromptInputSelectItem>
                ))}
              </PromptInputSelectContent>
            </PromptInputSelect>
          </PromptInputTools>
          <PromptInputSubmit
            status={createRun.isPending ? "submitted" : undefined}
            disabled={createRun.isPending}
          />
        </PromptInputFooter>
      </PromptInput>
      {createRun.error ? (
        <p className="text-destructive text-sm">{createRun.error.message}</p>
      ) : null}
    </div>
  );
}
