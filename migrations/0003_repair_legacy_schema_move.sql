-- Feature Pack: erp-shell-core
-- Purpose: Explicit, one-time repair for legacy installs where tables were created in the
-- old schema (hit_dashboard) instead of the project schema (current_schema()).
--
-- This is NOT runner magic. It's a real migration file that can be applied intentionally
-- (and is safe to no-op on fresh installs).
--
-- Behavior:
-- - If schema hit_dashboard doesn't exist: no-op
-- - For each base table in hit_dashboard: move it to current_schema() only if the target
--   schema doesn't already contain a table with the same name.
--
-- Why:
-- - Prevent "relation does not exist" when DATABASE_URL search_path points at the new schema.

DO $$
DECLARE
  src_schema text := 'hit_dashboard';
  dst_schema text := current_schema();
  r record;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = src_schema) THEN
    RETURN;
  END IF;

  FOR r IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = src_schema
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  LOOP
    IF to_regclass(format('%I.%I', dst_schema, r.table_name)) IS NOT NULL THEN
      CONTINUE;
    END IF;
    EXECUTE format('ALTER TABLE %I.%I SET SCHEMA %I;', src_schema, r.table_name, dst_schema);
  END LOOP;
END $$;

