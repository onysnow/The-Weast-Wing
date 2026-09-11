import { createServerFn } from "@tanstack/react-start";
import { incidents } from "@/data/incidents";
import {
  incidentSubmissionSchema,
  pollIdSchema,
  voteSchema,
} from "@/lib/incident-community.schemas";

const incidentIds = new Set(incidents.map((incident) => incident.id));

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
    if (error) throw new Error("Poll totals are temporarily unavailable.");
    return {
      nothingHappened: rows.filter((row) => row.choice === "nothing_happened").length,
      definitelyHappened: rows.filter((row) => row.choice === "definitely_happened").length,
    };
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
