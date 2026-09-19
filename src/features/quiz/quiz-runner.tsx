import { AnimatePresence, m } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { ShareBar } from "@/components/primitives/share-bar";
import { Button } from "@/components/ui/button";
import type { PublicQuiz, QuizOutcome } from "@/content/quiz/types";
import { TRANSITION } from "@/lib/motion";
import {
  decodeAnswers,
  encodeAnswers,
  nextQuestionId,
  personalityOutcome,
  progress,
  visitedQuestions,
} from "@/lib/quiz";
import { cn } from "@/lib/utils";

/**
 * The quiz runner: one component for every quiz shape.
 *
 * It holds a `Record<questionId, optionId>` and nothing else. That is the
 * whole state — the path through the quiz, the progress, the result and the
 * shareable link are all derived from it by the pure functions in
 * src/lib/quiz.ts, which is why those could be tested without rendering
 * anything.
 *
 * No form library. The recommendation for the elaborate *form* work stands
 * (TanStack Form, matching the rest of the stack), but a single-select
 * stepper has one value per step and no validation, and wiring a form
 * library through it would be ceremony with a bundle cost. It goes in when
 * there are fields that need it.
 */
export function QuizRunner({ quiz }: { quiz: PublicQuiz }) {
  const storageKey = `weast-quiz-${quiz.slug}`;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [started, setStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const headingRef = useRef<HTMLParagraphElement>(null);
  const firstRender = useRef(true);

  // A shared link arrives with its answers in the query string; anything else
  // may have a half-finished attempt in this browser.
  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get("a");
    if (encoded) {
      setAnswers(decodeAnswers(quiz, encoded));
      setStarted(true);
      setShowResult(true);
      return;
    }
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setAnswers(parsed as Record<string, string>);
          setStarted(true);
        }
      }
    } catch {
      /* storage unavailable or corrupt — start fresh */
    }
  }, [quiz, storageKey]);

  const path = useMemo(() => visitedQuestions(quiz, answers), [quiz, answers]);
  const state = useMemo(() => progress(quiz, answers), [quiz, answers]);
  const current = state.complete ? null : path[path.length - 1];

  // Moving to a new question replaces everything on screen, which leaves a
  // screen reader silent and the keyboard focus nowhere. Move focus to the
  // new prompt — but not on first paint, which would yank the page down.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [current?.id, showResult]);

  const choose = (questionId: string, optionId: string) => {
    const next = { ...answers, [questionId]: optionId };
    // Answering an earlier question again can invalidate the path after it,
    // so drop anything no longer reachable rather than leaving stale answers
    // to be counted.
    const stillReachable = new Set(visitedQuestions(quiz, next).map((q) => q.id));
    const pruned = Object.fromEntries(
      Object.entries(next).filter(([id]) => stillReachable.has(id)),
    );
    setAnswers(pruned);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(pruned));
    } catch {
      /* storage unavailable */
    }
    if (!nextQuestionId(quiz, questionId, optionId)) setShowResult(true);
  };

  const back = () => {
    if (showResult) {
      setShowResult(false);
      return;
    }
    const previous = path[path.length - 2];
    if (!previous) return;
    const { [previous.id]: _dropped, ...rest } = answers;
    setAnswers(rest);
  };

  const restart = () => {
    setAnswers({});
    setShowResult(false);
    setStarted(false);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* storage unavailable */
    }
    window.history.replaceState(null, "", window.location.pathname);
  };

  if (!started) {
    return (
      <div className="border border-border bg-card p-6 sm:p-8">
        {quiz.intro && (
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{quiz.intro}</p>
        )}
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {quiz.questions.length} questions · no time limit · nothing is recorded
        </p>
        <Button variant="accent" size="block" className="mt-5" onClick={() => setStarted(true)}>
          Begin screening
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-border bg-card">
      <QuizProgress state={state} />

      <AnimatePresence mode="wait" initial={false}>
        {showResult ? (
          <m.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={TRANSITION.base}
          >
            <QuizResult
              quiz={quiz}
              answers={answers}
              headingRef={headingRef}
              onBack={back}
              onRestart={restart}
            />
          </m.div>
        ) : current ? (
          <m.div
            key={current.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={TRANSITION.base}
            className="p-5 sm:p-7"
          >
            <p
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-lg font-bold leading-snug outline-none sm:text-xl"
            >
              {current.prompt}
            </p>
            {current.help && (
              <p className="mt-1 text-xs italic leading-relaxed text-muted-foreground">
                {current.help}
              </p>
            )}

            <Choices
              question={current}
              chosen={answers[current.id]}
              onChoose={(optionId) => choose(current.id, optionId)}
            />

            {path.length > 1 && (
              <Button variant="ghost" size="sm" className="mt-4" onClick={back}>
                ← Previous question
              </Button>
            )}
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ Progress --------------------------------- */

function QuizProgress({
  state,
}: {
  state: { answered: number; total: number; fraction: number; complete: boolean };
}) {
  return (
    <div className="border-b border-border">
      <div className="flex items-baseline justify-between px-5 py-2 sm:px-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {state.complete
            ? "Screening complete"
            : `Question ${state.answered + 1} of ${state.total}`}
        </p>
        <p className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {Math.round(state.fraction * 100)}%
        </p>
      </div>
      <div className="h-1 bg-muted">
        <m.div
          className="h-full bg-accent"
          // The denominator can grow as a branch reveals more questions, so
          // this is animated rather than set: the bar eases to the new
          // position instead of jumping backwards.
          animate={{ width: `${state.fraction * 100}%` }}
          transition={TRANSITION.base}
        />
      </div>
    </div>
  );
}

/* ------------------------------- Choices --------------------------------- */

/**
 * A radio group, built from real radios.
 *
 * Buttons would have been fewer lines, but a radio group is what this is:
 * arrow keys move between options, the group takes one tab stop, and a
 * screen reader announces "2 of 4". Rebuilding that on buttons is how
 * keyboard support gets quietly dropped.
 */
function Choices({
  question,
  chosen,
  onChoose,
}: {
  question: PublicQuiz["questions"][number];
  chosen: string | undefined;
  onChoose: (optionId: string) => void;
}) {
  const name = useId();
  return (
    <fieldset className="mt-5">
      <legend className="sr-only">{question.prompt}</legend>
      <div className="space-y-2">
        {question.options.map((option) => {
          const selected = chosen === option.id;
          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 border p-3 text-sm leading-relaxed transition-colors",
                selected
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-input bg-background hover:bg-muted",
                // The visible focus ring belongs on the box the reader sees,
                // not on the 16px radio inside it.
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={selected}
                onChange={() => onChoose(option.id)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent)] outline-none"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* -------------------------------- Result --------------------------------- */

function QuizResult({
  quiz,
  answers,
  headingRef,
  onBack,
  onRestart,
}: {
  quiz: PublicQuiz;
  answers: Record<string, string>;
  headingRef: React.RefObject<HTMLParagraphElement | null>;
  onBack: () => void;
  onRestart: () => void;
}) {
  const [scored, setScored] = useState<{
    correctCount: number;
    total: number;
    outcome: QuizOutcome | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const encoded = useMemo(() => encodeAnswers(quiz, answers), [quiz, answers]);

  // Put the answers in the address bar so the result is the URL. Replace
  // rather than push: the back button should leave the quiz, not step
  // through every question again.
  useEffect(() => {
    if (!encoded) return;
    const url = `${window.location.pathname}?a=${encoded}`;
    window.history.replaceState(null, "", url);
  }, [encoded]);

  // A scored quiz is graded on the server, because the client was never sent
  // the answer key.
  useEffect(() => {
    if (quiz.strategy !== "scored") return;
    let cancelled = false;
    void (async () => {
      try {
        const { gradeQuiz } = await import("@/lib/quiz.functions");
        const result = await gradeQuiz({ data: { slug: quiz.slug, answers } });
        if (!cancelled) setScored(result);
      } catch {
        if (!cancelled) setError("The Bureau could not score that. Your answers are still here.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quiz.strategy, quiz.slug, answers]);

  const outcome = quiz.strategy === "scored" ? scored?.outcome : personalityOutcome(quiz, answers);

  return (
    <div className="p-5 sm:p-7">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Determination</p>

      {quiz.strategy === "scored" && (
        <p className="mt-1 font-display text-3xl font-black tabular-nums">
          {scored ? `${scored.correctCount} / ${scored.total}` : "Scoring…"}
        </p>
      )}

      <p
        ref={headingRef}
        tabIndex={-1}
        className="mt-1 font-display text-2xl font-bold uppercase leading-tight outline-none sm:text-3xl"
      >
        {outcome?.title ?? (error ? "Inconclusive" : "Processing…")}
      </p>

      {outcome?.kicker && (
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {outcome.kicker}
        </p>
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {outcome && (
        <p className="mt-4 max-w-prose leading-relaxed text-muted-foreground">{outcome.body}</p>
      )}

      <div className="mt-6 border-t border-border pt-5">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Distribute this finding
        </p>
        <ShareBar title={`${outcome?.title ?? quiz.title} — ${quiz.title}`} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Change my last answer
        </Button>
        <Button variant="ghost" size="sm" onClick={onRestart}>
          Start again
        </Button>
      </div>
    </div>
  );
}
