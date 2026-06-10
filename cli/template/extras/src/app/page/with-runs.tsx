import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

import { CreateRun } from "~/app/_components/create-run";
import { RunList } from "~/app/_components/run-list";
import { Button } from "~/components/ui/button";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    void api.run.list.prefetch();
  }

  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold tracking-tight">
              Agent Console
            </span>
            <Show
              when="signed-in"
              fallback={
                <SignInButton mode="modal">
                  <Button size="sm">Sign in</Button>
                </SignInButton>
              }
            >
              <UserButton />
            </Show>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
          <Show when="signed-out">
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                Run agents in your sandbox
              </h1>
              <p className="text-muted-foreground max-w-md text-sm">
                Give an agent a task, watch it execute inside your Trelent
                sandbox, and fork any run to keep the conversation going.
              </p>
              <SignInButton mode="modal">
                <Button>Sign in to get started</Button>
              </SignInButton>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Start a run
              </h1>
              <p className="text-muted-foreground text-sm">
                Pick a model and give the agent a task. It executes inside your
                sandbox via the Trelent orchestrator.
              </p>
            </div>
            <CreateRun />
            <RunList />
          </Show>
        </main>
      </div>
    </HydrateClient>
  );
}
