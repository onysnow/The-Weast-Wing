GRANT INSERT ON public.email_subscribers TO anon, authenticated;
CREATE POLICY "Anyone can subscribe" ON public.email_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);