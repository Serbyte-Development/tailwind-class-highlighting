export function HighlightingPreview() {
  return (
    <div
      className={`
        flex items-center gap-4 rounded-xl bg-slate-950 p-6
        md:gap-6 tablet:p-8 @card:flex-row
        hover:bg-slate-900 focus-within:ring-2 hocus:border-brand
        w-[1600px] [&_strong]:text-sky-300
        card-glow ring-2!
      `}
    >
      <strong>Tailwind Class Highlighting</strong>
    </div>
  )
}
