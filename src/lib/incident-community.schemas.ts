import { z } from "zod";

export const incidentSubmissionSchema = z.object({
  incidentDate: z.string().date("Enter a valid incident date."),
  headline: z.string().trim().min(5, "Add a little more detail.").max(140),
  description: z.string().trim().min(20, "Please provide at least 20 characters.").max(2000),
  location: z.string().trim().max(160).optional().default(""),
  sourceUrl: z
    .string()
    .trim()
    .url("Enter a complete link.")
    .max(1000)
    .refine(
      (value) => value.startsWith("https://") || value.startsWith("http://"),
      "The link must start with http:// or https://",
    ),
  contactEmail: z.union([z.literal(""), z.string().trim().email("Enter a valid email.").max(255)]),
  // Honeypot. Permissive on purpose: rejecting a filled honeypot in the schema
  // fails the request and shows the bot an error to tune against, and it makes
  // the handler's silent-accept unreachable. Accept it, drop it there.
  website: z.string().max(500).optional().default(""),
});

export const voteSchema = z.object({
  incidentId: z.string().regex(/^[a-z0-9-]{1,120}$/),
  voterToken: z.string().uuid(),
  choice: z.enum(["nothing_happened", "definitely_happened"]),
});

export const pollIdSchema = z.object({
  incidentId: z.string().regex(/^[a-z0-9-]{1,120}$/),
});

export type IncidentSubmissionInput = z.infer<typeof incidentSubmissionSchema>;
export type VoteChoice = z.infer<typeof voteSchema>["choice"];
