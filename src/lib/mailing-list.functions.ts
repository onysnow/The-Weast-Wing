import { createServerFn } from "@tanstack/react-start";
import { mailingListSignupSchema } from "@/lib/mailing-list.schemas";

/**
 * Mailing-list signup.
 *
 * This used to insert into `email_subscribers` straight from the browser with
 * the publishable key, which meant anyone could fill the table with a curl
 * loop. Signups now go through here, matching how incident submissions and
 * votes already work, and the accompanying migration revokes the browser's
 * INSERT grant.
 *
 * The response is deliberately the same whether the address is new or already
 * on the list: reporting the difference let anyone test whether a given person
 * had subscribed.
 */
export const subscribeToMailingList = createServerFn({ method: "POST" })
  .inputValidator((input) => mailingListSignupSchema.parse(input))
  .handler(async ({ data }) => {
    // Silently accept the bot so it has nothing to tune against.
    if (data.website) return { ok: true as const };

    const email = data.email.toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("email_subscribers").insert({ email });

    // 23505 = unique violation, i.e. already subscribed. Same answer as success.
    if (error && error.code !== "23505") {
      console.error("[mailing-list] signup failed", error);
      throw new Error("The Bureau could not process that. Please try again.");
    }

    return { ok: true as const };
  });
