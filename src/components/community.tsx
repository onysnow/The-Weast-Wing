import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  castIncidentVote,
  getIncidentPoll,
  submitIncidentReport,
} from "@/lib/incident-community.functions";
import { incidentSubmissionSchema, type VoteChoice } from "@/lib/incident-community.schemas";
import { cn } from "@/lib/utils";

type Totals = { nothingHappened: number; definitelyHappened: number };

function getVoterToken() {
  const key = "incident-clock-voter-token";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const token = crypto.randomUUID();
  window.localStorage.setItem(key, token);
  return token;
}

export function IncidentPoll({ incidentId }: { incidentId: string }) {
  const getPoll = useServerFn(getIncidentPoll);
  const castVote = useServerFn(castIncidentVote);
  const [totals, setTotals] = useState<Totals>({ nothingHappened: 0, definitelyHappened: 0 });
  const [choice, setChoice] = useState<VoteChoice | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(`incident-vote-${incidentId}`);
    if (saved === "nothing_happened" || saved === "definitely_happened") setChoice(saved);
    getPoll({ data: { incidentId } })
      .then(setTotals)
      .catch(() => setError("Totals unavailable."));
  }, [getPoll, incidentId]);

  const vote = async (nextChoice: VoteChoice) => {
    setPending(true);
    setError("");
    try {
      const nextTotals = await castVote({
        data: { incidentId, voterToken: getVoterToken(), choice: nextChoice },
      });
      setTotals(nextTotals);
      setChoice(nextChoice);
      window.localStorage.setItem(`incident-vote-${incidentId}`, nextChoice);
    } catch {
      setError("Your vote could not be recorded.");
    } finally {
      setPending(false);
    }
  };

  const total = totals.nothingHappened + totals.definitelyHappened;
  const percent = (value: number) => (total ? Math.round((value / total) * 100) : 0);

  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Public assessment
      </p>
      <p className="mt-1 font-display text-base font-bold">What do you think happened?</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant={choice === "nothing_happened" ? "default" : "outline"}
          disabled={pending}
          onClick={() => vote("nothing_happened")}
          className="h-auto min-h-12 whitespace-normal rounded-none py-2"
        >
          Nothing happened
          <span className="tabular-nums opacity-75">{percent(totals.nothingHappened)}%</span>
        </Button>
        <Button
          type="button"
          variant={choice === "definitely_happened" ? "destructive" : "outline"}
          disabled={pending}
          onClick={() => vote("definitely_happened")}
          className="h-auto min-h-12 whitespace-normal rounded-none py-2"
        >
          Just a fart to def shit himself
          <span className="tabular-nums opacity-75">{percent(totals.definitelyHappened)}%</span>
        </Button>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{total.toLocaleString()} public votes</span>
        {choice && <span>Your selection is saved on this browser.</span>}
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
}

export function IncidentSubmissionForm() {
  const submitReport = useServerFn(submitIncidentReport);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError("");
    const form = new FormData(formElement);
    const parsed = incidentSubmissionSchema.safeParse({
      incidentDate: form.get("incidentDate"),
      headline: form.get("headline"),
      description: form.get("description"),
      location: form.get("location"),
      sourceUrl: form.get("sourceUrl"),
      contactEmail: form.get("contactEmail"),
      website: form.get("website"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the report and try again.");
      return;
    }

    setPending(true);
    try {
      await submitReport({ data: parsed.data });
      formElement.reset();
      setSuccess(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Submission failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="border border-border bg-card p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Incident date" htmlFor="incidentDate">
          <Input
            id="incidentDate"
            name="incidentDate"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            required
          />
        </Field>
        <Field label="Location (optional)" htmlFor="location">
          <Input
            id="location"
            name="location"
            maxLength={160}
            placeholder="Where was this allegedly observed?"
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Report headline" htmlFor="headline">
          <Input id="headline" name="headline" minLength={5} maxLength={140} required />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="What allegedly happened?" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            minLength={20}
            maxLength={2000}
            rows={5}
            required
          />
        </Field>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Supporting link" htmlFor="sourceUrl">
          <Input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            maxLength={1000}
            placeholder="https://"
            required
          />
        </Field>
        <Field label="Email (optional, never published)" htmlFor="contactEmail">
          <Input id="contactEmail" name="contactEmail" type="email" maxLength={255} />
        </Field>
      </div>
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="mt-4 border-l-2 border-accent bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
        Reports are held for editorial review and never appear automatically. Submit only links you
        are permitted to share. This form is for satirical commentary, not emergency reports.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={pending}
          className="rounded-none font-bold uppercase tracking-wider"
        >
          {pending ? "Submitting…" : "Submit incident report"}
        </Button>
        <p
          role="status"
          className={cn("text-sm font-semibold", success ? "text-primary" : "text-destructive")}
        >
          {success ? "Report received and queued for review." : error}
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-[0.1em]">
        {label}
      </Label>
      {children}
    </div>
  );
}
