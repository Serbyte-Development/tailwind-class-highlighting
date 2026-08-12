export function HighlightingPreview() {
  return (
    <article className="group card-glow mx-auto flex w-[720px] max-w-full flex-col gap-5 rounded-[28px] border border-slate-700/60 bg-slate-950 p-6 shadow-2xl md:flex-row md:items-center tablet:gap-8 @card:flex-row hover:border-sky-400/70 hocus:bg-brand/10 focus-within:ring-2 focus-within:ring-sky-400/40 [&_svg]:size-5 [&_strong]:text-sky-300 !ring-1">
      <svg aria-hidden="true" viewBox="0 0 24 24" />

      <div className="min-w-0 flex-1 space-y-2">
        <strong className="block text-lg font-semibold tracking-tight text-white">
          Tailwind Class Highlighting
        </strong>
        <p className="text-sm leading-6 text-slate-400">
          Responsive, state, arbitrary, custom, and important classes become easier to scan.
        </p>
      </div>

      <button className="rounded-xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 active:scale-[0.98] disabled:opacity-50">
        Preview
      </button>
    </article>
  )
}
