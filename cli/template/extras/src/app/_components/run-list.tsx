"use client";

import Link from "next/link";

import { RunStatusBadge } from "~/app/_components/run-status-badge";
import { Card, CardContent } from "~/components/ui/card";
import { agentModelLabel } from "~/lib/models";
import { api } from "~/trpc/react";

export function RunList() {
  const { data: runs } = api.run.list.useQuery();

  if (!runs?.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-muted-foreground text-sm font-medium">
        Recent runs
      </h2>
      <div className="flex flex-col gap-2">
        {runs.map((run) => (
          <Link key={run.id} href={`/runs/${run.id}`}>
            <Card className="hover:bg-accent/50 py-3 transition-colors">
              <CardContent className="flex items-center justify-between gap-4 px-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{run.prompt}</p>
                  <p className="text-muted-foreground text-xs">
                    {agentModelLabel(run.harness, run.model)} ·{" "}
                    {run.createdAt.toLocaleString()}
                    {run.parentId ? " · fork" : ""}
                  </p>
                </div>
                <RunStatusBadge status={run.status} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
