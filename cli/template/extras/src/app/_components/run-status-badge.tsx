import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  starting: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  running: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  failed: "bg-destructive/15 text-destructive",
  timeout: "bg-destructive/15 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export function RunStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("capitalize", STATUS_STYLES[status])}
    >
      {status}
    </Badge>
  );
}
