import { Plus } from "lucide-react";
import { SectionHeading } from "./section-heading";

const QUESTIONS = [
  {
    q: "Do I need a gym?",
    a: "No. Tell FitFlow what you can reach — a full rack, a pair of dumbbells, or nothing at all — and the plan is written for that.",
  },
  {
    q: "What if I'm completely new to training?",
    a: "Then you start light and slow. Every exercise comes with form notes and photos, and you can ask the coach what anything means at any point.",
  },
  {
    q: "What happens when I miss a week?",
    a: "Nothing bad. Say what happened and the next week is rebuilt from where you actually are, not from where the old plan assumed you'd be.",
  },
  {
    q: "Can I change an exercise I don't like?",
    a: "Yes — ask for a swap and you get an alternative that works the same muscles with the equipment you have.",
  },
  {
    q: "Is FitFlow a replacement for a doctor or physio?",
    a: "No. It will work around a niggle and keep you moving, but anything painful or persistent belongs with a professional.",
  },
];

export function Faq() {
  return (
    <section id="questions" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading badge="Questions" title="Before you start" />

        <div className="brand-reveal mx-auto mt-14 max-w-3xl divide-y divide-line overflow-hidden rounded-[28px] border border-line bg-surface shadow-card">
          {QUESTIONS.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer list-none items-center gap-4 p-6 text-[17px] font-medium tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
                <span className="flex-1 text-pretty">{item.q}</span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sunken text-ink-muted transition-all duration-200 group-open:rotate-45 group-open:bg-accent-soft group-open:text-accent-edge">
                  <Plus size={15} aria-hidden />
                </span>
              </summary>
              <p className="px-6 pb-6 text-[15px] leading-relaxed text-pretty text-ink-muted">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
