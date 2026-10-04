"use client";

import { Button } from "@/components/ui/button";

export function NotFoundView({ path }: { path: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="text-center" role="status">
        <p className="font-mono text-xs text-muted-foreground">{path}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The view you are looking for doesn&apos;t exist in the Growth Engine. Head back to the
          workshop page to continue the demo.
        </p>
        <Button className="mt-5" onClick={() => (window.location.hash = "#/")}>
          Back to workshop
        </Button>
      </div>
    </div>
  );
}
