"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: readonly string[];
};

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <section
            className="rounded-lg border border-slate-200 bg-white shadow-sm"
            key={item.question}
          >
            <h2>
              <button
                aria-controls={panelId}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 rounded-lg px-4 py-4 text-start text-lg font-bold text-slate-950 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2"
                id={buttonId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                type="button"
              >
                <span>{item.question}</span>
                <span className="shrink-0 text-2xl leading-none text-blue-900" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h2>
            <div
              aria-labelledby={buttonId}
              hidden={!isOpen}
              id={panelId}
              role="region"
            >
              <div className="space-y-3 border-t border-slate-200 px-4 py-4 text-base leading-8 text-slate-700">
                {item.answer.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
