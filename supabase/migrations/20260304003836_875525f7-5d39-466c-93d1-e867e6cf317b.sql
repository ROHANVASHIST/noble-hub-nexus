
-- Fix 1: Deny all writes on public content tables (laureates, lectures, research_papers)
-- These are read-only public data tables.

-- laureates: deny INSERT
CREATE POLICY "Deny insert on laureates" ON public.laureates
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);

-- laureates: deny UPDATE
CREATE POLICY "Deny update on laureates" ON public.laureates
  FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);

-- laureates: deny DELETE
CREATE POLICY "Deny delete on laureates" ON public.laureates
  FOR DELETE TO anon, authenticated
  USING (false);

-- lectures: deny INSERT
CREATE POLICY "Deny insert on lectures" ON public.lectures
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);

-- lectures: deny UPDATE
CREATE POLICY "Deny update on lectures" ON public.lectures
  FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);

-- lectures: deny DELETE
CREATE POLICY "Deny delete on lectures" ON public.lectures
  FOR DELETE TO anon, authenticated
  USING (false);

-- research_papers: deny INSERT
CREATE POLICY "Deny insert on research_papers" ON public.research_papers
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);

-- research_papers: deny UPDATE
CREATE POLICY "Deny update on research_papers" ON public.research_papers
  FOR UPDATE TO anon, authenticated
  USING (false) WITH CHECK (false);

-- research_papers: deny DELETE
CREATE POLICY "Deny delete on research_papers" ON public.research_papers
  FOR DELETE TO anon, authenticated
  USING (false);

-- Fix 2: Remove the overly permissive public profiles policy that exposes all user data
DROP POLICY "Public profiles viewable" ON public.profiles;
