import { z } from "zod";

export const mailingListSignupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "An email address is required." })
    .email({ message: "That does not look like a valid email address." })
    .max(255, { message: "That email address is too long." }),
  // Honeypot. Real people never see this field, so anything in it is a bot.
  website: z.string().max(0).optional().default(""),
});

export type MailingListSignupInput = z.infer<typeof mailingListSignupSchema>;
