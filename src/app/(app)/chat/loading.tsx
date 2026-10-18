export default function ChatLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div
        className="m-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 px-4 py-6 sm:gap-6"
        aria-hidden
      >
        <div className="flex flex-col items-center gap-2.5">
          <div className="h-9 w-40 rounded-lg bg-muted animate-pulse sm:h-10" />
          <div className="h-9 w-64 max-w-full rounded-lg bg-muted animate-pulse sm:h-10 sm:w-80" />
          <div className="mt-1 h-4 w-72 max-w-full rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="h-24 w-full rounded-3xl bg-muted animate-pulse" />
        <div className="flex max-w-xl flex-wrap justify-center gap-2">
          {["w-40", "w-52", "w-44", "w-52"].map((width) => (
            <div
              key={width}
              className={`h-11 max-w-full rounded-full bg-muted animate-pulse ${width}`}
            />
          ))}
        </div>
      </div>
      <output className="sr-only">Loading your coach…</output>
    </div>
  );
}
