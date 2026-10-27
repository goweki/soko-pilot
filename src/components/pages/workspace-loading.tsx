export function WorkspaceLoading() {
  return (
    <main className="min-h-screen bg-muted/35">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          aria-hidden="true"
          className="hidden w-[264px] shrink-0 border-r border-border/70 bg-background p-6 md:block"
        >
          <div className="h-10 w-36 animate-pulse rounded-xl bg-muted" />
          <div className="mt-10 h-24 animate-pulse rounded-2xl bg-muted" />
          <div className="mt-10 space-y-3">
            <div className="h-10 animate-pulse rounded-xl bg-muted" />
            <div className="h-10 animate-pulse rounded-xl bg-muted" />
            <div className="h-10 animate-pulse rounded-xl bg-muted" />
          </div>
        </aside>
        <div className="flex-1">
          <header className="h-[68px] border-b border-border/70 bg-background/90" />
          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
            <div
              aria-label="Loading workspace"
              className="h-8 w-64 max-w-full animate-pulse rounded-lg bg-muted"
              role="status"
            />
            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="h-36 animate-pulse rounded-2xl bg-card" />
              <div className="h-36 animate-pulse rounded-2xl bg-card" />
              <div className="h-36 animate-pulse rounded-2xl bg-card" />
              <div className="h-36 animate-pulse rounded-2xl bg-card" />
            </div>
            <div className="mt-6 h-72 animate-pulse rounded-2xl bg-card" />
          </div>
        </div>
      </div>
    </main>
  );
}
