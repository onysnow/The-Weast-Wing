import { createServerFn } from "@tanstack/react-start";
import { incidents } from "@/data/incidents";
import {
  incidentSubmissionSchema,
  pollIdSchema,
  voteSchema,
} from "@/lib/incident-community.schemas";

const incidentIds = new Set(incidents.map((incident) => incident.slug));

export const submitIncidentReport = createServerFn({ method: "POST" })
  .inputValidator((input) => incidentSubmissionSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true };

    const today = new Date().toISOString().slice(0, 10);
    const earliest = new Date();
    earliest.setUTCFullYear(earliest.getUTCFullYear() - 10);
    if (data.incidentDate > today || data.incidentDate < earliest.toISOString().slice(0, 10)) {
      throw new Error("Choose a date within the last ten years.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("incident_submissions").insert({
      incident_date: data.incidentDate,
      headline: data.headline,
      description: data.description,
      location: data.location || null,
      source_url: data.sourceUrl,
      contact_email: data.contactEmail || null,
      status: "pending",
    });
    if (error) throw new Error("The report could not be submitted. Please try again.");
    return { ok: true };
  });

export const getIncidentPoll = createServerFn({ method: "GET" })
  .inputValidator((input) => pollIdSchema.parse(input))
  .handler(async ({ data }) => {
    if (!incidentIds.has(data.incidentId)) throw new Error("Unknown incident.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("incident_votes")
      .select("choice")
      .eq("incident_id", data.incidentId);
    if (error) {
      console.error("[poll] totals failed", error);
      throw new Error("Poll totals are temporarily unavailable.");
    }
    return {
      nothingHappened: rows.filter((row) => row.choice === "nothing_happened").length,
      definitelyHappened: rows.filter((row) => row.choice === "definitely_happened").length,
    };
  });

type PollTotals = Record<string, { nothingHappened: number; definitelyHappened: number }>;

/**
 * Whether the database aggregate is callable by this role. Unknown until the
 * first attempt; once it fails we stop paying for a doomed round-trip (and a
 * log line) on every page load.
 */
let pollAggregateAvailable: boolean | undefined;

/**
 * Every page load used to pull the entire votes table down and count it in
 * JavaScript. The database has done the aggregation since the first migration
 * — `get_incident_poll_totals()` — it just was not callable by the server
 * role. We prefer the aggregate and keep the old path as a fallback so polls
 * survive a deployment where the grant has not been applied yet.
 */
export const getAllIncidentPolls = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  if (pollAggregateAvailable !== false) {
    const { data: aggregated, error: rpcError } = await supabaseAdmin.rpc(
      "get_incident_poll_totals",
    );
    if (!rpcError && aggregated) {
      pollAggregateAvailable = true;
      const totals: PollTotals = {};
      for (const row of aggregated) {
        totals[row.incident_id] = {
          nothingHappened: Number(row.nothing_happened ?? 0),
          definitelyHappened: Number(row.definitely_happened ?? 0),
        };
      }
      return totals;
    }
    if (rpcError) {
      pollAggregateAvailable = false;
      console.warn(
        "[poll] aggregate unavailable, counting rows instead (apply the migration to fix)",
        rpcError.message,
      );
    }
  }

  const { data: rows, error } = await supabaseAdmin
    .from("incident_votes")
    .select("incident_id, choice");
  if (error) {
    console.error("[poll] bulk totals failed", error);
    throw new Error("Poll totals are temporarily unavailable.");
  }
  const totals: PollTotals = {};
  for (const row of rows) {
    const entry = (totals[row.incident_id] ??= { nothingHappened: 0, definitelyHappened: 0 });
    if (row.choice === "nothing_happened") entry.nothingHappened += 1;
    else if (row.choice === "definitely_happened") entry.definitelyHappened += 1;
  }
  return totals;
});

export const castIncidentVote = createServerFn({ method: "POST" })
  .inputValidator((input) => voteSchema.parse(input))
  .handler(async ({ data }) => {
    if (!incidentIds.has(data.incidentId)) throw new Error("Unknown incident.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("incident_votes").upsert(
      {
        incident_id: data.incidentId,
        voter_token: data.voterToken,
        choice: data.choice,
      },
      { onConflict: "incident_id,voter_token" },
    );
    if (error) throw new Error("Your vote could not be recorded. Please try again.");

    const { data: rows, error: totalsError } = await supabaseAdmin
      .from("incident_votes")
      .select("choice")
      .eq("incident_id", data.incidentId);
    if (totalsError) throw new Error("Your vote was saved, but totals could not be refreshed.");
    return {
      nothingHappened: rows.filter((row) => row.choice === "nothing_happened").length,
      definitelyHappened: rows.filter((row) => row.choice === "definitely_happened").length,
    };
  });
