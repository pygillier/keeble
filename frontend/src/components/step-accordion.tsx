"use client";

import { useState } from "react";
import { CheckIcon } from "lucide-react";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import type { DocStep } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/i18n/locale-context";

export function StepAccordion({ steps }: { steps: DocStep[] }) {
  const dict = useDictionary();
  const [done, setDone] = useState<Set<number>>(new Set());

  function toggleDone(index: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <Accordion defaultValue={[0]}>
      {steps.map((step, index) => {
        const isDone = done.has(index);
        return (
          <AccordionItem key={index} value={index}>
            <AccordionTrigger>
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isDone ? "bg-leaf text-white" : "bg-mist text-forest"
                  )}
                >
                  {isDone ? <CheckIcon className="size-3.5" /> : index + 1}
                </span>
                <span className={cn(isDone && "text-stone line-through")}>
                  {step.title}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <MarkdownRenderer content={step.body} />
              <button
                type="button"
                onClick={() => toggleDone(index)}
                className="mt-3 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-forest transition-colors hover:bg-mist"
              >
                {isDone
                  ? dict.stepAccordion.done
                  : index === steps.length - 1
                    ? dict.stepAccordion.allDone
                    : dict.stepAccordion.markAsDone}
              </button>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
