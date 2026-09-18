-- Make the mailing list's uniqueness case-insensitive.
--
-- The UNIQUE constraint is on the raw text, and only the server lowercases
-- before inserting. Any other write path — a manual insert, a future import —
-- could create Ony@example.com alongside ony@example.com. This makes the rule
-- structural rather than a convention one caller happens to follow.

CREATE UNIQUE INDEX IF NOT EXISTS email_subscribers_email_lower_idx
  ON public.email_subscribers (lower(email));
