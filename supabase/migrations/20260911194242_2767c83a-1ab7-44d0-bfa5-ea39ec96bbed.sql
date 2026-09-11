REVOKE EXECUTE ON FUNCTION public.submit_incident_report(date, text, text, text, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cast_incident_vote(text, uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_incident_poll_totals() FROM anon, authenticated;

CREATE POLICY "Service role manages incident submissions"
ON public.incident_submissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role manages incident votes"
ON public.incident_votes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);