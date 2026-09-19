import { z } from "zod";

export const mailingListSignupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "An email address is required." })
    .email({ message: "That does not look like a valid email address." })
    .max(255, { message: "That email address is too long." }),
  // Honeypot. Real people never see this field, so anything in it is a bot.
  // Deliberately permissive: if the schema rejected a filled honeypot the
  // request would fail validation and the bot would get a visible error to
  // tune against. Accept it here and drop it silently in the handler.
  website: z.string().max(500).optional().default(""),
});

export type MailingListSignupInput = z.infer<typeof mailingListSignupSchema>;
