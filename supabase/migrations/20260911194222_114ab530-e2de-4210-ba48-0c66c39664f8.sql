CREATE TABLE public.incident_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_date date NOT NULL,
  headline text NOT NULL CHECK (char_length(headline) BETWEEN 5 AND 140),
  description text NOT NULL CHECK (char_length(description) BETWEEN 20 AND 2000),
  location text CHECK (location IS NULL OR char_length(location) <= 160),
  source_url text NOT NULL CHECK (char_length(source_url) <= 1000 AND source_url ~* '^https?://'),
  contact_email text CHECK (contact_email IS NULL OR char_length(contact_email) <= 255),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.incident_submissions TO service_role;
ALTER TABLE public.incident_submissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.incident_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id text NOT NULL CHECK (char_length(incident_id) BETWEEN 1 AND 120),
  voter_token uuid NOT NULL,
  choice text NOT NULL CHECK (choice IN ('nothing_happened', 'definitely_happened')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (incident_id, voter_token)
);
GRANT ALL ON public.incident_votes TO service_role;
ALTER TABLE public.incident_votes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.submit_incident_report(
  p_incident_date date,
  p_headline text,
  p_description text,
  p_location text,
  p_source_url text,
  p_contact_email text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF p_incident_date > current_date OR p_incident_date < current_date - interval '10 years' THEN
    RAISE EXCEPTION 'Incident date is outside the allowed range';
  END IF;
  IF char_length(trim(p_headline)) NOT BETWEEN 5 AND 140 THEN
    RAISE EXCEPTION 'Invalid headline';
  END IF;
  IF char_length(trim(p_description)) NOT BETWEEN 20 AND 2000 THEN
    RAISE EXCEPTION 'Invalid description';
  END IF;
  IF p_source_url !~* '^https?://' OR char_length(p_source_url) > 1000 THEN
    RAISE EXCEPTION 'Invalid source URL';
  END IF;

  INSERT INTO public.incident_submissions (
    incident_date, headline, description, location, source_url, contact_email
  ) VALUES (
    p_incident_date,
    trim(p_headline),
    trim(p_description),
    nullif(trim(p_location), ''),
    trim(p_source_url),
    nullif(trim(p_contact_email), '')
  ) RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.cast_incident_vote(
  p_incident_id text,
  p_voter_token uuid,
  p_choice text
)
RETURNS TABLE(nothing_happened bigint, definitely_happened bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_incident_id !~ '^[a-z0-9-]{1,120}$' THEN
    RAISE EXCEPTION 'Invalid incident';
  END IF;
  IF p_choice NOT IN ('nothing_happened', 'definitely_happened') THEN
    RAISE EXCEPTION 'Invalid vote';
  END IF;

  INSERT INTO public.incident_votes (incident_id, voter_token, choice)
  VALUES (p_incident_id, p_voter_token, p_choice)
  ON CONFLICT (incident_id, voter_token)
  DO UPDATE SET choice = excluded.choice, updated_at = now();

  RETURN QUERY
  SELECT
    count(*) FILTER (WHERE v.choice = 'nothing_happened'),
    count(*) FILTER (WHERE v.choice = 'definitely_happened')
  FROM public.incident_votes v
  WHERE v.incident_id = p_incident_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_incident_poll_totals()
RETURNS TABLE(incident_id text, nothing_happened bigint, definitely_happened bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    v.incident_id,
    count(*) FILTER (WHERE v.choice = 'nothing_happened'),
    count(*) FILTER (WHERE v.choice = 'definitely_happened')
  FROM public.incident_votes v
  GROUP BY v.incident_id;
$$;

REVOKE ALL ON FUNCTION public.submit_incident_report(date, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cast_incident_vote(text, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_incident_poll_totals() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_incident_report(date, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cast_incident_vote(text, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_incident_poll_totals() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_incident_submissions_updated_at
BEFORE UPDATE ON public.incident_submissions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_incident_votes_updated_at
BEFORE UPDATE ON public.incident_votes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();