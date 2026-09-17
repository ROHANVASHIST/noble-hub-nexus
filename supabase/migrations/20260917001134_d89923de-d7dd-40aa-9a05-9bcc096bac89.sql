
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.study_room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_name text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_name, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.study_room_members TO authenticated;
GRANT ALL ON public.study_room_members TO service_role;

ALTER TABLE public.study_room_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own room membership" ON public.study_room_members;
CREATE POLICY "Users manage own room membership"
ON public.study_room_members FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION private.is_room_member(_room_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.study_room_members m
    WHERE m.room_name = _room_name AND m.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION private.is_room_member(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_room_member(text) TO authenticated, service_role;

INSERT INTO public.study_room_members (room_name, user_id)
SELECT DISTINCT room_name, user_id FROM public.study_room_messages
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can read messages" ON public.study_room_messages;
CREATE POLICY "Members can read messages in their rooms"
ON public.study_room_messages FOR SELECT TO authenticated
USING (private.is_room_member(room_name));

DROP POLICY IF EXISTS "Users can insert own messages" ON public.study_room_messages;
CREATE POLICY "Members can insert own messages"
ON public.study_room_messages FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND private.is_room_member(room_name));

ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
