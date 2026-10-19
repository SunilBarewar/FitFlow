/* The workspace, drawn as empty furniture: the same two surfaces appear
   where they will be, so nothing jumps when the data lands. */
export default function ChatLoading() {
  return (
    <div className="brand-surface flex h-dvh flex-col overflow-hidden">
      <div className="shrink-0 px-3 pt-3 pt-safe sm:px-4">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between rounded-full border border-line bg-surface pr-2 pl-4 shadow-card sm:pl-5">
          <span className="h-4 w-20 animate-pulse rounded-full bg-sunken" />
          <span className="size-10 animate-pulse rounded-full bg-sunken" />
        </div>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 gap-3 px-3 pt-3 sm:px-4 sm:pt-4">
        <output className="sr-only">Loading your workspace</output>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 rounded-t-[28px] border border-b-0 border-line bg-surface p-5 shadow-card">
          <span className="h-4 w-40 animate-pulse rounded-full bg-sunken" />
          <span className="h-16 w-4/5 animate-pulse rounded-2xl bg-sunken" />
          <span className="h-4 w-32 animate-pulse self-end rounded-full bg-sunken" />
          <span className="h-24 w-full animate-pulse rounded-2xl bg-sunken" />
        </div>

        <div className="hidden min-h-0 w-95 shrink-0 flex-col gap-4 rounded-t-[28px] border border-b-0 border-line bg-surface p-5 shadow-card lg:flex xl:w-105">
          <span className="h-9 w-36 animate-pulse rounded-full bg-sunken" />
          <span className="h-28 w-full animate-pulse rounded-[22px] bg-sunken" />
          <span className="h-16 w-full animate-pulse rounded-2xl bg-sunken" />
          <span className="h-16 w-full animate-pulse rounded-2xl bg-sunken" />
        </div>
      </div>
    </div>
  );
}
