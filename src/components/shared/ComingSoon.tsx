import { Loader2 } from "lucide-react";

export function ComingSoon() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-(--theme-green-dark)" />
      <p className="font-roboto-slab text-(--text-colour)">Coming Soon</p>
    </div>
  );
}
