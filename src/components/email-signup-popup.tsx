import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Seal } from "@/components/site";

const STORAGE_KEY = "weast-wing-mailing-list";

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "An email address is required." })
  .email({ message: "That does not look like a valid email address." })
  .max(255, { message: "That email address is too long." });

export function EmailSignupPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY)) return;
    const timer = window.setTimeout(() => setVisible(true), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      /* storage unavailable */
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    setStatus("saving");
    const { error: insertError } = await supabase
      .from("email_subscribers")
      .insert({ email: parsed.data.toLowerCase() });

    if (insertError && insertError.code !== "23505") {
      setStatus("idle");
      setError("The Bureau could not process that. Please try again.");
      return;
    }
    setStatus("done");
    try {
      window.localStorage.setItem(STORAGE_KEY, "subscribed");
    } catch {
      /* storage unavailable */
    }
    window.setTimeout(() => setVisible(false), 2600);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="mailing-list-title"
      className="animate-fade-in fixed bottom-4 left-4 right-4 z-50 max-w-sm border-2 border-accent bg-card p-4 shadow-2xl sm:left-auto sm:right-6 sm:bottom-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close mailing list notice"
        className="absolute right-1 top-1 flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-4" aria-hidden="true" />
      </button>

      <div className="flex items-start gap-3 pr-7">
        <Seal className="size-9 shrink-0 text-seal" />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent">
            Official Notice
          </p>
          <h2
            id="mailing-list-title"
            className="font-display text-sm font-bold uppercase leading-tight"
          >
            Join the Mailing List
          </h2>
        </div>
      </div>

      {status === "done" ? (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Enrollment recorded. You will be notified the moment the Weast Wing has
          another statement it cannot substantiate.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-2" noValidate>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Receive official updates, incident bulletins, and unconvincing
            defenses of the President.
          </p>
          <label htmlFor="mailing-list-email" className="sr-only">
            Email address
          </label>
          <input
            id="mailing-list-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            maxLength={255}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "mailing-list-error" : undefined}
            className="w-full border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {error && (
            <p id="mailing-list-error" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full border-2 border-accent bg-accent px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.12em] text-accent-foreground transition hover:bg-accent/85 disabled:opacity-60"
          >
            {status === "saving" ? "Filing…" : "Sign me up"}
          </button>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Parody site. We store only your email address.
          </p>
        </form>
      )}
    </div>
  );
}
