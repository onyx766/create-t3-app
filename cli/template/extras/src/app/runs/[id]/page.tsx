import { RunThread } from "~/app/_components/run-thread";
import { api, HydrateClient } from "~/trpc/server";

export default async function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  void api.run.get.prefetch({ id });

  return (
    <HydrateClient>
      <RunThread id={id} />
    </HydrateClient>
  );
}
