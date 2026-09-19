-- Close the browser's direct write path into the mailing list, and let the
-- server role use the vote aggregate that already exists.
--
-- Until now email_subscribers granted INSERT to anon with a WITH CHECK (true)
-- policy, so the table could be filled from a plain curl loop with the
-- publishable key. Signups now go through the subscribeToMailingList server
-- function (service role), matching incident submissions and votes.

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscribers;
REVOKE INSERT ON public.email_subscribers FROM anon, authenticated;

CREATE POLICY "Service role manages email subscribers"
ON public.email_subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- The column was a bare TEXT with no shape or length limit, unlike every other
-- user-supplied column in this schema. NOT VALID so existing rows are left
-- alone; it applies to everything written from here on.
ALTER TABLE public.email_subscribers
  ADD CONSTRAINT email_subscribers_email_shape
  CHECK (
    char_length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  )
  NOT VALID;

-- get_incident_poll_totals() has existed since the first migration but its
-- EXECUTE was revoked from PUBLIC and never granted to service_role, so the
-- server has been downloading every vote row and counting them in JavaScript.
GRANT EXECUTE ON FUNCTION public.get_incident_poll_totals() TO service_role;
